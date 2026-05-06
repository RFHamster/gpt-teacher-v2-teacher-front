"use client";

import Link from "next/link";
import { AlertTriangle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { routes } from "@/config/routes";
import type {
  ExerciseList,
  Student,
  SubmissionCell,
} from "@/types/entities";

interface LiveAlertsPanelProps {
  disciplineId: string;
  list: ExerciseList;
  students: Student[];
  cells: SubmissionCell[];
}

export function LiveAlertsPanel({
  disciplineId,
  list,
  students,
  cells,
}: LiveAlertsPanelProps) {
  const studentById = new Map(students.map((s) => [s.id, s]));

  // 1) Alunos que não abriram nada
  const inactivityByStudent = new Map<string, number>();
  students.forEach((s) => inactivityByStudent.set(s.id, 0));
  cells.forEach((c) => {
    if (c.status !== "not_started") {
      inactivityByStudent.set(c.studentId, (inactivityByStudent.get(c.studentId) ?? 0) + 1);
    }
  });
  const noActivity = students
    .filter((s) => inactivityByStudent.get(s.id) === 0)
    .slice(0, 8);

  // 2) Pares (aluno, exercício) com volume alto de mensagens
  const HIGH_VOLUME = 25;
  const highVolume = cells
    .filter((c) => c.messageCount >= HIGH_VOLUME)
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Não abriram nada ({noActivity.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          {noActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground">Todos os alunos têm alguma atividade.</p>
          ) : (
            noActivity.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-2 py-1.5"
              >
                <Avatar name={s.name ?? s.email} size="sm" />
                <span className="line-clamp-1 flex-1 text-xs font-medium">
                  {s.name ?? s.email}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-amber-600" />
            Volume alto de mensagens ({highVolume.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          {highVolume.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Ninguém com volume preocupante de mensagens.
            </p>
          ) : (
            highVolume.map((cell) => {
              const stu = studentById.get(cell.studentId);
              const problem = list.problems.find((p) => p.id === cell.problemId);
              if (!stu || !problem) return null;
              return (
                <Link
                  key={`${cell.studentId}-${cell.problemId}`}
                  href={routes.studentExercise(disciplineId, list.id, problem.id, stu.id)}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-2 py-1.5 hover:bg-muted/40"
                >
                  <Avatar name={stu.name ?? stu.email} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-medium">{stu.name ?? stu.email}</p>
                    <p className="line-clamp-1 text-[10px] text-muted-foreground">
                      {problem.title}
                    </p>
                  </div>
                  <span className="text-xs font-semibold">{cell.messageCount}</span>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
