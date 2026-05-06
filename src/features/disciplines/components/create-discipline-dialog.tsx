"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { Select } from "@/components/ui/select";
import { useCreateDiscipline } from "../hooks/use-disciplines";
import { createDisciplineSchema } from "../schemas";
import { routes } from "@/config/routes";

function defaultSemester(): string {
  const now = new Date();
  const year = now.getFullYear();
  const period = now.getMonth() < 6 ? 1 : 2;
  return `${year}.${period}`;
}

const semesterOptions = (() => {
  const opts: string[] = [];
  const year = new Date().getFullYear();
  for (let y = year + 1; y >= year - 1; y--) {
    opts.push(`${y}.2`, `${y}.1`);
  }
  return opts;
})();

export function CreateDisciplineDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [semester, setSemester] = useState(defaultSemester());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = useCreateDiscipline();

  function reset() {
    setName("");
    setDescription("");
    setSemester(defaultSemester());
    setErrors({});
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = createDisciplineSchema.safeParse({
      name,
      description: description || undefined,
      semester,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    create.mutate(parsed.data, {
      onSuccess: (created) => {
        reset();
        onOpenChange(false);
        router.push(routes.discipline(created.id));
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Criar nova disciplina</DialogTitle>
          <DialogDescription>
            Defina os dados básicos. Você adiciona alunos e listas em seguida.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome da disciplina</Label>
            <Input
              id="name"
              placeholder="Ex: Algoritmos e Estruturas de Dados I"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Ementa resumida ou observações..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="semester">Semestre / período letivo</Label>
            <Select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
            >
              {semesterOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            {errors.semester && <p className="text-xs text-red-600">{errors.semester}</p>}
          </div>

          {create.isError && (
            <p className="text-xs text-red-600">
              {(create.error as Error)?.message ?? "Falha ao criar."}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Criando..." : "Criar disciplina"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
