"use client";

import Link from "next/link";
import { Clock4 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpcomingDeadlines } from "../hooks/use-dashboard";
import { formatDateTime, relativeFromNow } from "@/utils/format";
import { routes } from "@/config/routes";

export function UpcomingDeadlines() {
  const { data, isLoading } = useUpcomingDeadlines(3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock4 className="h-4 w-4" /> Prazos nas próximas 72h
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading ? (
          <>
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </>
        ) : data && data.length > 0 ? (
          data.map((l) => (
            <Link
              key={l.id}
              href={routes.list(l.disciplineId, l.id)}
              className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2.5 transition-colors hover:bg-muted/40"
            >
              <div>
                <p className="text-sm font-medium">{l.name}</p>
                <p className="text-xs text-muted-foreground">
                  {l.deadline ? formatDateTime(l.deadline) : "Sem prazo"}
                </p>
              </div>
              {l.deadline && (
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  {relativeFromNow(l.deadline)}
                </span>
              )}
            </Link>
          ))
        ) : (
          <EmptyState
            title="Sem prazos urgentes"
            description="Nenhuma lista vence nas próximas 72h."
          />
        )}
      </CardContent>
    </Card>
  );
}
