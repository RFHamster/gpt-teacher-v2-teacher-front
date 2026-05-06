"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscipline } from "@/features/disciplines";
import { useStudentsByDiscipline } from "@/features/students";
import { useStudentInListSummary } from "@/features/analysis";
import { StudentInListView } from "@/features/analysis/components/student-in-list-view";

export default function StudentInListPage({
  params,
}: {
  params: Promise<{ id: string; listId: string; studentId: string }>;
}) {
  const { id, listId, studentId } = use(params);
  const { data: discipline } = useDiscipline(id);
  const { data: students } = useStudentsByDiscipline(id);
  const { data, isLoading } = useStudentInListSummary(listId, studentId);

  if (isLoading || !data || !discipline) {
    return <Skeleton className="h-96" />;
  }

  const siblingStudents = (students ?? []).filter((s) => s.status === "active");

  return (
    <StudentInListView
      discipline={discipline}
      list={data.list}
      student={data.student}
      problems={data.problems}
      cells={data.cells}
      delivered={data.delivered}
      attempted={data.attempted}
      notStarted={data.notStarted}
      totalTime={data.totalTime}
      totalMessages={data.totalMessages}
      generalNote={data.generalNote}
      siblingStudents={siblingStudents}
    />
  );
}
