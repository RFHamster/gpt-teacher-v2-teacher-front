"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { routes } from "@/config/routes";
import { formatPercent } from "@/utils/format";
import type {
  Discipline,
  ExerciseList,
  Problem,
  Student,
  SubmissionCell,
} from "@/types/entities";
import { StudentListTimeline } from "./student-list-timeline";
import { StudentGeneralNote } from "./student-general-note";
import { StudentHistoryList } from "./student-history-list";

interface Props {
  discipline: Discipline;
  list: ExerciseList;
  student: Student;
  problems: Problem[];
  cells: SubmissionCell[];
  delivered: number;
  attempted: number;
  notStarted: number;
  totalTime: number;
  totalMessages: number;
  generalNote: string;
  /** Para navegação ◀ ▶ entre alunos da mesma lista */
  siblingStudents: Student[];
}

export function StudentInListView({
  discipline,
  list,
  student,
  problems,
  cells,
  delivered,
  attempted,
  notStarted,
  totalTime,
  totalMessages,
  generalNote,
  siblingStudents,
}: Props) {
  const router = useRouter();
  const idx = siblingStudents.findIndex((s) => s.id === student.id);
  const prev = idx > 0 ? siblingStudents[idx - 1] : undefined;
  const next = idx < siblingStudents.length - 1 ? siblingStudents[idx + 1] : undefined;

  const goPrev = useMemo(
    () =>
      prev
        ? () => router.push(routes.studentInList(discipline.id, list.id, prev.id))
        : undefined,
    [prev, router, discipline.id, list.id],
  );
  const goNext = useMemo(
    () =>
      next
        ? () => router.push(routes.studentInList(discipline.id, list.id, next.id))
        : undefined,
    [next, router, discipline.id, list.id],
  );

  useKeyboardShortcuts([
    { key: "j", handler: () => goNext?.() },
    { key: "k", handler: () => goPrev?.() },
    { key: "ArrowRight", handler: () => goNext?.() },
    { key: "ArrowLeft", handler: () => goPrev?.() },
  ]);

  const total = problems.length || 1;
  const pct = delivered / total;

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: "Disciplinas", href: routes.disciplines },
          { label: discipline.name, href: routes.discipline(discipline.id) },
          { label: list.name, href: routes.list(discipline.id, list.id) },
          { label: student.name ?? student.email },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={student.name ?? student.email} size="lg" />
          <div>
            <h1 className="text-xl font-semibold">{student.name ?? student.email}</h1>
            <p className="text-sm text-muted-foreground">
              Análise consolidada na lista <strong>{list.name}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goPrev} disabled={!goPrev}>
            <ArrowLeft className="h-4 w-4" />
            <Kbd className="ml-1">K</Kbd>
          </Button>
          <Button variant="outline" size="sm" onClick={goNext} disabled={!goNext}>
            <Kbd className="mr-1">J</Kbd>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-1 pt-5">
            <span className="text-xs text-muted-foreground">% entrega</span>
            <span className="text-2xl font-semibold">{formatPercent(pct)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 pt-5">
            <span className="text-xs text-muted-foreground">Tempo total</span>
            <span className="text-2xl font-semibold">{totalTime}min</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 pt-5">
            <span className="text-xs text-muted-foreground">Interações (msgs)</span>
            <span className="text-2xl font-semibold">{totalMessages}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 pt-5">
            <span className="text-xs text-muted-foreground">Concl. / Tent. / Não abriu</span>
            <span className="text-lg font-semibold">
              {delivered} / {attempted} / {notStarted}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Coluna principal: timeline */}
        <StudentListTimeline
          disciplineId={discipline.id}
          list={list}
          studentId={student.id}
          problems={problems}
          cells={cells}
        />

        {/* Coluna lateral: anotações + histórico */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-5">
              <StudentGeneralNote studentId={student.id} initialNote={generalNote} />
            </CardContent>
          </Card>
          <StudentHistoryList
            disciplineId={discipline.id}
            studentId={student.id}
            currentListId={list.id}
          />
        </div>
      </div>
    </div>
  );
}
