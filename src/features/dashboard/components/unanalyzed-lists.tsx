"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentlyClosedUnanalyzed } from "../hooks/use-dashboard";
import { formatDate } from "@/utils/format";
import { routes } from "@/config/routes";

export function UnanalyzedLists() {
  const { data, isLoading } = useRecentlyClosedUnanalyzed();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Listas pendentes de análise
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading ? (
          <Skeleton className="h-12" />
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
                  Encerrou em {l.deadline ? formatDate(l.deadline) : "—"}
                </p>
              </div>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Gerar análise →
              </span>
            </Link>
          ))
        ) : (
          <EmptyState
            title="Nada pendente"
            description="Todas as listas encerradas já foram analisadas."
          />
        )}
      </CardContent>
    </Card>
  );
}
