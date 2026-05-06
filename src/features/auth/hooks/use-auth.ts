"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, type LoginInput } from "../services/auth-service";

const keys = { me: ["auth", "me"] as const };

export function useCurrentUser() {
  return useQuery({
    queryKey: keys.me,
    queryFn: authService.me,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (data) => qc.setQueryData(keys.me, data),
  });
}

export function useSsoLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.loginWithSSO,
    onSuccess: (data) => qc.setQueryData(keys.me, data),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => qc.setQueryData(keys.me, null),
  });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: (email: string) => authService.requestPasswordReset(email) });
}
