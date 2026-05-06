"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscipline } from "@/features/disciplines";
import { useSubmissionDetail, SubmissionAnalysisView } from "@/features/analysis";

export default function SubmissionAnalysisPage({
  params,
}: {
  params: Promise<{
    id: string;
    listId: string;
    problemId: string;
    studentId: string;
  }>;
}) {
  const { id, listId, problemId, studentId } = use(params);
  const { data: discipline } = useDiscipline(id);
  const { data, isLoading } = useSubmissionDetail(listId, problemId, studentId);
  const searchParams = useSearchParams();
  const axis = searchParams.get("axis") === "problems" ? "problems" : "students";

  if (isLoading || !data || !discipline) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <SubmissionAnalysisView
      discipline={discipline}
      list={data.list}
      problem={data.problem}
      student={data.student}
      detail={data.detail}
      siblingStudents={data.siblingStudents}
      siblingProblems={data.siblingProblems}
      axis={axis}
    />
  );
}
