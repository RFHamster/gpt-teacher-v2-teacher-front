"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Download, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiStateIndicator } from "@/components/ui/ai-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { formatPercent } from "@/utils/format";
import { routes } from "@/config/routes";
import type {
  AiState,
  ExerciseList,
  Student,
  SubmissionCell,
} from "@/types/entities";
import { SubmissionMatrix } from "./submission-matrix";
import { ExportReportDialog } from "./export-report-dialog";

interface ListClosedViewProps {
  disciplineId: string;
  list: ExerciseList;
  students: Student[];
  cells: SubmissionCell[];
}

interface AggregateRow {
  problemId: string;
  problemTitle: string;
  delivered: number;
  attempted: number;
  notStarted: number;
  totalMessages: number;
  avgTime: number;
}

interface PerStudentRow {
  student: Student;
  delivered: number;
  attempted: number;
  notStarted: number;
  totalTime: number;
  totalMessages: number;
}

export function ListClosedView({ disciplineId, list, students, cells }: ListClosedViewProps) {
  const [aiState, setAiState] = useState<AiState>(
    list.hasConsolidatedAnalysis ? "ready" : "not_generated",
  );
  const [exportOpen, setExportOpen] = useState(false);

  function generate() {
    setAiState("generating");
    setTimeout(() => setAiState("ready"), 2200);
  }

  // Agregados por exercício
  const aggregates: AggregateRow[] = list.problems.map((p) => {
    const cellsOfProblem = cells.filter((c) => c.problemId === p.id);
    const delivered = cellsOfProblem.filter((c) => c.status === "delivered").length;
    const attempted = cellsOfProblem.filter((c) => c.status === "attempted").length;
    const notStarted = cellsOfProblem.filter((c) => c.status === "not_started").length;
    const totalMessages = cellsOfProblem.reduce((acc, c) => acc + c.messageCount, 0);
    const timesNonZero = cellsOfProblem.filter((c) => c.timeSpentMinutes > 0);
    const avgTime =
      timesNonZero.length > 0
        ? timesNonZero.reduce((acc, c) => acc + c.timeSpentMinutes, 0) / timesNonZero.length
        : 0;
    return {
      problemId: p.id,
      problemTitle: p.title,
      delivered,
      attempted,
      notStarted,
      totalMessages,
      avgTime: Math.round(avgTime),
    };
  });

  const totalCells = students.length * list.problems.length;
  const totalDelivered = aggregates.reduce((acc, a) => acc + a.delivered, 0);
  const overallDelivery = totalCells > 0 ? totalDelivered / totalCells : 0;

  // Por aluno
  const perStudent: PerStudentRow[] = students.map((stu) => {
    const studentCells = cells.filter((c) => c.studentId === stu.id);
    return {
      student: stu,
      delivered: studentCells.filter((c) => c.status === "delivered").length,
      attempted: studentCells.filter((c) => c.status === "attempted").length,
      notStarted: studentCells.filter((c) => c.status === "not_started").length,
      totalTime: studentCells.reduce((acc, c) => acc + c.timeSpentMinutes, 0),
      totalMessages: studentCells.reduce((acc, c) => acc + c.messageCount, 0),
    };
  });

  // Ranking de exercícios mais difíceis (mais "tentou + não abriu" + msgs)
  const ranking = [...aggregates].sort((a, b) => {
    const scoreB =
      (b.attempted + b.notStarted) * 2 + b.totalMessages / Math.max(students.length, 1);
    const scoreA =
      (a.attempted + a.notStarted) * 2 + a.totalMessages / Math.max(students.length, 1);
    return scoreB - scoreA;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" onClick={() => setExportOpen(true)}>
          <Download className="mr-2 h-4 w-4" /> Exportar relatório
        </Button>
        <AiStateIndicator
          state={aiState}
          onGenerate={generate}
          onRegenerate={generate}
          generateLabel="Gerar análise consolidada"
          regenerateLabel="Regenerar análise"
        />
      </div>

      {/* Indicadores agregados */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center gap-2 pb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <CardDescription>Taxa de entrega</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatPercent(overallDelivery)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-2 pb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardDescription>Alunos</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{students.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Exercícios</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{list.problems.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tempo médio (min/exerc.)</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {Math.round(
              aggregates.reduce((acc, a) => acc + a.avgTime, 0) /
                Math.max(aggregates.length, 1),
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por exercício */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por exercício</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {aggregates.map((a) => {
            const total = a.delivered + a.attempted + a.notStarted || 1;
            const dPct = (a.delivered / total) * 100;
            const aPct = (a.attempted / total) * 100;
            const nPct = (a.notStarted / total) * 100;
            return (
              <div key={a.problemId}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="line-clamp-1 font-medium">{a.problemTitle}</span>
                  <span className="text-muted-foreground">
                    {a.delivered} entreg. · {a.attempted} tent. · {a.notStarted} não abriu
                  </span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${dPct}%` }}
                    title={`Entregou: ${a.delivered}`}
                  />
                  <div
                    className="bg-amber-400"
                    style={{ width: `${aPct}%` }}
                    title={`Tentou: ${a.attempted}`}
                  />
                  <div
                    className="bg-muted-foreground/30"
                    style={{ width: `${nPct}%` }}
                    title={`Não abriu: ${a.notStarted}`}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Ranking de exercícios mais difíceis */}
      <Card>
        <CardHeader>
          <CardTitle>Exercícios que mais geraram dificuldade</CardTitle>
          <CardDescription>
            Ordenado por % de tentativas + volume de mensagens.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          {ranking.map((r, idx) => (
            <div
              key={r.problemId}
              className="flex items-center gap-3 rounded-md border border-border bg-muted/20 p-2.5"
            >
              <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
              <span className="flex-1 text-sm font-medium">{r.problemTitle}</span>
              <Badge variant="warning">{r.attempted + r.notStarted} alunos com dificuldade</Badge>
              <Badge variant="secondary">{r.totalMessages} msgs</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Insights da IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Insights pedagógicos consolidados
          </CardTitle>
          <CardDescription>Padrões coletivos identificados pela IA.</CardDescription>
        </CardHeader>
        <CardContent>
          {aiState === "not_generated" && (
            <p className="text-sm text-muted-foreground">
              A análise ainda não foi gerada. Clique em &quot;Gerar análise consolidada&quot; acima.
            </p>
          )}
          {aiState === "generating" && (
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-muted-foreground">
                A IA está analisando 100% das submissões da lista. Pode levar alguns segundos...
              </p>
            </div>
          )}
          {aiState === "ready" && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                <strong>Padrão dominante:</strong> a maioria dos alunos com dificuldade no exercício
                de <em>{ranking[0]?.problemTitle ?? "—"}</em> apresentou confusão entre passagem
                por valor e por referência. Recomenda-se revisar o tópico em aula.
              </p>
              <ul>
                <li>Cobertura média na lista: <strong>{formatPercent(overallDelivery)}</strong>.</li>
                <li>Exercícios mais críticos: <strong>{ranking[0]?.problemTitle}</strong>, <strong>{ranking[1]?.problemTitle}</strong>.</li>
                <li>Recomendação: dedicar 15min de aula a casos de teste, com foco em arrays vazios e edge cases — surgiram em ~30% das mensagens.</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matriz */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz aluno × exercício</CardTitle>
          <CardDescription>Clique numa célula para ver a análise individual.</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <SubmissionMatrix
            disciplineId={disciplineId}
            list={list}
            students={students}
            cells={cells}
          />
        </CardContent>
      </Card>

      {/* Tabela de alunos */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por aluno</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead className="text-right">% entrega</TableHead>
                <TableHead className="text-right">Entregues</TableHead>
                <TableHead className="text-right">Tentou</TableHead>
                <TableHead className="text-right">Não abriu</TableHead>
                <TableHead className="text-right">Msgs</TableHead>
                <TableHead className="text-right">Tempo (min)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perStudent.map((row) => {
                const pct = row.delivered / Math.max(list.problems.length, 1);
                return (
                  <TableRow key={row.student.id}>
                    <TableCell>
                      <Link
                        href={routes.studentInList(disciplineId, list.id, row.student.id)}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Avatar name={row.student.name ?? row.student.email} size="sm" />
                        <span className="text-sm font-medium">
                          {row.student.name ?? row.student.email}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatPercent(pct)}
                    </TableCell>
                    <TableCell className="text-right text-sm">{row.delivered}</TableCell>
                    <TableCell className="text-right text-sm">{row.attempted}</TableCell>
                    <TableCell className="text-right text-sm">{row.notStarted}</TableCell>
                    <TableCell className="text-right text-sm">{row.totalMessages}</TableCell>
                    <TableCell className="text-right text-sm">{row.totalTime}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ExportReportDialog open={exportOpen} onOpenChange={setExportOpen} listName={list.name} />
    </div>
  );
}
