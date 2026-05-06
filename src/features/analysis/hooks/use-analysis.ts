"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { analysisService } from "../services/analysis-service";

const keys = {
  detail: (l: string, p: string, s: string) => ["analysis", "detail", l, p, s] as const,
  studentInList: (l: string, s: string) => ["analysis", "student-in-list", l, s] as const,
  history: (d: string, s: string) => ["analysis", "history", d, s] as const,
  correction: (s: string, p: string) => ["analysis", "correction", s, p] as const,
  hints: (s: string, p: string) => ["analysis", "hints", s, p] as const,
};

export function useSubmissionDetail(listId: string, problemId: string, studentId: string) {
  return useQuery({
    queryKey: keys.detail(listId, problemId, studentId),
    queryFn: () => analysisService.submissionDetail(listId, problemId, studentId),
  });
}

export function useStudentInListSummary(listId: string, studentId: string) {
  return useQuery({
    queryKey: keys.studentInList(listId, studentId),
    queryFn: () => analysisService.studentInListSummary(listId, studentId),
  });
}

export function useStudentHistory(disciplineId: string, studentId: string) {
  return useQuery({
    queryKey: keys.history(disciplineId, studentId),
    queryFn: () => analysisService.studentHistory(disciplineId, studentId),
  });
}

export function useGenerateCorrection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, problemId }: { studentId: string; problemId: string }) =>
      analysisService.generateCorrection(studentId, problemId),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: keys.correction(vars.studentId, vars.problemId) }),
  });
}

export function useGenerateHints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, problemId }: { studentId: string; problemId: string }) =>
      analysisService.generateHints(studentId, problemId),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: keys.hints(vars.studentId, vars.problemId) }),
  });
}

export function useSaveCellNote() {
  return useMutation({
    mutationFn: ({
      studentId,
      problemId,
      note,
    }: {
      studentId: string;
      problemId: string;
      note: string;
    }) => analysisService.saveCellNote(studentId, problemId, note),
  });
}

export function useSaveStudentNote() {
  return useMutation({
    mutationFn: ({ studentId, note }: { studentId: string; note: string }) =>
      analysisService.saveStudentNote(studentId, note),
  });
}
