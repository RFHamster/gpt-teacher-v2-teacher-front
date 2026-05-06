"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard-service";

const keys = {
  alerts: ["dashboard", "alerts"] as const,
  upcoming: (days: number) => ["dashboard", "upcoming", days] as const,
  unanalyzed: ["dashboard", "unanalyzed"] as const,
};

export function useGlobalAlerts() {
  return useQuery({ queryKey: keys.alerts, queryFn: dashboardService.alerts });
}

export function useUpcomingDeadlines(days = 3) {
  return useQuery({
    queryKey: keys.upcoming(days),
    queryFn: () => dashboardService.upcomingDeadlines(days),
  });
}

export function useRecentlyClosedUnanalyzed() {
  return useQuery({
    queryKey: keys.unanalyzed,
    queryFn: dashboardService.recentlyClosedUnanalyzed,
  });
}
