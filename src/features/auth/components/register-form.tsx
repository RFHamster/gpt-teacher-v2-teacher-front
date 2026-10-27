"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/token";
import { routes } from "@/config/routes";

interface TeacherPublic {
  id: string;
  name: string;
  email: string;
}

async function registerTeacher(input: { name: string; email: string; password: string }) {
  const { data: teacher } = await api.post<TeacherPublic>("/auth/register/teacher", input);

  // Auto-login after register
  const params = new URLSearchParams();
  params.append("username", input.email);
  params.append("password", input.password);
  params.append("client_id", "TEACHER");
  const { data: tokenData } = await api.post<{ access_token: string }>(
    "/auth/login/access-token",
    params,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );
  tokenStore.set(tokenData.access_token);
  tokenStore.setRole("teacher");
  return teacher;
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: registerTeacher,
    onSuccess: () => router.push(routes.dashboard),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutation.mutate({ name, email, password });
  }

  const errorMsg =
    (mutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
    (mutation.error as Error)?.message;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold">Criar conta de professor</h1>
        <p className="text-sm text-muted-foreground">
          Plataforma de acompanhamento pedagógico assistido por IA.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Já tem conta?{" "}
        <Link href={routes.login} className="underline hover:text-foreground">
          Entrar
        </Link>
      </p>
    </div>
  );
}
