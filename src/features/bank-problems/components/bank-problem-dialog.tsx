"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBankProblem, useUpdateBankProblem } from "../hooks/use-bank-problems";
import type { BankProblem } from "../services/bank-problem-service";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: BankProblem | null;
}

export function BankProblemDialog({ open, onOpenChange, editing }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const create = useCreateBankProblem();
  const update = useUpdateBankProblem(editing?.id ?? "");

  const isPending = create.isPending || update.isPending;
  const error =
    ((create.error || update.error) as { response?: { data?: { detail?: string } } } | null)
      ?.response?.data?.detail ??
    ((create.error || update.error) as Error | null)?.message;

  useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setDescription(editing?.description ?? "");
      setCategory(editing?.category ?? "");
      setFile(null);
      create.reset();
      update.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (editing) {
      update.mutate(
        { title: title.trim(), description: description.trim() || undefined, category: category.trim() || undefined },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create.mutate(
        { title: title.trim(), description: description.trim() || undefined, category: category.trim() || undefined, file: file ?? undefined },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar questão" : "Nova questão"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bp-title">Título *</Label>
            <Input
              id="bp-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ordenação por seleção"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bp-category">Categoria</Label>
            <Input
              id="bp-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Algoritmos, Estruturas de Dados..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bp-desc">Descrição</Label>
            <Textarea
              id="bp-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enunciado da questão..."
            />
          </div>

          {!editing && (
            <div className="flex flex-col gap-1.5">
              <Label>Arquivo (opcional)</Label>
              {file ? (
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <button type="button" onClick={() => setFile(null)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/40"
                >
                  <Upload className="h-4 w-4" />
                  Selecionar arquivo
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Salvando..." : editing ? "Salvar alterações" : "Criar questão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
