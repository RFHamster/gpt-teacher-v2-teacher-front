"use client";

import { use } from "react";
import Link from "next/link";
import { Plus, Users, ListChecks, Archive, Bell, Clock4 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscipline } from "@/features/disciplines";
import { useGlobalAlerts, useUpcomingDeadlines } from "@/features/dashboard";
import { routes } from "@/config/routes";
import { formatDateTime, relativeFromNow } from "@/utils/format";

export default function DisciplineOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: discipline, isLoading } = useDiscipline(id);
  const { data: alerts } = useGlobalAlerts();
  const { data: upcoming } = useUpcomingDeadlines(7);

  const disciplineAlerts = (alerts ?? []).filter((a) => a.disciplineId === id);
  const disciplineDeadlines = (upcoming ?? []).filter((l) => l.disciplineId === id);

  if (isLoading || !discipline) return <Skeleton className="h-72" />;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex-row items-center gap-3 pb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardDescription>Alunos</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-2xl font-semibold">
              {discipline.studentCount}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center gap-3 pb-2">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              <CardDescription>Listas ativas</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-2xl font-semibold">
              {discipline.activeListCount}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center gap-3 pb-2">
              <Archive className="h-4 w-4 text-muted-foreground" />
              <CardDescription>Encerradas</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-2xl font-semibold">
              {discipline.closedListCount}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock4 className="h-4 w-4" /> Próximos prazos
            </CardTitle>
            <Link
              href={routes.disciplineLists(id)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Ver todas as listas
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {disciplineDeadlines.length > 0 ? (
              disciplineDeadlines.map((l) => (
                <Link
                  key={l.id}
                  href={routes.list(id, l.id)}
                  className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2.5 hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.deadline ? formatDateTime(l.deadline) : "Sem prazo"}
                    </p>
                  </div>
                  {l.deadline && (
                    <span className="text-xs font-medium">{relativeFromNow(l.deadline)}</span>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum prazo próximo nesta disciplina.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href={routes.disciplineLists(id)}>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" /> Criar nova lista
              </Button>
            </Link>
            <Link href={routes.disciplineStudents(id)}>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" /> Adicionar alunos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> Alertas da disciplina
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {disciplineAlerts.length > 0 ? (
              disciplineAlerts.map((a) => (
                <Link
                  key={a.id}
                  href={a.link ?? "#"}
                  className="rounded-md border border-border bg-muted/20 p-3 hover:bg-muted/40"
                >
                  <p className="text-sm font-medium leading-snug">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum alerta nesta disciplina.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
