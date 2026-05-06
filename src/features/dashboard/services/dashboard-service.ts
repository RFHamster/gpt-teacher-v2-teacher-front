import { mockResponse } from "@/lib/mocks/utils";
import { exerciseLists, globalAlerts } from "@/lib/mocks/fixtures";
import type { DisciplineAlert, ExerciseListSummary } from "@/types/entities";

export const dashboardService = {
  alerts: () => mockResponse<DisciplineAlert[]>(globalAlerts, 250),

  upcomingDeadlines: (withinDays = 3) => {
    const now = Date.now();
    const max = now + withinDays * 24 * 60 * 60 * 1000;
    const filtered = exerciseLists.filter(
      (l) =>
        l.status === "active" &&
        l.deadline !== null &&
        new Date(l.deadline).getTime() >= now &&
        new Date(l.deadline).getTime() <= max,
    );
    return mockResponse<ExerciseListSummary[]>(filtered, 200);
  },

  recentlyClosedUnanalyzed: () => {
    const filtered = exerciseLists.filter(
      (l) => l.status === "closed" && l.hasConsolidatedAnalysis === false,
    );
    return mockResponse<ExerciseListSummary[]>(filtered, 200);
  },
};
