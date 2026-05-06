"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscipline } from "@/features/disciplines";
import { DisciplineHeader } from "@/features/disciplines/components/discipline-header";

export default function DisciplineLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = use(params);
  const { data: discipline, isLoading } = useDiscipline(id);

  return (
    <div className="flex flex-col gap-6">
      {isLoading || !discipline ? (
        <Skeleton className="h-32" />
      ) : (
        <DisciplineHeader discipline={discipline} />
      )}
      <div>{children}</div>
    </div>
  );
}
