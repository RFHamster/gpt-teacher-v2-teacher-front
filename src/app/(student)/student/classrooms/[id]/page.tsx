"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Code2, Tag, Settings, CheckCircle2, ChevronDown, ChevronRight, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useStudentClassroom,
  useStudentLists,
  useStudentProblems,
  useUpdateMethodology,
  METHODOLOGY_LABELS,
  METHODOLOGY_DESCRIPTIONS,
  type TeachingMethodology,
  type StudentList,
  type StudentProblem,
} from "@/features/student";
import { routes } from "@/config/routes";
import { cn } from "@/utils/cn";

const METHODOLOGY_OPTIONS: TeachingMethodology[] = ["socratic", "direct", "step_by_step"];

function ListSection({
  list,
  problems,
  classroomId,
}: {
  list: StudentList;
  problems: StudentProblem[];
  classroomId: string;
}) {
  const [open, setOpen] = useState(true);
  const isPast = list.deadline && new Date(list.deadline) < new Date();

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium text-sm">{list.name}</span>
          {list.deadline && (
            <Badge variant={isPast ? "secondary" : "info"} className="text-xs">
              {isPast ? "Encerrada" : `até ${new Date(list.deadline).toLocaleDateString("pt-BR")}`}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-1">
            {problems.length} exercício{problems.length !== 1 ? "s" : ""}
          </span>
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <ul className="divide-y divide-border">
          {problems.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground italic">
              Nenhum exercício nesta lista.
            </li>
          ) : (
            problems.map((p) => (
              <li key={p.id}>
                <Link
                  href={routes.studentProblem(classroomId, p.id)}
                  className="group flex items-start justify-between gap-4 px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-sm font-medium group-hover:underline">{p.title}</span>
                    {p.category && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                      </span>
                    )}
                    {p.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                    )}
                  </div>
                  <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default function StudentClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: classroom, isLoading: loadingClassroom } = useStudentClassroom(id);
  const { data: lists, isLoading: loadingLists } = useStudentLists(id);
  const { data: problems, isLoading: loadingProblems } = useStudentProblems(id);
  const updateMethodology = useUpdateMethodology(id);

  const storageKey = `methodology-${id}`;
  const [methodology, setMethodology] = useState<TeachingMethodology>("socratic");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as TeachingMethodology | null;
      if (stored) setMethodology(stored);
    } catch {}
  }, [storageKey]);

  async function handleMethodologyChange(m: TeachingMethodology) {
    setMethodology(m);
    setSaved(false);
    try {
      localStorage.setItem(storageKey, m);
    } catch {}
    await updateMethodology.mutateAsync(m);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isLoading = loadingClassroom || loadingLists || loadingProblems;

  // Agrupa problemas por list_id
  const problemsByList = (problems ?? []).reduce<Record<string, StudentProblem[]>>((acc, p) => {
    if (!p.list_id) return acc;
    (acc[p.list_id] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={routes.studentDashboard} className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Turmas
        </Link>
        <span>/</span>
        <span className="text-foreground">{classroom?.name ?? "..."}</span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{classroom?.name ?? "Carregando..."}</h1>
        <p className="text-sm text-muted-foreground">
          Escolha um exercício para praticar com o assistente de IA.
        </p>
      </div>

      {/* Listas e exercícios */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : !lists?.length ? (
        <EmptyState
          icon={<Code2 />}
          title="Nenhuma lista ainda"
          description="Seu professor ainda não criou listas de exercícios para esta turma."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {lists.map((list) => (
            <ListSection
              key={list.id}
              list={list}
              problems={problemsByList[list.id] ?? []}
              classroomId={id}
            />
          ))}
        </div>
      )}

      {/* Configuração de metodologia */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Metodologia de aprendizado
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Define como o assistente de IA vai te orientar nos exercícios desta turma.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {METHODOLOGY_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => handleMethodologyChange(m)}
              disabled={updateMethodology.isPending}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40",
                methodology === m
                  ? "border-primary bg-primary/5"
                  : "border-border",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors",
                  methodology === m
                    ? "border-primary bg-primary"
                    : "border-muted-foreground",
                )}
              />
              <div>
                <p className={cn("text-sm font-medium", methodology === m && "text-primary")}>
                  {METHODOLOGY_LABELS[m]}
                </p>
                <p className="text-xs text-muted-foreground">{METHODOLOGY_DESCRIPTIONS[m]}</p>
              </div>
            </button>
          ))}

          {saved && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Metodologia salva com sucesso
            </p>
          )}
          {updateMethodology.isError && (
            <p className="text-xs text-red-600">
              Erro ao salvar metodologia. Tente novamente.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
