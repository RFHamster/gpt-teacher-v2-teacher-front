"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
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
import { formatPercent } from "@/utils/format";
import { routes } from "@/config/routes";
import type { ExerciseListSummary } from "@/types/entities";
import { DeadlineBadge } from "./deadline-badge";

export function ListsTable({
  disciplineId,
  lists,
}: {
  disciplineId: string;
  lists: ExerciseListSummary[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Lista</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Prazo</TableHead>
          <TableHead className="text-right">Exercícios</TableHead>
          <TableHead className="text-right">Entrega</TableHead>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
