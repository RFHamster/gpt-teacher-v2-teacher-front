import { api } from "@/lib/api/client";
import { nowIso } from "@/lib/mocks/utils";
import type {
  AiAnalysis,
  ChatRole,
  ExerciseList,
  Problem,
  SessionMessage,
  Student,
  SubmissionCell,
  SubmissionDetail,
} from "@/types/entities";

const teacherNotesByCell = new Map<string, string>();
const studentNotes = new Map<string, string>();
const aiAnalysisByCell = new Map<string, AiAnalysis>();
const aiHintsByCell = new Map<string, AiAnalysis>();

function noteKey(studentId: string, problemId: string) {
  return `${studentId}:${problemId}`;
}

interface ClassroomPublic { id: string; name: string; teacher_id: string; }
interface ProblemPublic { id: string; classroom_id: string; list_id: string | null; title: string; description?: string | null; category?: string | null; is_sandbox: boolean; }
interface StudentPublic { id: string; name: string; email: string; }
interface SessionPublic {
  id: string;
  student_id: string;
  problem_id: string;
  status: "open" | "closed";
  started_at: string | null;
  closed_at: string | null;
}
interface ChatMessageRaw {
  id: string;
  type: "user" | "ai";
  content: string;
  code: string | null;
  code_review: string | null;
  created_at: string;
}
export interface SessionFeedbackIndicators {
  attempts_per_session?: {
    student_message_count: number;
    ai_message_count: number;
    total_messages: number;
  };
  abandonment?: {
    abandoned: boolean | null;
    label: string;
    idle_minutes: number | null;
  };
  session_evaluation?: {
    resolved: boolean | null;
    resolution_quality: "complete" | "partial" | "none";
    code_quality_score: number | null;
    code_quality_notes: string;
    help_dependency: "low" | "medium" | "high" | null;
    help_dependency_notes: string;
    answer_seeking_detected: boolean | null;
    answer_seeking_count: number;
    answer_seeking_notes: string;
    summary: string;
    evaluated_by: "llm" | "skipped";
    error?: string;
  };
}

export interface SessionFeedback {
  session_id: string;
  classroom_id: string;
  indicators: SessionFeedbackIndicators;
}

interface ConsolidatedPublic {
  id: string;
  session_id: string;
  data: {
    summary?: string | null;
    recommendations?: string[];
    difficulty_score?: number | null;
    tags?: string[];
    concepts?: string[];
    error_patterns?: string[];
  };
}

function mapProblem(p: ProblemPublic): Problem {
  return {
    id: p.id,
    disciplineId: p.classroom_id,
    title: p.title,
    statement: p.description ?? "",
    difficulty: "medium",
    createdAt: nowIso(),
  };
}

function mapStudent(s: StudentPublic): Student {
  return { id: s.id, name: s.name ?? null, email: s.email, status: "active", createdAt: nowIso() };
}

function consolidationToAnalysis(consolidated: ConsolidatedPublic): AiAnalysis {
  const parts: string[] = [];
  if (consolidated.data.summary) parts.push(consolidated.data.summary);
  if (consolidated.data.error_patterns?.length) {
    parts.push(`**Padrões de erro:** ${consolidated.data.error_patterns.join(", ")}`);
  }
  if (consolidated.data.recommendations?.length) {
    parts.push(`**Recomendações:** ${consolidated.data.recommendations.join("; ")}`);
  }
  return {
    state: "ready",
    generatedAt: nowIso(),
    content: parts.join("\n\n") || "Análise disponível.",
  };
}

