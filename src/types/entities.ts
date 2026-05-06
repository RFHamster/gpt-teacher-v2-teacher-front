/**
 * Tipos de domínio. Espelham o que o backend deve expor.
 * Mantém-se neutro a transporte (REST/GraphQL/etc).
 */

export type ID = string;

export type Semester = string; // ex: "2025.1"

export interface Professor {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type StudentStatus = "active" | "pending"; // pending = convite enviado, ainda não cadastrou

export interface Student {
  id: ID;
  name: string | null;
  email: string;
  status: StudentStatus;
  createdAt: string;
}

export interface Discipline {
  id: ID;
  name: string;
  description?: string;
  semester: Semester;
  isArchived: boolean;
  createdAt: string;
  studentCount: number;
  activeListCount: number;
  closedListCount: number;
}

export type ProblemDifficulty = "easy" | "medium" | "hard";

export interface Problem {
  id: ID;
  disciplineId: ID;
  title: string;
  statement: string;
  difficulty: ProblemDifficulty;
  createdAt: string;
}

export type ExerciseListStatus = "draft" | "active" | "closed";

export interface ExerciseListSummary {
  id: ID;
  disciplineId: ID;
  name: string;
  description?: string;
  deadline: string | null; // null em rascunho
  status: ExerciseListStatus;
  problemCount: number;
  /** Apenas em closed: % de alunos que entregou pelo menos 1 exercício */
  deliveryRate?: number;
  /** Apenas em closed */
  hasConsolidatedAnalysis?: boolean;
  createdAt: string;
}

export interface ExerciseList extends ExerciseListSummary {
  problems: Problem[];
}

/** Estado de submissão por aluno para um exercício específico. */
export type SubmissionStatus = "delivered" | "attempted" | "not_started";

export interface SubmissionCell {
  studentId: ID;
  problemId: ID;
  status: SubmissionStatus;
  messageCount: number;
  timeSpentMinutes: number;
  lastSessionAt?: string;
}

/** Mensagem da conversa aluno × agente */
export type ChatRole = "user" | "assistant" | "code_review";

export interface SessionMessage {
  id: ID;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface SubmissionDetail extends SubmissionCell {
  code: string;
  codeLanguage: string;
  messages: SessionMessage[];
  /** Anotação do professor para esta cell (aluno+exercício) */
  teacherNote?: string;
}

/** Estado de qualquer análise gerada por IA */
export type AiState = "not_generated" | "generating" | "ready" | "error";

export interface AiAnalysis {
  state: AiState;
  generatedAt?: string;
  /** Markdown */
  content?: string;
  errorMessage?: string;
}

export interface DisciplineAlert {
  id: ID;
  type: "no_activity" | "high_message_volume" | "deadline_close" | "list_unanalyzed";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  link?: string;
  createdAt: string;
  /** Contexto opcional para deep-link */
  disciplineId?: ID;
  listId?: ID;
  studentId?: ID;
  problemId?: ID;
}
