"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth";
import { useActiveDisciplines } from "@/features/disciplines";
import { DisciplineCard } from "@/features/disciplines/components/discipline-card";
import {
  AlertsPanel,
  UpcomingDeadlines,
  UnanalyzedLists,
} from "@/features/dashboard";
import { routes } from "@/config/routes";

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: disciplines, isLoading } = useActiveDisciplines();
  const currentSemester = disciplines?.[0]?.semester ?? "";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">
          {greet()}
          {user ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {currentSemester ? `Semestre letivo ${currentSemester}` : "Bem-vindo de volta."}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AlertsPanel />
        <div className="grid gap-4">
          <UpcomingDeadlines />
          <UnanalyzedLists />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Suas disciplinas ativas</h2>
          <Link
            href={routes.disciplines}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : disciplines && disciplines.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {disciplines.map((d) => (
              <DisciplineCard key={d.id} discipline={d} />
            ))}
          </div>
        ) : (
          <Link href={routes.disciplines}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Criar primeira disciplina
            </Button>
          </Link>
        )}
      </section>
    </div>
  );
}
