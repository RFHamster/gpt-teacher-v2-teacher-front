"use client";

import { GraduationCap, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStudentMe } from "@/features/student";
import { authService } from "@/features/auth/services/auth-service";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: student } = useStudentMe();

  async function handleLogout() {
    await authService.logout();
    router.push(routes.login);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Barra superior */}
      <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">{siteConfig.name}</span>
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Aluno
          </span>
        </div>
        <div className="flex items-center gap-3">
          {student && (
            <span className="hidden text-sm text-muted-foreground sm:block">
              {student.name || student.email}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
}
