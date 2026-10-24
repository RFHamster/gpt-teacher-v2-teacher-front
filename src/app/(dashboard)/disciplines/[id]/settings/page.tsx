"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDiscipline, useUpdateDiscipline, useDeleteDiscipline } from "@/features/disciplines";
import { routes } from "@/config/routes";
import { Trash2 } from "lucide-react";

export default function DisciplineSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: discipline, isLoading } = useDiscipline(id);
  const update = useUpdateDiscipline(id);
  const remove = useDeleteDiscipline();

  const [name, setName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (discipline) setName(discipline.name);
  }, [discipline]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    update.mutate({ name: name.trim() });
  }

  function handleDelete() {
    remove.mutate(id, {
      onSuccess: () => {
        setConfirmOpen(false);
        router.push(routes.disciplines);
      },
    });
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Edit name */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações da disciplina</CardTitle>
          <CardDescription>Edite o nome da disciplina.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="disc-name">Nome</Label>
              <Input
                id="disc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da disciplina"
              />
            </div>
            <Button
              type="submit"
              disabled={update.isPending || !name.trim() || name.trim() === discipline?.name}
              className="self-start"
            >
              {update.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
            {update.isSuccess && (
              <p className="text-sm text-green-600">Disciplina atualizada com sucesso.</p>
            )}
            {update.isError && (
              <p className="text-sm text-red-600">Erro ao salvar. Tente novamente.</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/40">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Zona de perigo</CardTitle>
          <CardDescription>
            Excluir a disciplina remove permanentemente todas as suas listas e configurações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Excluir disciplina
          </Button>
          {remove.isError && (
            <p className="mt-2 text-sm text-red-600">Erro ao excluir. Tente novamente.</p>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent onClose={() => setConfirmOpen(false)}>
          <DialogHeader>
            <DialogTitle>Excluir &ldquo;{discipline?.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Todos os dados da disciplina serão removidos
              permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={remove.isPending}
            >
              {remove.isPending ? "Excluindo..." : "Sim, excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
