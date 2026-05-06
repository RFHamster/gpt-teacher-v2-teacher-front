import { delay } from "@/lib/mocks/utils";
import { exerciseLists, submissionsByList } from "@/lib/mocks/fixtures";
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

export const studentAggregateService = {
  /** Agregado do aluno em toda a disciplina (somando todas as listas). */
  forStudent: async (
    disciplineId: string,
    studentId: string,
  ): Promise<StudentAggregate> => {
    await delay(200);
    const lists = exerciseLists.filter((l) => l.disciplineId === disciplineId);
    let delivered = 0;
    let attempted = 0;
    let notStarted = 0;
    let total = 0;
    let totalTime = 0;
    let totalMessages = 0;

    lists.forEach((l) => {
      const cells = (submissionsByList[l.id] ?? []).filter((c) => c.studentId === studentId);
      total += l.problems.length;
      delivered += cells.filter((c) => c.status === "delivered").length;
      attempted += cells.filter((c) => c.status === "attempted").length;
      notStarted +=
        l.problems.length - cells.filter((c) => c.status !== "not_started").length;
      totalTime += cells.reduce((acc, c) => acc + c.timeSpentMinutes, 0);
      totalMessages += cells.reduce((acc, c) => acc + c.messageCount, 0);
    });

    return {
      totalLists: lists.length,
      totalDelivered: delivered,
      totalAttempted: attempted,
      totalNotStarted: notStarted,
      overallDeliveryRate: total > 0 ? delivered / total : 0,
      totalTimeMinutes: totalTime,
      totalMessages,
      generalNote: analysisService.getStudentNote(studentId),
    };
  },
};
