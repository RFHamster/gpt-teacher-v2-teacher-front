# GPT Teacher — Frontend

Frontend Next.js (App Router) com TypeScript, TailwindCSS e React Query.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre em `http://localhost:3000`.

Scripts:

- `dev` — servidor de desenvolvimento (Turbopack)
- `build` / `start` — build e produção
- `lint` / `lint:fix` — ESLint
- `format` / `format:check` — Prettier
- `typecheck` — `tsc --noEmit`

## Deploy na Vercel

O projeto está pronto pra deploy zero-config:

1. **Push** para um repositório Git (GitHub/GitLab/Bitbucket).
2. Na Vercel, **Import Project** apontando para o repo.
3. A Vercel detecta Next.js automaticamente. Não há nada a configurar manualmente —
   o `vercel.json` já fixa região para `gru1` (São Paulo).
4. **Variáveis de ambiente** (Vercel → Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_APP_URL` — URL pública (ex: `https://gpt-teacher.vercel.app`).
   - `NEXT_PUBLIC_API_URL` — URL do backend quando integrar (mock funciona sem isso).
   - Server-only (quando o back chegar): `API_INTERNAL_URL`, `API_TOKEN`, `OPENAI_API_KEY`.

   **Tudo é opcional** no MVP atual: `src/lib/env.ts` usa Zod com defaults, então o build não quebra
   se nada estiver setado. Quando integrar o backend, sobrescreva via dashboard da Vercel.

5. Node 20 fixado em `.nvmrc` e `package.json#engines`.

Deploy via CLI (alternativa):

```bash
npm i -g vercel
vercel        # primeira vez: configura e gera preview
vercel --prod # promove para produção
```

## Filosofia da arquitetura

Estrutura **híbrida**: camadas globais (`components/`, `services/`, `lib/`, `hooks/`,
`utils/`) para o que é reusado em toda a aplicação **+ feature modules** (`features/<feature>`)
para tudo que é específico de um domínio (chat, lessons, students, etc.).

Regras simples:

1. **`app/` é só roteamento.** `page.tsx` e `layout.tsx` ficam finos — orquestram
   componentes vindos de `components/` ou `features/`. Nada de regra de negócio aqui.
2. **Server Components por padrão.** Só marque `"use client"` quando precisar de
   estado, efeitos, eventos do browser ou bibliotecas client-only.
3. **Direção de dependência:**
   `app/` → `features/` → `components/` + `services/` + `hooks/` → `lib/` + `utils/`.
   Camadas mais baixas **nunca** importam de camadas acima.
4. **Feature isolada.** Uma feature só importa de outra via seu `index.ts` (barrel),
   nunca alcançando arquivos internos.
5. **Server Actions vs Route Handlers:** mutations disparadas pela própria UI →
   Server Actions (em `app/.../actions.ts` ou colocadas na feature). APIs públicas,
   webhooks, integrações externas → `app/api/.../route.ts`.

## Árvore de pastas

```
.
├── public/                          Assets estáticos servidos em /
├── src/
│   ├── app/                         App Router — só roteamento
│   │   ├── (auth)/                  Route group: páginas sem header
│   │   │   ├── layout.tsx
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/             Route group: páginas com header
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   └── chat/page.tsx
│   │   ├── api/                     Route handlers (REST público)
│   │   │   └── health/route.ts
│   │   ├── layout.tsx               Root layout (html/body, providers)
│   │   ├── page.tsx                 Home
│   │   ├── loading.tsx              Suspense fallback global
│   │   ├── error.tsx                Error boundary
│   │   ├── not-found.tsx            404
│   │   └── globals.css              Tailwind + CSS variables
│   │
│   ├── components/                  Componentes globais reutilizáveis
│   │   ├── ui/                      Primitivos (Button, Input, ...)
│   │   ├── layout/                  Header, Footer, Sidebar
│   │   └── providers/               QueryClient, Theme, etc.
│   │
│   ├── features/                    Módulos por domínio (auto-contidos)
│   │   └── chat/
│   │       ├── components/          UI da feature
│   │       ├── hooks/               Hooks da feature
│   │       ├── services/            Chamadas de API da feature
│   │       ├── schemas.ts           Validação Zod / DTOs
│   │       ├── types.ts             Tipos do domínio
│   │       └── index.ts             Barrel — única porta de saída
│   │
│   ├── services/                    Camada de API global
│   │   ├── http-client.ts           Axios + interceptors
│   │   └── index.ts
│   │
│   ├── hooks/                       Hooks transversais (não específicos)
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│   │
│   ├── lib/                         Integrações e infra (auth, db, env, log)
│   │   ├── env.ts                   Validação de env vars com Zod
│   │   └── logger.ts
│   │
│   ├── utils/                       Funções puras (sem side-effects)
│   │   ├── cn.ts                    Helper de classes Tailwind
│   │   └── format.ts                Datas, moeda, truncate
│   │
│   ├── types/                       Tipos globais (ApiError, Result, ...)
│   │   └── index.ts
│   │
│   ├── config/                      Constantes de configuração
│   │   ├── site.ts
│   │   └── routes.ts
│   │
│   └── styles/                      Estilos auxiliares (opcional)
│
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## `services/` vs `lib/` vs `utils/` — qual usar?

| Camada       | Para que serve                                           | Exemplo                              |
| ------------ | -------------------------------------------------------- | ------------------------------------ |
| `services/`  | Chamadas a APIs externas (HTTP, SDKs, gateways)          | `httpClient`, `chatService`          |
| `lib/`       | Integrações de infra, config validada, regra cruzada     | `env.ts`, `auth.ts`, `logger.ts`     |
| `utils/`     | Funções **puras** sem side-effects, reutilizáveis        | `cn`, `formatDate`, `truncate`       |

Se a função faz I/O ou usa env → vai em `lib/` ou `services/`. Se é deterministica
e só transforma input → vai em `utils/`.

## Quando criar uma `feature/`?

Crie quando o domínio:

- tem mais de **2-3 arquivos** próprios (componentes, hook, service);
- expõe um **conceito de negócio** (chat, lessons, billing);
- pode ser entendido **sem ler** o resto do app.

Coisas one-off (um botão usado em uma única página) **podem ficar colocadas
diretamente** em `app/<rota>/_components/` (private folder com `_`).

## Aliases

`@/*` aponta para `src/*`. Use sempre os imports absolutos:

```ts
import { Button } from "@/components/ui/button";
import { chatService } from "@/features/chat";
import { cn } from "@/utils/cn";
```

## Variáveis de ambiente

- `NEXT_PUBLIC_*` — expostas ao browser (use só para o que **não é segredo**).
- Sem prefixo — só no servidor.
- Validadas em `src/lib/env.ts` com Zod (build quebra se faltar).

## Convenções

- **Nomes de arquivos:** `kebab-case.ts(x)`.
- **Nomes de componentes:** `PascalCase`.
- **Hooks:** prefixo `use-`.
- **Server Actions:** dentro do arquivo `actions.ts` da rota ou da feature, com
  `"use server"` no topo.
- **Barrel files (`index.ts`):** só na raiz de uma feature, para definir a API
  pública. Evite barrels em camadas globais (atrapalham tree-shaking).
