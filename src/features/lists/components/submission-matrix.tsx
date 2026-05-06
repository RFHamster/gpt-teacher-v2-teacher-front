"use client";

import Link from "next/link";
import { CheckCircle2, CircleDashed, Clock4, MessageSquare } from "lucide-react";
import { cn } from "@/utils/cn";
import { routes } from "@/config/routes";
import { Avatar } from "@/components/ui/avatar";
import type {
  ExerciseList,
  Problem,
  Student,
  SubmissionCell,
  SubmissionStatus,
} from "@/types/entities";

const cellConfig: Record<
  SubmissionStatus,
  { icon: React.ReactNode; bg: string; label: string }
> = {
  delivered: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    bg: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
    label: "Entregou",
  },
  attempted: {
    icon: <Clock4 className="h-4 w-4" />,
    bg: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    label: "Tentou",
  },
  not_started: {
    icon: <CircleDashed className="h-4 w-4" />,
    bg: "bg-muted text-muted-foreground hover:bg-muted/80",
    label: "Não abriu",
  },
};

export function SubmissionMatrix({
  disciplineId,
  list,
  students,
  cells,
  onProblemClick,
  onStudentClick,
}: {
  disciplineId: string;
  list: ExerciseList;
  students: Student[];
  cells: SubmissionCell[];
  onProblemClick?: (problem: Problem) => void;
  onStudentClick?: (student: Student) => void;
}) {
  const cellMap = new Map<string, SubmissionCell>();
  cells.forEach((c) => cellMap.set(`${c.studentId}:${c.problemId}`, c));

  return (
    <div className="overflow-auto rounded-md border border-border bg-background">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-20 min-w-[12rem] border-b border-r border-border bg-background px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Aluno
            </th>
            {list.problems.map((p, idx) => (
              <th
                key={p.id}
                className="sticky top-0 z-10 border-b border-border bg-background px-2 py-2 text-center text-xs font-medium"
              >
                <button
                  onClick={() => onProblemClick?.(p)}
                  title={p.title}
                  className="line-clamp-2 max-w-[7rem] hover:underline"
                >
                  Ex {idx + 1}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((stu) => (
            <tr key={stu.id}>
              <th
                scope="row"
                className="sticky left-0 z-10 border-b border-r border-border bg-background px-3 py-2 text-left"
              >
                <button
                  onClick={() => onStudentClick?.(stu)}
                  className="flex items-center gap-2 text-left hover:underline"
                >
                  <Avatar name={stu.name ?? stu.email} size="sm" />
                  <span className="line-clamp-1 text-sm font-medium">
                    {stu.name ?? stu.email}
                  </span>
                </button>
              </th>
              {list.problems.map((p) => {
                const cell = cellMap.get(`${stu.id}:${p.id}`);
                const status: SubmissionStatus = cell?.status ?? "not_started";
                const cfg = cellConfig[status];
                return (
                  <td key={p.id} className="border-b border-border p-1 text-center">
                    <Link
                      href={routes.studentExercise(disciplineId, list.id, p.id, stu.id)}
                      className={cn(
                        "group inline-flex h-12 w-full min-w-[3.5rem] items-center justify-center rounded-md transition-colors",
                        cfg.bg,
                      )}
                      title={`${cfg.label}${cell && cell.messageCount ? ` · ${cell.messageCount} mensagens` : ""}`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        {cfg.icon}
                        {cell && cell.messageCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium opacity-70">
                            <MessageSquare className="h-2.5 w-2.5" />
                            {cell.messageCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
