import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { routes } from "@/config/routes";
import type { Discipline } from "@/types/entities";
import { DisciplineTabs } from "./discipline-tabs";

export function DisciplineHeader({ discipline }: { discipline: Discipline }) {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: "Disciplinas", href: routes.disciplines },
          { label: discipline.name },
        ]}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{discipline.name}</h1>
            <Badge variant="outline">{discipline.semester}</Badge>
            {discipline.isArchived && <Badge variant="secondary">Arquivada</Badge>}
          </div>
          {discipline.description && (
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              {discipline.description}
            </p>
          )}
        </div>
      </div>
      <DisciplineTabs disciplineId={discipline.id} />
    </div>
  );
}
