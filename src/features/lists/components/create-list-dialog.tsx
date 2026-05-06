"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCreateList, useProblemsForDiscipline } from "../hooks/use-lists";
import { routes } from "@/config/routes";
import type { Problem } from "@/types/entities";
import { cn } from "@/utils/cn";

export function CreateListDialog({
  disciplineId,
  open,
  onOpenChange,
}: {
  disciplineId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const { data: problems } = useProblemsForDiscipline(disciplineId);
  const create = useCreateList(disciplineId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Problem[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function reset() {
    setName("");
    setDescription("");
    setDeadline("");
    setSelected([]);
    setSearch("");
  }

  function add(p: Problem) {
    if (selected.find((s) => s.id === p.id)) return;
    setSelected((prev) => [...prev, p]);
  }
  function remove(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }
  function move(fromId: string, toId: string) {
    if (fromId === toId) return;
    setSelected((prev) => {
      const fromIdx = prev.findIndex((p) => p.id === fromId);
      const toIdx = prev.findIndex((p) => p.id === toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [removed] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, removed!);
      return next;
    });
  }

  const filtered = (problems ?? []).filter(
    (p) =>
      !selected.find((s) => s.id === p.id) &&
      (search ? p.title.toLowerCase().includes(search.toLowerCase()) : true),
  );

  function submit(publish: boolean) {
    return (e: FormEvent) => {
      e.preventDefault();
      if (!name.trim() || selected.length === 0) return;
      create.mutate(
        {
          name,
          description: description || undefined,
          deadline: publish && deadline ? new Date(deadline).toISOString() : null,
          problemIds: selected.map((p) => p.id),
          publish,
        },
        {
          onSuccess: (created) => {
            reset();
            onOpenChange(false);
            router.push(routes.list(disciplineId, created.id));
          },
        },
      );
    };
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-2xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Criar nova lista</DialogTitle>
          <DialogDescription>
            Defina um prazo e adicione problemas. Você pode salvar como rascunho e publicar depois.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="list-name">Nome</Label>
              <Input
                id="list-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lista 5 — Recursão"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="list-desc">Descrição (opcional)</Label>
              <Textarea
                id="list-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="list-deadline">Prazo</Label>
              <Input
                id="list-deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para salvar como rascunho.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Problemas selecionados ({selected.length})</Label>
            {selected.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                Adicione problemas do banco abaixo. Arraste para reordenar.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {selected.map((p) => (
                  <li
                    key={p.id}
                    draggable
                    onDragStart={() => setDraggingId(p.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggingId) move(draggingId, p.id);
                      setDraggingId(null);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5",
                      draggingId === p.id && "opacity-50",
                    )}
                  >
                    <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                    <span className="flex-1 text-sm">{p.title}</span>
                    <Badge variant="outline">{p.difficulty}</Badge>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="text-muted-foreground hover:text-red-600"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="list-search">Banco de problemas</Label>
            <Input
              id="list-search"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto rounded-md border border-border">
              {filtered.length === 0 ? (
                <p className="p-3 text-xs text-muted-foreground">
                  Nenhum problema disponível para adicionar.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {filtered.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2 px-2 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{p.title}</p>
                      </div>
                      <Badge variant="outline">{p.difficulty}</Badge>
                      <button
                        type="button"
                        onClick={() => add(p)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Adicionar"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={submit(false)}
              disabled={create.isPending || !name || selected.length === 0}
            >
              Salvar rascunho
            </Button>
            <Button
              type="button"
              onClick={submit(true)}
              disabled={create.isPending || !name || selected.length === 0 || !deadline}
            >
              {create.isPending ? "Publicando..." : "Publicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
