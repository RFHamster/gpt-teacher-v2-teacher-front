"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LiveAlertsPanel } from "./live-alerts-panel";
import { SubmissionMatrix } from "./submission-matrix";
import type {
  ExerciseList,
  Student,
  SubmissionCell,
} from "@/types/entities";

export function ListActiveView({
  disciplineId,
  list,
  students,
  cells,
}: {
  disciplineId: string;
  list: ExerciseList;
  students: Student[];
  cells: SubmissionCell[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Card>
        <CardContent className="p-3">
          <SubmissionMatrix
            disciplineId={disciplineId}
            list={list}
            students={students}
            cells={cells}
          />
        </CardContent>
      </Card>
      <LiveAlertsPanel
        disciplineId={disciplineId}
        list={list}
        students={students}
        cells={cells}
      />
    </div>
  );
}
