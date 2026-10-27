"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bankProblemService,
  type CreateBankProblemInput,
  type UpdateBankProblemInput,
} from "../services/bank-problem-service";

const keys = {
  all: ["bank-problems"] as const,
  list: () => [...keys.all, "list"] as const,
  byId: (id: string) => [...keys.all, "byId", id] as const,
};

export function useBankProblems() {
  return useQuery({ queryKey: keys.list(), queryFn: bankProblemService.list });
}

export function useBankProblem(id: string | undefined) {
  return useQuery({
    queryKey: id ? keys.byId(id) : keys.list(),
    queryFn: () => bankProblemService.byId(id!),
    enabled: !!id,
  });
}

export function useCreateBankProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBankProblemInput) => bankProblemService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateBankProblem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBankProblemInput) => bankProblemService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteBankProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bankProblemService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
