"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscipline } from "@/features/disciplines";
import { useListMatrix } from "@/features/lists";
import { ListPageHeader } from "@/features/lists/components/list-page-header";
import { ListActiveView } from "@/features/lists/components/list-active-view";
import { ListClosedView } from "@/features/lists/components/list-closed-view";

export default function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string; listId: string }>;
}) {
  const { id, listId } = use(params);
  const { data: discipline } = useDiscipline(id);
  const { data, isLoading } = useListMatrix(listId);

  if (isLoading || !data || !discipline) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader discipline={discipline} list={data.list} />
      {data.list.status === "closed" ? (
        <ListClosedView
          disciplineId={id}
          list={data.list}
          students={data.students}
          cells={data.cells}
        />
      ) : (
        <ListActiveView
          disciplineId={id}
          list={data.list}
          students={data.students}
          cells={data.cells}
        />
      )}
    </div>
  );
}
