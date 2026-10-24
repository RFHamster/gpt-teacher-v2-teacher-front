import { api } from "@/lib/api/client";
import { tokenStore, type UserRole } from "@/lib/api/token";
import type { Professor } from "@/types/entities";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: Professor;
  role: UserRole;
}

interface TeacherPublic {
  id: string;
  name: string;
  email: string;
}

interface StudentPublic {
  id: string;
  name: string;
  email: string;
}

function mapTeacher(data: TeacherPublic): Professor {
  return { id: data.id, name: data.name, email: data.email };
}

async function fetchToken(email: string, password: string, clientId: "TEACHER" | "STUDENT"): Promise<string> {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);
  params.append("client_id", clientId);
  const { data } = await api.post<{ access_token: string }>(
    "/auth/login/access-token",
    params,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );
  return data.access_token;
}

export const authService = {
  login: async (input: LoginInput): Promise<LoginResult> => {
    let token: string;
    let role: UserRole;

    try {
      // Try teacher login first
      token = await fetchToken(input.email, input.password, "TEACHER");
      role = "teacher";
    } catch (teacherErr: unknown) {
      const status = (teacherErr as { response?: { status?: number } })?.response?.status;
      if (status !== 401) throw teacherErr;

      // Teacher login failed — try student
      token = await fetchToken(input.email, input.password, "STUDENT");
      role = "student";
    }

    tokenStore.set(token);
    tokenStore.setRole(role);

    // Fetch profile based on role
    if (role === "teacher") {
      const { data } = await api.get<TeacherPublic>("/teachers/me");
      return { user: mapTeacher(data), role };
    } else {
      const { data } = await api.get<StudentPublic>("/students/me");
      return { user: { id: data.id, name: data.name, email: data.email }, role };
    }
  },

  loginWithSSO: async (): Promise<LoginResult> => {
    throw new Error("SSO não disponível no momento");
  },

  logout: async (): Promise<void> => {
    tokenStore.clear();
  },

  me: async (): Promise<Professor> => {
    const token = tokenStore.get();
    if (!token) throw new Error("Não autenticado");
    const role = tokenStore.getRole();
    if (role === "student") {
      const { data } = await api.get<StudentPublic>("/students/me");
      return { id: data.id, name: data.name, email: data.email };
    }
    const { data } = await api.get<TeacherPublic>("/teachers/me");
    return { id: data.id, name: data.name, email: data.email };
  },

  requestPasswordReset: async (email: string): Promise<{ ok: boolean }> => {
    if (!email) throw new Error("Informe o email");
    return { ok: true };
  },
};
