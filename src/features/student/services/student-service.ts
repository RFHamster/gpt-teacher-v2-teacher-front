import { api } from "@/lib/api/client";

// ── Tipos públicos ────────────────────────────────────────────────────────────

export type TeachingMethodology = "socratic" | "direct" | "step_by_step";

export const METHODOLOGY_LABELS: Record<TeachingMethodology, string> = {
  socratic: "Socrático",
  direct: "Direto",
  step_by_step: "Passo a passo",
};

export const METHODOLOGY_DESCRIPTIONS: Record<TeachingMethodology, string> = {
  socratic: "A IA nunca corrige diretamente — só faz perguntas para você raciocinar",
  direct: "A IA aponta o erro e explica o que está errado",
  step_by_step: "A IA guia você passo a passo até chegar à solução",
};

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
}

export interface StudentClassroom {
  id: string;
  name: string;
  teacher_id: string;
}

export interface StudentList {
  id: string;
  classroom_id: string;
  name: string;
  description: string | null;
  deadline: string | null;
}

export interface StudentProblem {
  id: string;
  classroom_id: string;
  list_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
}

export interface StudentSession {
  id: string;
  student_id: string;
  problem_id: string;
  status: "open" | "closed";
  started_at: string | null;
  closed_at: string | null;
  submitted_code: string | null;
  teacher_feedback: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  problem_id: string;
  type: "user" | "ai";
  content: string;
  code: string | null;
  code_review: string | null;
  created_at: string;
}

// ── Serviço ───────────────────────────────────────────────────────────────────

export const studentService = {
  // Perfil
  me: async (): Promise<StudentProfile> => {
    const { data } = await api.get<StudentProfile>("/students/me");
    return data;
  },

  updateMe: async (input: Partial<Pick<StudentProfile, "name">>): Promise<StudentProfile> => {
    const { data } = await api.put<StudentProfile>("/students/me", input);
    return data;
  },

  // Turmas (único endpoint acessível por aluno para turmas)
  classrooms: async (): Promise<StudentClassroom[]> => {
    const { data } = await api.get<StudentClassroom[]>("/students/me/classrooms");
    return data;
  },

  // Metodologia por turma
  updateMethodology: async (classroomId: string, methodology: TeachingMethodology): Promise<void> => {
    await api.put(`/classrooms/${classroomId}/students/me/methodology`, { methodology });
  },

  // Listas
  lists: async (classroomId: string): Promise<StudentList[]> => {
    const { data } = await api.get<StudentList[]>(`/classrooms/${classroomId}/lists`);
    return data;
  },

  // Problemas
  problems: async (classroomId: string): Promise<StudentProblem[]> => {
    const { data } = await api.get<StudentProblem[]>(`/classrooms/${classroomId}/problems`);
    return data;
  },

  problem: async (problemId: string): Promise<StudentProblem> => {
    const { data } = await api.get<StudentProblem>(`/problems/${problemId}`);
    return data;
  },

  // Sessões
  startSession: async (problemId: string): Promise<StudentSession> => {
    const { data } = await api.post<StudentSession>("/student-sessions", {
      problem_id: problemId,
    });
    return data;
  },

  activeSession: async (): Promise<StudentSession | null> => {
    const { data } = await api.get<StudentSession | null>("/student-sessions/active");
    return data ?? null;
  },

  session: async (sessionId: string): Promise<StudentSession> => {
    const { data } = await api.get<StudentSession>(`/student-sessions/${sessionId}`);
    return data;
  },

  closeSession: async (sessionId: string, submittedCode?: string): Promise<StudentSession> => {
    const { data } = await api.post<StudentSession>(`/student-sessions/${sessionId}/close`, {
      submitted_code: submittedCode ?? null,
    });
    return data;
  },

  sessionHistory: async (problemId: string): Promise<StudentSession[]> => {
    const { data } = await api.get<StudentSession[]>(`/student-sessions/problems/${problemId}/sessions`);
    return data;
  },

  // Chat
  messages: async (sessionId: string): Promise<ChatMessage[]> => {
    const { data } = await api.get<ChatMessage[]>(
      `/student-session/${sessionId}/chat-messages`,
    );
    return data;
  },

  sendMessage: async (
    sessionId: string,
    input: {
      problem_title: string;
      problem_description: string;
      problem_category?: string | null;
      student_code: string;
      user_message: string;
    },
  ): Promise<ChatMessage> => {
    const { data } = await api.post<ChatMessage>(
      `/call-agent/student-session/${sessionId}/chat-messages`,
      { ...input, session_id: sessionId },
    );
    return data;
  },
};
