import { api } from "@/lib/api/client";
import { analysisService } from "./analysis-service";

export interface StudentAggregate {
  totalLists: number;
  totalDelivered: number;
  totalAttempted: number;
  totalNotStarted: number;
  overallDeliveryRate: number;
  totalTimeMinutes: number;
  totalMessages: number;
  generalNote: string;
}

interface ProblemPublic {
  id: string;
  is_sandbox: boolean;
}

interface SessionPublic {
  id: string;
  student_id: string;
  status: "open" | "closed";
  started_at: string | null;
  closed_at: string | null;
}

export const studentAggregateService = {
  forStudent: async (
    disciplineId: string,
    studentId: string,
  ): Promise<StudentAggregate> => {
    const { data: problems } = await api.get<ProblemPublic[]>(
      `/classrooms/${disciplineId}/problems`,
    );
    const visibleProblems = problems.filter((p) => !p.is_sandbox);
    const total = visibleProblems.length;

    if (total === 0) {
      return {
        totalLists: 1,
        totalDelivered: 0,
        totalAttempted: 0,
        totalNotStarted: 0,
        overallDeliveryRate: 0,
        totalTimeMinutes: 0,
        totalMessages: 0,
        generalNote: analysisService.getStudentNote(studentId),
      };
    }

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
    const targetSessions: SessionPublic[] = [];

    for (const sessions of sessionResults) {
      const closed = sessions.find((s) => s.status === "closed");
      const open = sessions.find((s) => s.status === "open");
      if (closed) {
        delivered++;
        targetSessions.push(closed);
      } else if (open) {
        attempted++;
        targetSessions.push(open);
      }
    }

    // Tempo: soma de (closed_at - started_at) em minutos para sessões fechadas
    let totalTimeMinutes = 0;
    for (const s of targetSessions) {
      if (s.started_at && s.closed_at) {
        const ms = new Date(s.closed_at).getTime() - new Date(s.started_at).getTime();
        totalTimeMinutes += Math.round(ms / 60000);
      }
    }

    // Mensagens: conta via endpoint do professor para cada sessão
    const messageCounts = await Promise.all(
      targetSessions.map((s) =>
        api
          .get<{ id: string }[]>(`/student-session/${s.id}/chat-messages/teacher`)
          .then(({ data }) => data.length)
          .catch(() => 0),
      ),
    );
    const totalMessages = messageCounts.reduce((a, b) => a + b, 0);

    return {
      totalLists: 1,
      totalDelivered: delivered,
      totalAttempted: attempted,
      totalNotStarted: Math.max(0, total - delivered - attempted),
      overallDeliveryRate: total > 0 ? delivered / total : 0,
      totalTimeMinutes,
      totalMessages,
      generalNote: analysisService.getStudentNote(studentId),
    };
  },
};
