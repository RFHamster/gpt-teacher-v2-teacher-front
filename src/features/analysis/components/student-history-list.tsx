"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListStatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentHistory } from "../hooks/use-analysis";
import { routes } from "@/config/routes";
import { formatPercent } from "@/utils/format";
import type { ExerciseListStatus } from "@/types/entities";

export function StudentHistoryList({
  disciplineId,
  studentId,
  currentListId,
}: {
  disciplineId: string;
  studentId: string;
  currentListId?: string;
}) {
  const { data, isLoading } = useStudentHistory(disciplineId, studentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Histórico do aluno na disciplina</CardTitle>
        <CardDescription>Outras listas de que participou e taxa de entrega.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {isLoading ? (
          <Skeleton className="h-12" />
        ) : data && data.length > 0 ? (
          data.map((h) => {
            const isCurrent = h.listId === currentListId;
            const content = (
              <>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">
                    {h.listName}{" "}
                    {isCurrent && <Badge variant="secondary">atual</Badge>}
                  </p>
                  <ListStatusBadge status={h.status as ExerciseListStatus} />
                </div>
                <Badge variant="outline">{formatPercent(h.deliveryRate)}</Badge>
              </>
            );
            return isCurrent ? (
              <div
                key={h.listId}
                className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2"
              >
                {content}
              </div>
            ) : (
              <Link
                key={h.listId}
                href={routes.studentInList(disciplineId, h.listId, studentId)}
                className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 hover:bg-muted/40"
              >
                {content}
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">Sem histórico ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}
