"use client";

import { use, useMemo, useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AddStudentsDialog,
  StudentsTable,
  useStudentsByDiscipline,
} from "@/features/students";

export default function DisciplineStudentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useStudentsByDiscipline(id);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (s) =>
        s.email.toLowerCase().includes(q) || (s.name?.toLowerCase().includes(q) ?? false),
    );
  }, [data, query]);

  const pending = (data ?? []).filter((s) => s.status === "pending").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          {pending > 0 && (
            <span className="text-xs text-muted-foreground">
              {pending} convite{pending === 1 ? "" : "s"} pendente{pending === 1 ? "" : "s"}
            </span>
          )}
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar alunos
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : filtered.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <StudentsTable students={filtered} disciplineId={id} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={<Users />}
          title={data?.length ? "Nenhum aluno corresponde à busca" : "Nenhum aluno ainda"}
          description={
            data?.length
              ? "Tente outro termo de busca."
              : "Adicione alunos por planilha CSV ou colando uma lista de emails."
          }
          action={
            !data?.length && (
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar alunos
              </Button>
            )
          }
        />
      )}

      <AddStudentsDialog
        disciplineId={id}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
    </div>
  );
}
