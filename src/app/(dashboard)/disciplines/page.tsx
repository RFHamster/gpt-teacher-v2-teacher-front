"use client";

import { useMemo, useState } from "react";
import { Plus, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DisciplineCard,
  CreateDisciplineDialog,
  useDisciplines,
} from "@/features/disciplines";

export default function DisciplinesPage() {
  const { data, isLoading } = useDisciplines();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "archived">("active");
  const [semester, setSemester] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);

  const semesters = useMemo(
    () => Array.from(new Set((data ?? []).map((d) => d.semester))).sort().reverse(),
    [data],
  );

  const filtered = useMemo(() => {
    return (data ?? []).filter((d) => {
      if (filter === "active" && d.isArchived) return false;
      if (filter === "archived" && !d.isArchived) return false;
      if (semester !== "all" && d.semester !== semester) return false;
      if (query && !d.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [data, filter, semester, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Disciplinas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas disciplinas, alunos e listas de exercícios.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Criar disciplina
        </Button>
      </div>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="sm:w-44"
        >
          <option value="active">Ativas</option>
          <option value="archived">Arquivadas</option>
          <option value="all">Todas</option>
        </Select>
        <Select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="sm:w-36"
        >
          <option value="all">Todos semestres</option>
          {semesters.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <DisciplineCard key={d.id} discipline={d} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen />}
          title={data?.length ? "Nenhuma disciplina com esses filtros" : "Você ainda não tem disciplinas"}
          description={
            data?.length
              ? "Tente limpar os filtros ou alterar a busca."
              : "Crie sua primeira disciplina para começar a adicionar alunos e listas."
          }
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Criar disciplina
            </Button>
          }
        />
      )}

      <CreateDisciplineDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
