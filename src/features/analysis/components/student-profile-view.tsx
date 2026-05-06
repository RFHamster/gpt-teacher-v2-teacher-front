"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { formatDate, formatPercent } from "@/utils/format";
import { useStudentAggregate } from "../hooks/use-student-aggregate";
import { StudentGeneralNote } from "./student-general-note";
import { StudentHistoryList } from "./student-history-list";
import type { Discipline, Student } from "@/types/entities";

export function StudentProfileView({
  discipline,
  student,
}: {
  discipline: Discipline;
  student: Student;
}) {
  const { data: aggregate, isLoading } = useStudentAggregate(discipline.id, student.id);

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: "Disciplinas", href: routes.disciplines },
          { label: discipline.name, href: routes.discipline(discipline.id) },
          { label: "Alunos", href: routes.disciplineStudents(discipline.id) },
          { label: student.name ?? student.email },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={student.name ?? student.email} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{student.name ?? student.email}</h1>
              {student.status === "pending" && <Badge variant="warning">Convite pendente</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {student.email} · entrou em {formatDate(student.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Resumo agregado */}
      <div className="grid gap-3 md:grid-cols-4">
        {isLoading || !aggregate ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-col gap-1 pt-5">
                <span className="text-xs text-muted-foreground">Taxa de entrega geral</span>
                <span className="text-2xl font-semibold">
                  {formatPercent(aggregate.overallDeliveryRate)}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 pt-5">
                <span className="text-xs text-muted-foreground">Listas participadas</span>
                <span className="text-2xl font-semibold">{aggregate.totalLists}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 pt-5">
                <span className="text-xs text-muted-foreground">Tempo total</span>
                <span className="text-2xl font-semibold">{aggregate.totalTimeMinutes}min</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 pt-5">
                <span className="text-xs text-muted-foreground">Interações totais</span>
                <span className="text-2xl font-semibold">{aggregate.totalMessages}</span>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dados básicos</CardTitle>
            <CardDescription>Informações vindas do cadastro do aluno.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Nome</dt>
                <dd className="font-medium">{student.name ?? "— sem cadastro —"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-medium">{student.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="font-medium capitalize">
                  {student.status === "pending" ? "Convite pendente" : "Ativo"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Entrou em</dt>
                <dd className="font-medium">{formatDate(student.createdAt)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="mb-2 text-xs text-muted-foreground">Tendência</dt>
                <dd>
                  {!isLoading && aggregate ? (
                    aggregate.overallDeliveryRate >= 0.8 ? (
                      <Badge variant="success">Bom desempenho</Badge>
                    ) : aggregate.overallDeliveryRate >= 0.5 ? (
                      <Badge variant="warning">Atenção recomendada</Badge>
                    ) : (
                      <Badge variant="danger">Risco — intervir</Badge>
                    )
                  ) : (
                    <Skeleton className="h-5 w-32" />
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-5">
              <StudentGeneralNote
                studentId={student.id}
                initialNote={aggregate?.generalNote ?? ""}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <StudentHistoryList disciplineId={discipline.id} studentId={student.id} />
    </div>
  );
}