export const analysisService = {
  submissionDetail: async (
    disciplineId: string,
    listId: string,
    problemId: string,
    studentId: string,
  ): Promise<{
    detail: SubmissionDetail;
    list: ExerciseList;
    problem: Problem;
    student: Student;
    siblingStudents: Student[];
    siblingProblems: Problem[];
  }> => {
    const [{ data: classroom }, { data: allProblems }, { data: allStudents }] = await Promise.all([
      api.get<ClassroomPublic>(`/classrooms/${disciplineId}`),
      api.get<ProblemPublic[]>(`/classrooms/${disciplineId}/problems`),
      api.get<StudentPublic[]>(`/classrooms/${disciplineId}/students`),
    ]);

    // Filtra apenas os problemas da lista selecionada (list_id = listId)
    const visibleProblems = allProblems.filter((p) => !p.is_sandbox && p.list_id === listId);
    const problemRaw = visibleProblems.find((p) => p.id === problemId);
    const studentRaw = allStudents.find((s) => s.id === studentId);

    if (!problemRaw) throw new Error("Exercício não encontrado");
    if (!studentRaw) throw new Error("Aluno não encontrado");

    const problem = mapProblem(problemRaw);
    const student = mapStudent(studentRaw);

    // Fetch sessions for this student+problem to get real submission data
    let sessionMessages: ChatMessageRaw[] = [];
    let submittedCode = "";
    let cellStatus: SubmissionCell["status"] = "not_started";
    let targetSessionId: string | undefined;
    let teacherFeedback: string | undefined;

    try {
      const { data: sessions } = await api.get<(SessionPublic & { submitted_code?: string | null; teacher_feedback?: string | null })[]>(
        `/classrooms/${disciplineId}/problems/${problemId}/sessions`,
      );
      const studentSessions = sessions.filter((s) => s.student_id === studentId);
      const closedSession = studentSessions.find((s) => s.status === "closed");
      const activeSession = studentSessions.find((s) => s.status === "open");

      if (closedSession || activeSession) cellStatus = "attempted";

      // Sessions chegam ordenadas por created_at DESC (mais nova primeiro).
      // A MAIS ANTIGA (último elemento) é onde o aluno passou mais tempo conversando —
      // criar nova sessão fecha a anterior, então a conversa real fica na primeira sessão.
      // Para indicadores e transcrição usamos a mais antiga; para código entregue
      // buscamos separadamente qualquer sessão que tenha submitted_code.
      const targetSession =
        studentSessions[studentSessions.length - 1] ?? studentSessions[0];

      if (targetSession) {
        targetSessionId = targetSession.id;
        // Código: somente o submitted_code salvo na sessão conta como entregue
        const submittingSession = studentSessions.find((s) => s.submitted_code);
        if (submittingSession?.submitted_code) submittedCode = submittingSession.submitted_code;
        if (targetSession.teacher_feedback) teacherFeedback = targetSession.teacher_feedback;
        try {
          const { data: msgs } = await api.get<ChatMessageRaw[]>(
            `/student-session/${targetSession.id}/chat-messages/teacher`,
          );
          sessionMessages = msgs;
        } catch {
          // mensagens indisponíveis — não impede mostrar o código
        }
      }

      // Apenas submitted_code marca como entregue
      if (submittedCode) cellStatus = "delivered";
    } catch {
      // sessões indisponíveis
    }

    // Try to fetch AI consolidation analysis
    let aiAnalysis: AiAnalysis = { state: "not_generated" };
    try {
      const { data: consolidations } = await api.get<ConsolidatedPublic[]>(
        `/students/${studentId}/consolidations`,
      );
      const relevant = consolidations[0];
      if (relevant) {
        aiAnalysis = consolidationToAnalysis(relevant);
        aiAnalysisByCell.set(noteKey(studentId, problemId), aiAnalysis);
      }
    } catch {
      // consolidations not available, leave as not_generated
    }

    const cell: SubmissionCell = {
      studentId,
      problemId,
      status: cellStatus,
      messageCount: sessionMessages.length,
      timeSpentMinutes: 0,
    };

    const detail: SubmissionDetail = {
      ...cell,
      code: submittedCode,
      codeLanguage: "javascript",
      messages: sessionMessages.map((m) => ({
        id: m.id,
        role: (m.type === "user" ? "user" : "assistant") as ChatRole,
        content: m.content,
        createdAt: m.created_at,
      })) as SessionMessage[],
      teacherNote: teacherNotesByCell.get(noteKey(studentId, problemId)),
      sessionId: targetSessionId,
      teacherFeedback,
    };

    const list: ExerciseList = {
      id: listId,
      disciplineId: disciplineId,
      name: classroom.name,
      description: undefined,
      deadline: null,
      status: "active",
      problemCount: visibleProblems.length,
      createdAt: nowIso(),
      problems: visibleProblems.map(mapProblem),
    };

    return {
      detail,
      list,
      problem,
      student,
      siblingStudents: allStudents.map(mapStudent),
      siblingProblems: visibleProblems.map(mapProblem),
    };
  },

  generateCorrection: async (studentId: string, problemId: string): Promise<AiAnalysis> => {
    const key = noteKey(studentId, problemId);
    const existing = aiAnalysisByCell.get(key);
    if (existing?.state === "ready") return existing;

    try {
      const { data: consolidations } = await api.get<ConsolidatedPublic[]>(
        `/students/${studentId}/consolidations`,
      );
      const first = consolidations[0];
      if (first) {
        const ai = consolidationToAnalysis(first);
        aiAnalysisByCell.set(key, ai);
        return ai;
      }
    } catch {}

    const ai: AiAnalysis = {
      state: "ready",
      generatedAt: nowIso(),
      content: "Nenhuma consolidação disponível para este aluno ainda.",
    };
    aiAnalysisByCell.set(key, ai);
    return ai;
  },

  generateHints: async (studentId: string, problemId: string): Promise<AiAnalysis> => {
    const key = noteKey(studentId, problemId);
    const existing = aiHintsByCell.get(key);
    if (existing?.state === "ready") return existing;

    try {
      const { data: consolidations } = await api.get<ConsolidatedPublic[]>(
        `/students/${studentId}/consolidations`,
      );
      const first = consolidations[0];
      if (first && first.data.recommendations && first.data.recommendations.length > 0) {
        const ai: AiAnalysis = {
          state: "ready",
          generatedAt: nowIso(),
          content: first.data.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n"),
        };
        aiHintsByCell.set(key, ai);
        return ai;
      }
    } catch {}

    const ai: AiAnalysis = {
      state: "ready",
      generatedAt: nowIso(),
      content: "Nenhuma recomendação disponível para este aluno ainda.",
    };
    aiHintsByCell.set(key, ai);
    return ai;
  },

  getCorrectionState: (studentId: string, problemId: string): AiAnalysis =>
    aiAnalysisByCell.get(noteKey(studentId, problemId)) ?? { state: "not_generated" },

  getHintsState: (studentId: string, problemId: string): AiAnalysis =>
    aiHintsByCell.get(noteKey(studentId, problemId)) ?? { state: "not_generated" },

  saveFeedback: async (sessionId: string, feedback: string): Promise<void> => {
    await api.put(`/student-sessions/${sessionId}/feedback`, { feedback });
  },

  sessionFeedback: async (sessionId: string): Promise<SessionFeedback> => {
    const { data } = await api.get<SessionFeedback>(`/sessions/${sessionId}/feedback`);
    return data;
  },

  triggerFeedbackGeneration: async (): Promise<void> => {
    await api.post("/feedback/generate");
  },

  saveCellNote: async (studentId: string, problemId: string, note: string) => {
    teacherNotesByCell.set(noteKey(studentId, problemId), note);
  },

  saveStudentNote: async (studentId: string, note: string) => {
    studentNotes.set(studentId, note);
  },

  getStudentNote: (studentId: string): string => studentNotes.get(studentId) ?? "",

  studentInListSummary: async (disciplineId: string, listId: string, studentId: string) => {
    const [{ data: classroom }, { data: allProblems }, { data: allStudents }] = await Promise.all([
      api.get<ClassroomPublic>(`/classrooms/${disciplineId}`),
      api.get<ProblemPublic[]>(`/classrooms/${disciplineId}/problems`),
      api.get<StudentPublic[]>(`/classrooms/${disciplineId}/students`),
    ]);

    const visibleProblems = allProblems.filter((p) => !p.is_sandbox && p.list_id === listId);
    const student = allStudents.find((s) => s.id === studentId);
    if (!student) throw new Error("Aluno não encontrado");

    const list: ExerciseList = {
      id: listId,
      disciplineId: disciplineId,
      name: classroom.name,
      description: undefined,
      deadline: null,
      status: "active",
      problemCount: visibleProblems.length,
      createdAt: nowIso(),
      problems: visibleProblems.map(mapProblem),
    };

    const sessionResults = await Promise.all(
      visibleProblems.map((p) =>
        api
          .get<SessionPublic[]>(`/classrooms/${disciplineId}/problems/${p.id}/sessions`)
          .then(({ data }) => data.filter((s) => s.student_id === studentId))
          .catch(() => [] as SessionPublic[]),
      ),
    );

    let delivered = 0;
    let attempted = 0;

    for (const sessions of sessionResults) {
      if (sessions.some((s) => s.status === "closed")) delivered++;
      else if (sessions.some((s) => s.status === "open")) attempted++;
    }

    return {
      list,
      student: mapStudent(student),
      cells: [] as SubmissionCell[],
      problems: visibleProblems.map(mapProblem),
      delivered,
      attempted,
      notStarted: Math.max(0, visibleProblems.length - delivered - attempted),
      totalTime: 0,
      totalMessages: 0,
      generalNote: studentNotes.get(studentId) ?? "",
    };
  },

  studentHistory: async (disciplineId: string, studentId: string) => {
    // Single "list" per discipline = the classroom itself
    const { data: classroom } = await api.get<ClassroomPublic>(`/classrooms/${disciplineId}`);
    return [
      {
        listId: classroom.id,
        listName: classroom.name,
        status: "active" as const,
        deliveryRate: 0,
      },
    ];
  },
};
