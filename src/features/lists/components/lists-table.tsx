"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Sparkles } from "lucide-react";
import { ListStatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPercent } from "@/utils/format";
import { routes } from "@/config/routes";
import type { ExerciseListSummary } from "@/types/entities";
import { DeadlineBadge } from "./deadline-badge";
import { EditListDialog } from "./edit-list-dialog";
import { useDeleteList } from "../hooks/use-lists";

export function ListsTable({
  disciplineId,
  lists,
}: {
  disciplineId: string;
  lists: ExerciseListSummary[];
}) {
  const deleteList = useDeleteList(disciplineId);

  const [editTarget, setEditTarget] = useState<ExerciseListSummary | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleDelete() {
    if (!confirmDeleteId) return;
    deleteList.mutate(confirmDeleteId, { onSuccess: () => setConfirmDeleteId(null) });
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lista</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead className="text-right">Exercícios</TableHead>
            <TableHead className="text-right">Entrega</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lists.map((l) => (
            <TableRow key={l.id}>
              <TableCell>
                <Link
                  href={routes.list(disciplineId, l.id)}
                  className="text-sm font-medium hover:underline"
                >
                  {l.name}
                </Link>
                {l.description && (
                  <p className="line-clamp-1 text-xs text-muted-foreground">{l.description}</p>
                )}
                {l.status === "closed" && l.hasConsolidatedAnalysis === false && (
                  <Badge variant="info" className="mt-1">
                    <Sparkles className="h-3 w-3" /> Análise pendente
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <ListStatusBadge status={l.status} />
              </TableCell>
              <TableCell>
                <DeadlineBadge deadline={l.deadline} />
              </TableCell>
              <TableCell className="text-right text-sm">{l.problemCount}</TableCell>
              <TableCell className="text-right text-sm">
                {l.deliveryRate !== undefined ? formatPercent(l.deliveryRate) : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditTarget(l)}
                    aria-label="Editar lista"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDeleteId(l.id)}
                    className="text-muted-foreground hover:text-red-600"
                    aria-label="Excluir lista"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit dialog */}
      {editTarget && (
        <EditListDialog
          disciplineId={disciplineId}
          list={editTarget}
          open={!!editTarget}
          onOpenChange={(v) => { if (!v) setEditTarget(null); }}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(v) => { if (!v) setConfirmDeleteId(null); }}>
        <DialogContent onClose={() => setConfirmDeleteId(null)}>
          <DialogHeader>
            <DialogTitle>Excluir lista?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Os exercícios da lista serão desvinculados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteList.isPending}>
              {deleteList.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
