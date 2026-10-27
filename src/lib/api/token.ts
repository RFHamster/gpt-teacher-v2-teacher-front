const TOKEN_KEY = "gpt_teacher_token";
const ROLE_KEY = "gpt_teacher_role";

export type UserRole = "teacher" | "student";

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export const tokenStore = {
  get: (): string | null => safeGet(TOKEN_KEY),

  set: (token: string): void => safeSet(TOKEN_KEY, token),

  getRole: (): UserRole | null => safeGet(ROLE_KEY) as UserRole | null,

  setRole: (role: UserRole): void => safeSet(ROLE_KEY, role),

  clear: (): void => {
    safeRemove(TOKEN_KEY);
    safeRemove(ROLE_KEY);
  },
};
