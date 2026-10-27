"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentService, type TeachingMethodology } from "../services/student-service";

const keys = {
  me: ["student", "me"] as const,
  classrooms: ["student", "classrooms"] as const,
  lists: (classroomId: string) => ["student", "lists", classroomId] as const,
  problems: (classroomId: string) => ["student", "problems", classroomId] as const,
  problem: (id: string) => ["student", "problem", id] as const,
  activeSession: ["student", "session", "active"] as const,
  session: (id: string) => ["student", "session", id] as const,
  sessionHistory: (problemId: string) => ["student", "session-history", problemId] as const,
  messages: (sessionId: string) => ["student", "messages", sessionId] as const,
};

// ── Perfil ────────────────────────────────────────────────────────────────────

export function useStudentMe() {
  return useQuery({ queryKey: keys.me, queryFn: studentService.me, staleTime: 5 * 60_000 });
}

// ── Turmas ────────────────────────────────────────────────────────────────────

export function useStudentClassrooms() {
  return useQuery({ queryKey: keys.classrooms, queryFn: studentService.classrooms });
}

// Deriva da lista cacheada — evita chamar endpoint teacher-only GET /classrooms/{id}
export function useStudentClassroom(id: string | undefined) {
  return useQuery({
    queryKey: keys.classrooms,
    queryFn: studentService.classrooms,
    select: (classrooms) => classrooms.find((c) => c.id === id),
    enabled: !!id,
  });
}

// ── Metodologia ───────────────────────────────────────────────────────────────

export function useUpdateMethodology(classroomId: string) {
  return useMutation({
    mutationFn: (methodology: TeachingMethodology) =>
      studentService.updateMethodology(classroomId, methodology),
  });
}

// ── Listas ────────────────────────────────────────────────────────────────────

export function useStudentLists(classroomId: string | undefined) {
  return useQuery({
    queryKey: classroomId ? keys.lists(classroomId) : keys.classrooms,
    queryFn: () => studentService.lists(classroomId!),
    enabled: !!classroomId,
  });
}

// ── Problemas ─────────────────────────────────────────────────────────────────

export function useStudentProblems(classroomId: string | undefined) {
  return useQuery({
    queryKey: classroomId ? keys.problems(classroomId) : keys.classrooms,
    queryFn: () => studentService.problems(classroomId!),
    enabled: !!classroomId,
  });
}

export function useStudentProblem(problemId: string | undefined) {
  return useQuery({
    queryKey: problemId ? keys.problem(problemId) : keys.me,
    queryFn: () => studentService.problem(problemId!),
    enabled: !!problemId,
  });
}

// ── Sessões ───────────────────────────────────────────────────────────────────

export function useActiveSession() {
  return useQuery({
    queryKey: keys.activeSession,
    queryFn: studentService.activeSession,
    staleTime: 30_000,
  });
}

export function useSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: sessionId ? keys.session(sessionId) : keys.activeSession,
    queryFn: () => studentService.session(sessionId!),
    enabled: !!sessionId,
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (problemId: string) => studentService.startSession(problemId),
    onSuccess: (session) => {
      qc.setQueryData(keys.session(session.id), session);
      qc.invalidateQueries({ queryKey: keys.activeSession });
    },
  });
}

export function useCloseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, submittedCode }: { sessionId: string; submittedCode?: string }) =>
      studentService.closeSession(sessionId, submittedCode),
    onSuccess: (session) => {
      qc.setQueryData(keys.session(session.id), session);
      qc.invalidateQueries({ queryKey: keys.activeSession });
      qc.invalidateQueries({ queryKey: keys.sessionHistory(session.problem_id) });
    },
  });
}

export function useSessionHistory(problemId: string | undefined, refetchInterval?: number) {
  return useQuery({
    queryKey: problemId ? keys.sessionHistory(problemId) : keys.activeSession,
    queryFn: () => studentService.sessionHistory(problemId!),
    enabled: !!problemId,
    refetchInterval,
  });
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export function useChatMessages(sessionId: string | undefined) {
  return useQuery({
    queryKey: sessionId ? keys.messages(sessionId) : keys.activeSession,
    queryFn: () => studentService.messages(sessionId!),
    enabled: !!sessionId,
  });
}

export function useSendMessage(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof studentService.sendMessage>[1]) =>
      studentService.sendMessage(sessionId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.messages(sessionId) }),
  });
}
