"use client";

import Link from "next/link";
import { AlertTriangle, Bell, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalAlerts } from "../hooks/use-dashboard";
import type { DisciplineAlert } from "@/types/entities";
import { cn } from "@/utils/cn";

const severityIcon: Record<DisciplineAlert["severity"], React.ReactNode> = {
  critical: <AlertTriangle className="h-4 w-4 text-red-600" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-600" />,
  info: <Info className="h-4 w-4 text-blue-600" />,
};

const severityRing: Record<DisciplineAlert["severity"], string> = {
  critical: "border-l-red-500",
  warning: "border-l-amber-500",
  info: "border-l-blue-500",
};

export function AlertsPanel() {
  const { data, isLoading } = useGlobalAlerts();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-4 w-4" /> Alertas que precisam de atenção
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading ? (
          <>
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </>
        ) : data && data.length > 0 ? (
          data.map((a) => (
            <Link
              key={a.id}
              href={a.link ?? "#"}
              className={cn(
                "flex items-start gap-3 rounded-md border border-border border-l-4 bg-muted/20 p-3 transition-colors hover:bg-muted/40",
                severityRing[a.severity],
              )}
            >
              <div className="mt-0.5">{severityIcon[a.severity]}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState
            title="Nenhum alerta no momento"
            description="Tudo em ordem com suas disciplinas."
          />
        )}
      </CardContent>
    </Card>
  );
}
