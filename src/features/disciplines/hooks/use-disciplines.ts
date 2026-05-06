"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disciplineService, type CreateDisciplineInput } from "../services/discipline-service";

const keys = {
  all: ["disciplines"] as const,
  list: () => [...keys.all, "list"] as const,
  active: () => [...keys.all, "active"] as const,
  byId: (id: string) => [...keys.all, "byId", id] as const,
};

export function useDisciplines() {
  return useQuery({ queryKey: keys.list(), queryFn: disciplineService.list });
}

export function useActiveDisciplines() {
  return useQuery({ queryKey: keys.active(), queryFn: disciplineService.listActive });
}

export function useDiscipline(id: string | undefined) {
  return useQuery({
    queryKey: id ? keys.byId(id) : keys.list(),
    queryFn: () => disciplineService.byId(id!),
    enabled: !!id,
  });
}

export function useCreateDiscipline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDisciplineInput) => disciplineService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
