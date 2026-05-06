"use client";

import { useQuery } from "@tanstack/react-query";
import { studentAggregateService } from "../services/student-aggregate";

export function useStudentAggregate(disciplineId: string, studentId: string) {
  return useQuery({
    queryKey: ["analysis", "aggregate", disciplineId, studentId] as const,
    queryFn: () => studentAggregateService.forStudent(disciplineId, studentId),
  });
}
