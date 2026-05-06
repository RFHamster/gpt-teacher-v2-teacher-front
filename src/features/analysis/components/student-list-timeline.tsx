"use client";

import Link from "next/link";
import { CheckCircle2, CircleDashed, Clock4, MessageSquare, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { routes } from "@/config/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ExerciseList,
  Problem,
  SubmissionCell,
  SubmissionStatus,
} from "@/types/entities";

const itemConfig: Record<
  SubmissionStatus,
  { icon: React.ReactNode; ring: string; bg: string; label: string }
> = {
  delivered: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    ring: "ring-emerald-500/40",
    bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    label: "Entregou",
  },
  attempted: {
    icon: <Clock4 className="h-4 w-4" />,
    ring: "ring-amber-500/40",
    bg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    label: "Tentou",
  },
  not_started: {
    icon: <CircleDashed className="h-4 w-4" />,
    ring: "ring-muted-foreground/20",
    bg: "bg-muted text-muted-foreground",
    label: "Não abriu",
  },
};

export function StudentListTimeline({
  disciplineId,
  list,
  studentId,
  problems,
  cells,
}: {
  disciplineId: string;
  list: ExerciseList;
  studentId: string;
  problems: Problem[];
  cells: SubmissionCell[];
}) {
  const cellByProblem = new Map<string, SubmissionCell>();
  cells.forEach((c) => cellByProblem.set(c.problemId, c));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Linha do tempo da lista</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative flex flex-col gap-3 border-l border-border pl-6">
          {problems.map((p, idx) => {
            const cell = cellByProblem.get(p.id);
            const status: SubmissionStatus = cell?.status ?? "not_started";
            const cfg = itemConfig[status];
            return (
              <li key={p.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[33px] flex h-7 w-7 items-center justify-center rounded-full ring-4",
                    cfg.bg,
                    cfg.ring,
                  )}
                >
                  {cfg.icon}
                </span>
                <Link
                  href={routes.studentExercise(disciplineId, list.id, p.id, studentId)}
                  className="group flex items-start justify-between gap-2 rounded-md border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        Ex {idx + 1}
                      </span>
                      <span className="line-clamp-1 text-sm font-medium">{p.title}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{cfg.label}</span>
                      {cell && cell.timeSpentMinutes > 0 && (
                        <span>{cell.timeSpentMinutes}min</span>
                      )}
                      {cell && cell.messageCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {cell.messageCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
