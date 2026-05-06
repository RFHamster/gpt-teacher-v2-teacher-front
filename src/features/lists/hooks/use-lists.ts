"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listService, type CreateListInput } from "../services/list-service";

const keys = {
  byDiscipline: (id: string) => ["lists", "discipline", id] as const,
  byId: (id: string) => ["lists", "byId", id] as const,
  matrix: (id: string) => ["lists", "matrix", id] as const,
  problems: (id: string) => ["problems", "discipline", id] as const,
};

export function useListsByDiscipline(disciplineId: string | undefined) {
  return useQuery({
    queryKey: disciplineId ? keys.byDiscipline(disciplineId) : ["lists", "none"],
    queryFn: () => listService.byDiscipline(disciplineId!),
    enabled: !!disciplineId,
  });
}

export function useList(listId: string | undefined) {
  return useQuery({
    queryKey: listId ? keys.byId(listId) : ["lists", "none"],
    queryFn: () => listService.byId(listId!),
    enabled: !!listId,
  });
}

export function useListMatrix(listId: string | undefined) {
  return useQuery({
    queryKey: listId ? keys.matrix(listId) : ["lists", "none"],
    queryFn: () => listService.matrix(listId!),
    enabled: !!listId,
  });
}

export function useProblemsForDiscipline(disciplineId: string | undefined) {
  return useQuery({
    queryKey: disciplineId ? keys.problems(disciplineId) : ["problems", "none"],
    queryFn: () => listService.problemsForDiscipline(disciplineId!),
    enabled: !!disciplineId,
  });
}

export function useCreateList(disciplineId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateListInput, "disciplineId">) =>
      listService.create({ ...input, disciplineId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.byDiscipline(disciplineId) }),
  });
}

export function useUpdateDeadline(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deadline: string) => listService.updateDeadline(listId, deadline),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.byId(listId) });
      qc.invalidateQueries({ queryKey: keys.matrix(listId) });
    },
  });
}
