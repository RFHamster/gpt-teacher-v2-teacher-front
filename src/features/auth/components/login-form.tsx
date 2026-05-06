"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin, useSsoLogin, useRequestPasswordReset } from "../hooks/use-auth";
import { routes } from "@/config/routes";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const login = useLogin();
  const sso = useSsoLogin();
  const reset = useRequestPasswordReset();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (forgotMode) {
      reset.mutate(email, { onSuccess: () => setResetSent(true) });
      return;
    }
    login.mutate(
      { email, password },
      { onSuccess: () => router.push(routes.dashboard) },
    );
  }

  function onSso() {
    sso.mutate(undefined, { onSuccess: () => router.push(routes.dashboard) });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold">
          {forgotMode ? "Recuperar senha" : "Entrar no GPT Teacher"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {forgotMode
            ? "Enviaremos instruções para o seu email."
            : "Plataforma de acompanhamento pedagógico assistido por IA."}
        </p>
      </div>

      {resetSent ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
          Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de
          entrada.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu.email@univ.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!forgotMode && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {(login.isError || reset.isError) && (
            <p className="text-xs text-red-600">
              {(login.error as Error)?.message ?? (reset.error as Error)?.message}
            </p>
          )}

          <Button type="submit" disabled={login.isPending || reset.isPending}>
            {forgotMode
              ? reset.isPending
                ? "Enviando..."
                : "Enviar link de recuperação"
              : login.isPending
                ? "Entrando..."
                : "Entrar"}
          </Button>

          {forgotMode && (
            <button
              type="button"
              onClick={() => setForgotMode(false)}
              className="text-xs text-muted-foreground hover:underline"
            >
              ← Voltar para o login
            </button>
          )}
        </form>
      )}

      {!forgotMode && !resetSent && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          <Button variant="outline" onClick={onSso} disabled={sso.isPending}>
            {sso.isPending ? "Conectando..." : "Entrar com SSO institucional"}
          </Button>
        </>
      )}
    </div>
  );
}
