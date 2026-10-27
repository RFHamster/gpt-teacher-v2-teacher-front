"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  MessageSquare,
  RefreshCw,
  Send,
  Tag,
  Upload,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import {
  useStudentClassroom,
  useStudentProblems,
  useStartSession,
  useCloseSession,
  useChatMessages,
  useSendMessage,
  useSessionHistory,
} from "@/features/student";
import {
  METHODOLOGY_LABELS,
  type TeachingMethodology,
  type StudentProblem,
  type StudentSession,
} from "@/features/student";
import { routes } from "@/config/routes";

// ── Utilitários ───────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Bolha de mensagem ─────────────────────────────────────────────────────────

function MessageBubble({
  type,
  content,
  code,
}: {
  type: "user" | "ai";
  content: string;
  code: string | null;
}) {
  const isUser = type === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        {code && (
          <pre className="overflow-x-auto rounded-md bg-black/10 p-2 text-xs">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

// ── Histórico colapsável (visível quando há sessão ativa ou antes de iniciar) ──

function SessionHistoryCollapsed({ problemId }: { problemId: string }) {
  const [open, setOpen] = useState(false);
  const { data: sessions, isLoading } = useSessionHistory(open ? problemId : undefined);

  return (
    <div className="rounded-xl border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Tentativas anteriores
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3 flex flex-col gap-2">
          {isLoading ? (
            <Skeleton className="h-10" />
          ) : !sessions?.length ? (
            <p className="text-sm text-muted-foreground">Nenhuma tentativa anterior.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {sessions.map((s) => (
                <li key={s.id} className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{formatDate(s.started_at)}</span>
                    <Badge variant={s.status === "open" ? "default" : "outline"} className="text-xs">
                      {s.status === "open" ? "Em andamento" : "Encerrada"}
                    </Badge>
                  </div>
                  {s.teacher_feedback && (
                    <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs">
                      <span className="font-semibold text-primary">Devolutiva: </span>
                      {s.teacher_feedback}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Vista de atividade encerrada ──────────────────────────────────────────────

function EncerradaView({
  problemId,
  submittedCode,
}: {
  problemId: string;
  submittedCode: string;
}) {
  // Polling a cada 15s para capturar devolutiva quando o professor enviar
  const { data: sessions, isLoading, refetch, isFetching } = useSessionHistory(problemId, 15_000);
  const latestClosed = sessions?.find((s) => s.status === "closed");
  const hasFeedback = !!latestClosed?.teacher_feedback;

  const [codeOpen, setCodeOpen] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      {/* Cabeçalho encerrada */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
        <div>
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">Atividade encerrada</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Entregue ao professor. Aguarde a devolutiva.
          </p>
        </div>
      </div>

      {/* Devolutiva do professor */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between bg-muted/30 px-4 py-2.5">
          <span className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4 text-primary" />
            Devolutiva do professor
          </span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Atualizar"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          </button>
        </div>
        <div className="px-4 py-3">
          {isLoading ? (
            <Skeleton className="h-12" />
          ) : hasFeedback ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {latestClosed!.teacher_feedback}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Ainda não há devolutiva. A página atualiza automaticamente.
            </p>
          )}
        </div>
      </div>

      {/* Código enviado — colapsável */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setCodeOpen((v) => !v)}
          className="flex w-full items-center justify-between bg-muted/20 px-4 py-2.5 text-sm font-medium hover:bg-muted/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            Código enviado
          </span>
          {codeOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {codeOpen && (
          <div className="border-t border-border">
            {submittedCode ? (
              <pre className="max-h-72 overflow-auto p-4 font-mono text-xs leading-relaxed">
                <code>{submittedCode}</code>
              </pre>
            ) : (
              <p className="px-4 py-3 text-sm text-muted-foreground italic">
                Nenhum código foi enviado nesta tentativa.
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function StudentProblemPage({
  params,
}: {
  params: Promise<{ id: string; problemId: string }>;
}) {
  const { id: classroomId, problemId } = use(params);

  const { data: classroom } = useStudentClassroom(classroomId);
  const { data: problems } = useStudentProblems(classroomId);
  const problem = problems?.find((p) => p.id === problemId) as StudentProblem | undefined;

  const startSession = useStartSession();
  const closeSession = useCloseSession();

  // Histórico para detectar sessão encerrada mesmo após reload
  const { data: sessionHistory } = useSessionHistory(problemId);
  const existingClosed = sessionHistory?.find((s) => s.status === "closed") ?? null;

  const [session, setSession] = useState<StudentSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [delivering, setDelivering] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);

  const { data: messages, isLoading: loadingMessages } = useChatMessages(session?.id);
  const sendMessage = useSendMessage(session?.id ?? "");

  const [code, setCode] = useState("");

  // "encerrada" se o aluno acabou de entregar OU se já existe sessão encerrada no histórico
  const isEncerrada = delivered || !!existingClosed;
  const encerradaCode = delivered ? code : (existingClosed?.submitted_code ?? "");
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const storedMethodology =
    typeof window !== "undefined"
      ? (localStorage.getItem(`methodology-${classroomId}`) as TeachingMethodology | null)
      : null;
  const methodology: TeachingMethodology = storedMethodology ?? "socratic";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleStart() {
    setSessionLoading(true);
    try {
      const s = await startSession.mutateAsync(problemId);
      setSession(s);
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleDeliver() {
    if (!session || !problem) return;
    setDelivering(true);
    try {
      // Tenta enviar mensagem final à IA (opcional — não bloqueia a entrega)
      if (code.trim()) {
        try {
          await sendMessage.mutateAsync({
            problem_title: problem.title,
            problem_description: problem.description ?? "",
            problem_category: problem.category,
            student_code: code,
            user_message: "Esta é minha solução final.",
          });
        } catch {
          // AI indisponível — não impede a entrega
        }
      }
      // Fecha a sessão enviando o código diretamente (garantido, sem depender da IA)
      await closeSession.mutateAsync({ sessionId: session.id, submittedCode: code || undefined });
      setDelivered(true);
      setSession(null);
    } finally {
      setDelivering(false);
    }
  }

  function handleAiSend() {
    if (!problem || !session || !text.trim()) return;
    sendMessage.mutate({
      problem_title: problem.title,
      problem_description: problem.description ?? "",
      problem_category: problem.category,
      student_code: code,
      user_message: text,
    });
    setText("");
  }

  if (!problem) {
    return (
      <div className="mx-auto max-w-3xl flex flex-col gap-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={routes.studentClassroom(classroomId)}
          className="flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {classroom?.name ?? "Turma"}
        </Link>
        <span>/</span>
        <span className="text-foreground">{problem.title}</span>
      </div>

      {/* Enunciado */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <h1 className="text-lg font-semibold">{problem.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {problem.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              <Tag className="h-3 w-3" />
              {problem.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <Bot className="h-3 w-3" />
            {METHODOLOGY_LABELS[methodology]}
          </span>
        </div>
        {problem.description && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {problem.description}
          </p>
        )}
      </div>

      {/* Estado: encerrada */}
      {isEncerrada && (
        <EncerradaView
          problemId={problemId}
          submittedCode={encerradaCode}
        />
      )}

      {/* Estado: sem sessão */}
      {!session && !isEncerrada && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
          <Code2 className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">Pronto para resolver?</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Inicie uma sessão para escrever sua solução. A IA estará disponível como auxílio
              enquanto você trabalha.
            </p>
          </div>
          <Button onClick={handleStart} disabled={sessionLoading}>
            {sessionLoading ? "Iniciando..." : "Iniciar sessão"}
          </Button>
        </div>
      )}

      {/* Estado: sessão ativa */}
      {session && !isEncerrada && (
        <div className="flex flex-col gap-4">
          {/* Status da sessão */}
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Sessão ativa · {METHODOLOGY_LABELS[methodology]}
            </span>
          </div>

          {/* Editor de código */}
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/10 p-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Code2 className="h-3.5 w-3.5" />
              Sua solução
            </label>
            <textarea
              rows={10}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Escreva ou cole seu código aqui..."
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Botão de entrega */}
          <Button
            onClick={handleDeliver}
            disabled={delivering || closeSession.isPending}
            className="w-full gap-2"
          >
            {delivering ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Entregando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Entregar código ao professor
              </>
            )}
          </Button>

          {/* Chat com IA — auxílio colapsável */}
          <div className="rounded-xl border border-border">
            <button
              onClick={() => setChatOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                Pedir ajuda à IA
                {messages && messages.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {messages.length}
                  </Badge>
                )}
              </span>
              {chatOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {chatOpen && (
              <div className="flex flex-col gap-3 border-t border-border p-4">
                <p className="text-xs text-muted-foreground">
                  A IA vai te orientar no estilo{" "}
                  <span className="font-medium">{METHODOLOGY_LABELS[methodology]}</span> — sem
                  entregar a resposta pronta.
                </p>

                {/* Histórico de mensagens */}
                <div className="flex h-[260px] flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-background p-4">
                  {loadingMessages ? (
                    <Skeleton className="h-full" />
                  ) : !messages?.length ? (
                    <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                      <div>
                        <Bot className="mx-auto mb-2 h-5 w-5" />
                        Escreva uma dúvida para receber orientação.
                      </div>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <MessageBubble key={m.id} type={m.type} content={m.content} code={m.code} />
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input da IA */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAiSend()}
                    placeholder="Escreva sua dúvida..."
                    disabled={sendMessage.isPending}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  />
                  <Button
                    onClick={handleAiSend}
                    disabled={!text.trim() || sendMessage.isPending}
                  >
                    {sendMessage.isPending ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {sendMessage.isError && (
                  <p className="text-xs text-red-600">
                    {(sendMessage.error as Error)?.message ?? "Erro ao enviar mensagem."}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Histórico de sessões — só visível quando não está na vista encerrada */}
      {!isEncerrada && <SessionHistoryCollapsed problemId={problemId} />}
    </div>
  );
}
