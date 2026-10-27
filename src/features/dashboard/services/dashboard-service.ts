import { api } from "@/lib/api/client";
import { nowIso } from "@/lib/mocks/utils";
import type { DisciplineAlert, ExerciseListSummary } from "@/types/entities";

interface ClassroomPublic { id: string; name: string; teacher_id: string; }
interface ProblemPublic { id: string; classroom_id: string; title: string; is_sandbox: boolean; }

export const dashboardService = {
  alerts: async (): Promise<DisciplineAlert[]> => {
    // No alerts endpoint in backend yet
    return [];
  },

  upcomingDeadlines: async (_withinDays = 3): Promise<ExerciseListSummary[]> => {
    // Problems in backend have no deadline; return empty
    return [];
  },

  recentlyClosedUnanalyzed: async (): Promise<ExerciseListSummary[]> => {
    // No closed/deadline concept in backend yet; show all classrooms with problems
    try {
      const { data: classrooms } = await api.get<ClassroomPublic[]>("/classrooms");
      const results = await Promise.all(
        classrooms.map(async (c) => {
          const { data: problems } = await api.get<ProblemPublic[]>(`/classrooms/${c.id}/problems`);
          const visible = problems.filter((p) => !p.is_sandbox);
          if (visible.length === 0) return null;
          const list: ExerciseListSummary = {
            id: c.id,
            disciplineId: c.id,
            name: c.name,
            deadline: null,
            status: "active",
            problemCount: visible.length,
            hasConsolidatedAnalysis: false,
            createdAt: nowIso(),
          };
          return list;
        }),
      );
      return results.filter((r): r is ExerciseListSummary => r !== null);
    } catch {
      return [];
    }
  },
};
