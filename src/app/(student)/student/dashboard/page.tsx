"use client";

import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useStudentClassrooms } from "@/features/student";
import { routes } from "@/config/routes";

export default function StudentDashboardPage() {
  const { data: classrooms, isLoading } = useStudentClassrooms();

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Minhas Turmas</h1>
        <p className="text-sm text-muted-foreground">
          Selecione uma turma para ver os exercícios disponíveis.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : !classrooms?.length ? (
        <EmptyState
          icon={<BookOpen />}
          title="Nenhuma turma ainda"
          description="Você ainda não foi adicionado a nenhuma turma. Aguarde seu professor."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {classrooms.map((c) => (
            <Link
              key={c.id}
              href={routes.studentClassroom(c.id)}
              className="group block focus:outline-none"
            >
              <Card className="transition-colors group-hover:border-foreground/30 group-focus-visible:ring-2 group-focus-visible:ring-foreground/30">
                <CardHeader className="flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  Ver exercícios →
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
