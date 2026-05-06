"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ListStatusBadge } from "@/components/ui/status-badge";
import { routes } from "@/config/routes";
import { formatDateTime } from "@/utils/format";
import type { Discipline, ExerciseList } from "@/types/entities";
import { DeadlineBadge } from "./deadline-badge";

export function ListPageHeader({
  discipline,
  list,
}: {
  discipline: Discipline;
  list: ExerciseList;
}) {
  const isClosed = list.status === "closed";
  return (
    <div className="flex flex-col gap-3">
      <Breadcrumb
        items={[
          { label: "Disciplinas", href: routes.disciplines },
          { label: discipline.name, href: routes.discipline(discipline.id) },
          { label: "Listas", href: routes.disciplineLists(discipline.id) },
          { label: list.name },
        ]}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{list.name}</h1>
            <ListStatusBadge status={list.status} />
            <DeadlineBadge deadline={list.deadline} />
          </div>
          {list.description && (
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">{list.description}</p>
          )}
        </div>
      </div>
      {isClosed && list.deadline && (
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Lista encerrada em <strong>{formatDateTime(list.deadline)}</strong>. Modo de análise reflexiva ativado.
          {list.hasConsolidatedAnalysis === false && (
            <Badge variant="info" className="ml-2">
              Análise IA pendente
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
