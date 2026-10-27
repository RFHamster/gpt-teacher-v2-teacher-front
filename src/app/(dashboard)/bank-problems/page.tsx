"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, BookMarked, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BankProblemDialog,
  useBankProblems,
  useDeleteBankProblem,
  type BankProblem,
} from "@/features/bank-problems";

export default function BankProblemsPage() {
  const { data: problems, isLoading } = useBankProblems();
  const deleteMutation = useDeleteBankProblem();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BankProblem | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(p: BankProblem) {
    setEditing(p);
    setDialogOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm("Remover esta questão do banco?")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Banco de Questões</h1>
          <p className="text-sm text-muted-foreground">
            Questões pessoais reutilizáveis em qualquer turma.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nova questão
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !problems?.length ? (
        <EmptyState
          icon={<BookMarked />}
          title="Nenhuma questão ainda"
          description="Crie questões no seu banco pessoal e reutilize-as em qualquer turma."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Nova questão
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {problems.map((p) => (
                <li
                  key={p.id}
                  className="flex items-start justify-between gap-4 px-4 py-4"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-medium">{p.title}</span>
                    {p.category && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        <Badge variant="secondary" className="text-xs">
                          {p.category}
                        </Badge>
                      </span>
                    )}
                    {p.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2"
                      onClick={() => openEdit(p)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2"
                      onClick={() => handleDelete(p.id)}
                      disabled={deleteMutation.isPending}
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <BankProblemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />
    </div>
  );
}
