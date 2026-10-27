"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Users, ListChecks, Settings, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { routes } from "@/config/routes";
import type { Discipline } from "@/types/entities";
import { useUpdateDiscipline, useDeleteDiscipline } from "../hooks/use-disciplines";

export function DisciplineCard({ discipline }: { discipline: Discipline }) {
  const router = useRouter();
  const update = useUpdateDiscipline(discipline.id);
  const remove = useDeleteDiscipline();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(discipline.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSaveEdit() {
    if (!editName.trim()) return;
    update.mutate({ name: editName.trim() }, { onSuccess: () => setEditOpen(false) });
  }

  function handleDelete() {
    remove.mutate(discipline.id, {
      onSuccess: () => {
        setConfirmDelete(false);
        router.push(routes.disciplines);
      },
    });
  }

  return (
    <>
      <div className="group relative">
        <Link href={routes.discipline(discipline.id)} className="block focus:outline-none">
          <Card className="h-full transition-colors group-hover:border-foreground/30 group-focus-visible:ring-2 group-focus-visible:ring-foreground/30">
            <CardHeader className="gap-2 pb-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={discipline.isArchived ? "secondary" : "outline"}>
                  {discipline.semester || "—"}
                </Badge>
                {discipline.isArchived && <Badge variant="secondary">Arquivada</Badge>}
              </div>
              <h3 className="line-clamp-2 text-base font-semibold leading-snug">
                {discipline.name}
              </h3>
              {discipline.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {discipline.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-3">
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {discipline.studentCount} alunos
                </div>
                <div className="flex items-center gap-1.5">
                  <ListChecks className="h-3.5 w-3.5" />
                  {discipline.activeListCount} ativas · {discipline.closedListCount} encerradas
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </CardContent>
          </Card>
        </Link>

        {/* Action buttons — aparecem no hover */}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.preventDefault(); setEditName(discipline.name); setEditOpen(true); }}
            aria-label="Renomear disciplina"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.preventDefault(); setConfirmDelete(true); }}
            className="text-muted-foreground hover:text-red-600"
            aria-label="Excluir disciplina"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { if (!v) setEditOpen(false); }}>
        <DialogContent onClose={() => setEditOpen(false)}>
          <DialogHeader>
            <DialogTitle>Renomear disciplina</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label>Nome</Label>
            <Input
              className="mt-1.5"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={update.isPending || !editName.trim()}>
              {update.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent onClose={() => setConfirmDelete(false)}>
          <DialogHeader>
            <DialogTitle>Excluir &ldquo;{discipline.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Todos os dados da disciplina serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={remove.isPending}>
              {remove.isPending ? "Excluindo..." : "Sim, excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
