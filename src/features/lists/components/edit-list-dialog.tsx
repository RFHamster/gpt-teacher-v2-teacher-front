"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useList, useProblemsForDiscipline } from "../hooks/use-lists";
import { listService } from "../services/list-service";
import type { ExerciseListSummary } from "@/types/entities";

export function EditListDialog({
  disciplineId,
  list,
  open,
  onOpenChange,
}: {
  disciplineId: string;
  list: ExerciseListSummary;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const { data: fullList, isLoading: loadingList } = useList(open ? list.id : undefined);
  const { data: bankProblems, isLoading: loadingBank } = useProblemsForDiscipline(open ? disciplineId : undefined);

  const [name, setName] = useState(list.name);
  const [deadline, setDeadline] = useState(list.deadline ? list.deadline.slice(0, 16) : "");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingUnassign, setPendingUnassign] = useState<Set<string>>(new Set());
  const [pendingAdd, setPendingAdd] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setName(list.name);
      setDeadline(list.deadline ? list.deadline.slice(0, 16) : "");
      setSearch("");
      setPendingUnassign(new Set());
      setPendingAdd(new Set());
    }
  }, [open, list]);

  const currentProblems = (fullList?.problems ?? []).filter(
    (p) => !pendingUnassign.has(p.id),
  );

  const availableBank = (bankProblems ?? []).filter(
    (p) =>
      !pendingAdd.has(p.id) &&
      (search ? p.title.toLowerCase().includes(search.toLowerCase()) : true),
  );

  async function handleSave() {
    setSaving(true);
    try {
      // 1. Atualiza nome/prazo
      await listService.update(list.id, {
        name: name.trim(),
        deadline: deadline || null,
      });

      // 2. Remove questões desvinculadas
      await Promise.all(
        [...pendingUnassign].map((id) => listService.unassignProblem(id)),
      );

      // 3. Adiciona novas questões do banco
      await Promise.all(
        [...pendingAdd].map((id) =>
          listService.addBankProblemToList(disciplineId, list.id, id),
        ),
      );

      qc.invalidateQueries({ queryKey: ["lists", "discipline", disciplineId] });
      qc.invalidateQueries({ queryKey: ["lists", "byId", list.id] });
      qc.invalidateQueries({ queryKey: ["lists", "matrix", list.id] });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <DialogContent className="max-w-2xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Editar lista</DialogTitle>
          <DialogDescription>Altere nome, prazo e questões vinculadas.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Nome e prazo */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Prazo</Label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Deixe em branco para sem prazo.</p>
            </div>
          </div>

          {/* Questões atuais */}
          <div className="flex flex-col gap-2">
            <Label>Questões na lista ({currentProblems.length})</Label>
            {loadingList ? (
              <Skeleton className="h-16" />
            ) : currentProblems.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                Nenhuma questão vinculada.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {currentProblems.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5"
                  >
                    <span className="flex-1 text-sm">{p.title}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingUnassign((prev) => new Set([...prev, p.id]))
                      }
                      className="text-muted-foreground hover:text-red-600"
                      aria-label="Remover da lista"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Adicionar do banco */}
          <div className="flex flex-col gap-2">
            <Label>Adicionar do banco de questões</Label>
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-44 overflow-y-auto rounded-md border border-border">
              {loadingBank ? (
                <Skeleton className="h-12 m-2" />
              ) : availableBank.length === 0 ? (
                <p className="p-3 text-xs text-muted-foreground">
                  Nenhuma questão disponível.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {availableBank.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2 px-2 py-1.5"
                    >
                      <p className="truncate text-sm flex-1">{p.title}</p>
                      {pendingAdd.has(p.id) ? (
                        <Badge variant="secondary" className="text-xs">Adicionada</Badge>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAdd((prev) => new Set([...prev, p.id]))
                          }
                          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Adicionar"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
