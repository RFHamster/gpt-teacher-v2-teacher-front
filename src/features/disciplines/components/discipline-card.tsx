import Link from "next/link";
import { ArrowRight, Users, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { routes } from "@/config/routes";
import type { Discipline } from "@/types/entities";

export function DisciplineCard({ discipline }: { discipline: Discipline }) {
  return (
    <Link
      href={routes.discipline(discipline.id)}
      className="group block focus:outline-none"
    >
      <Card className="h-full transition-colors group-hover:border-foreground/30 group-focus-visible:ring-2 group-focus-visible:ring-foreground/30">
        <CardHeader className="gap-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={discipline.isArchived ? "secondary" : "outline"}>
              {discipline.semester}
            </Badge>
            {discipline.isArchived && (
              <Badge variant="secondary">Arquivada</Badge>
            )}
          </div>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">
            {discipline.name}
          </h3>
          {discipline.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {discipline.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {discipline.studentCount} alunos
            </div>
            <div className="flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" />
              {discipline.activeListCount} ativas · {discipline.closedListCount} encerradas
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  );
}
