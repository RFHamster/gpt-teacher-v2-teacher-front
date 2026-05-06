import { mockResponse, delay } from "@/lib/mocks/utils";
import { currentProfessor } from "@/lib/mocks/fixtures";
import type { Professor } from "@/types/entities";

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  /** Mock: aceita qualquer email/senha não-vazios. */
  login: async (input: LoginInput): Promise<Professor> => {
    await delay(500);
    if (!input.email || !input.password) {
      throw new Error("Email e senha são obrigatórios");
    }
    return currentProfessor;
  },

  loginWithSSO: async (): Promise<Professor> => {
    await delay(700);
    return currentProfessor;
  },

  logout: async (): Promise<void> => {
    await delay(150);
  },

  me: async (): Promise<Professor> => mockResponse(currentProfessor, 200),

  requestPasswordReset: async (email: string): Promise<{ ok: boolean }> => {
    await delay(400);
    if (!email) throw new Error("Informe o email");
    return { ok: true };
  },
};
