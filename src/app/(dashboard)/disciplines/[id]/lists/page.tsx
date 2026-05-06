"use client";

import { use, useMemo, useState } from "react";
import { ListChecks, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateListDialog, ListsTable, useListsByDiscipline } from "@/features/lists";

export default function DisciplineListsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useListsByDiscipline(id);
  const [filter, setFilter] = useState<"all" | "active" | "closed" | "draft">("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data;
    return data.filter((l) => l.status === filter);
  }, [data, filter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="sm:w-44"
        >
          <option value="all">Todas</option>
          <option value="active">Ativas</option>
          <option value="closed">Encerradas</option>
          <option value="draft">Rascunhos</option>
        </Select>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Criar nova lista
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : filtered.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <ListsTable disciplineId={id} lists={filtered} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={<ListChecks />}
          title={data?.length ? "Nada nesse filtro" : "Nenhuma lista ainda"}
          description={
            data?.length
              ? "Tente outro filtro."
              : "Crie sua primeira lista de exercícios para esta disciplina."
          }
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Criar nova lista
            </Button>
          }
        />
      )}

      <CreateListDialog disciplineId={id} open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
