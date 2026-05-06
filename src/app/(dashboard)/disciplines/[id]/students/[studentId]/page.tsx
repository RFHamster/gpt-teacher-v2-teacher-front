"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscipline } from "@/features/disciplines";
import { useStudent } from "@/features/students";
import { StudentProfileView } from "@/features/analysis";

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const { id, studentId } = use(params);
  const { data: discipline } = useDiscipline(id);
  const { data: student, isLoading } = useStudent(id, studentId);

  if (isLoading || !discipline || !student) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return <StudentProfileView discipline={discipline} student={student} />;
}
