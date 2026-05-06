import { z } from "zod";

/**
 * Validação de variáveis de ambiente.
 *
 * Estratégia: vars obrigatórias têm DEFAULTS razoáveis para que o build
 * passe mesmo sem .env (importante na Vercel quando ainda não há API real).
 * Em produção real, sobrescreva via dashboard da Vercel.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_INTERNAL_URL: z.string().optional(),
  API_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.string().default("http://localhost:8000/api"),
});

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  API_INTERNAL_URL: process.env.API_INTERNAL_URL,
  API_TOKEN: process.env.API_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

const isServer = typeof window === "undefined";
const schema = isServer ? serverSchema.merge(clientSchema) : clientSchema;
const parsed = schema.safeParse(processEnv);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data as z.infer<typeof serverSchema> &
  z.infer<typeof clientSchema>;
