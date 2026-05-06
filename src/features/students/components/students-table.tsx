"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/format";
import { routes } from "@/config/routes";
import type { Student } from "@/types/entities";

export function StudentsTable({
  students,
  disciplineId,
}: {
  students: Student[];
  disciplineId: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Cadastro</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((s) => (
          <TableRow key={s.id} className="cursor-pointer">
            <TableCell>
              <Link
                href={routes.studentProfile(disciplineId, s.id)}
                className="flex items-center gap-2.5 hover:underline"
              >
                <Avatar name={s.name ?? s.email} size="sm" />
                <span className="text-sm font-medium">
                  {s.name ?? <span className="text-muted-foreground">— sem cadastro —</span>}
                </span>
              </Link>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(s.createdAt)}
            </TableCell>
            <TableCell>
              {s.status === "active" ? (
                <Badge variant="success">Ativo</Badge>
              ) : (
                <Badge variant="warning">Convite pendente</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
