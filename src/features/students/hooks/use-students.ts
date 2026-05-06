"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentService, type InviteStudentsInput } from "../services/student-service";

const keys = {
  byDiscipline: (id: string) => ["students", "discipline", id] as const,
  byId: (disciplineId: string, studentId: string) =>
    ["students", disciplineId, studentId] as const,
};

export function useStudentsByDiscipline(disciplineId: string | undefined) {
  return useQuery({
    queryKey: disciplineId ? keys.byDiscipline(disciplineId) : ["students", "none"],
    queryFn: () => studentService.byDiscipline(disciplineId!),
    enabled: !!disciplineId,
  });
}

export function useStudent(disciplineId: string | undefined, studentId: string | undefined) {
  return useQuery({
    queryKey: disciplineId && studentId ? keys.byId(disciplineId, studentId) : ["students", "none"],
    queryFn: () => studentService.byId(disciplineId!, studentId!),
    enabled: !!disciplineId && !!studentId,
  });
}

export function useInviteStudents(disciplineId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<InviteStudentsInput, "disciplineId">) =>
      studentService.invite({ ...input, disciplineId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.byDiscipline(disciplineId) }),
  });
}
