"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, MessageSquare, Clock4 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Kbd } from "@/components/ui/kbd";
import { SubmissionStatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { routes } from "@/config/routes";
import type {
  Discipline,
  ExerciseList,
  Problem,
  Student,
  SubmissionDetail,
} from "@/types/entities";
import { CodeViewer } from "./code-viewer";
import { ConversationTranscript } from "./conversation-transcript";
import { CellTeacherNote } from "./cell-teacher-note";
import { AiCorrectionPanel } from "./ai-correction-panel";
import { AiHintsPanel } from "./ai-hints-panel";

interface Props {
  discipline: Discipline;
  list: ExerciseList;
  problem: Problem;
  student: Student;
  detail: SubmissionDetail;
  siblingStudents: Student[];
  siblingProblems: Problem[];
  /** Eixo de navegação (◀ ▶): "students" navega entre alunos do mesmo exercício; "problems" navega entre exercícios deste aluno. */
  axis?: "students" | "problems";
}

export function SubmissionAnalysisView({
  discipline,
  list,
  problem,
  student,
  detail,
  siblingStudents,
  siblingProblems,
  axis: defaultAxis = "students",
}: Props) {
  const router = useRouter();

  // Encontrar índices para navegação
  const studentIdx = siblingStudents.findIndex((s) => s.id === student.id);
  const problemIdx = siblingProblems.findIndex((p) => p.id === problem.id);

  const prevStudent =
    studentIdx > 0 ? siblingStudents[studentIdx - 1] : undefined;
  const nextStudent =
    studentIdx < siblingStudents.length - 1 ? siblingStudents[studentIdx + 1] : undefined;
  const prevProblem =
    problemIdx > 0 ? siblingProblems[problemIdx - 1] : undefined;
  const nextProblem =
    problemIdx < siblingProblems.length - 1 ? siblingProblems[problemIdx + 1] : undefined;

  const axis = defaultAxis;

  const goPrev = useMemo(() => {
    if (axis === "students" && prevStudent) {
      return () =>
        router.push(routes.studentExercise(discipline.id, list.id, problem.id, prevStudent.id));
    }
    if (axis === "problems" && prevProblem) {
      return () =>
        router.push(routes.studentExercise(discipline.id, list.id, prevProblem.id, student.id));
    }
    return undefined;
  }, [axis, prevStudent, prevProblem, router, discipline.id, list.id, problem.id, student.id]);

  const goNext = useMemo(() => {
    if (axis === "students" && nextStudent) {
      return () =>
        router.push(routes.studentExercise(discipline.id, list.id, problem.id, nextStudent.id));
    }
    if (axis === "problems" && nextProblem) {
      return () =>
        router.push(routes.studentExercise(discipline.id, list.id, nextProblem.id, student.id));
    }
    return undefined;
  }, [axis, nextStudent, nextProblem, router, discipline.id, list.id, problem.id, student.id]);

  useKeyboardShortcuts([
    {
      key: "j",
      handler: () => goNext?.(),
      description: "Próximo na lista",
    },
    {
      key: "k",
      handler: () => goPrev?.(),
      description: "Anterior na lista",
    },
    {
      key: "ArrowRight",
      handler: () => goNext?.(),
    },
    {
      key: "ArrowLeft",
      handler: () => goPrev?.(),
    },
  ]);

  function onChangeAxis(v: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("axis", v);
    router.replace(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: "Disciplinas", href: routes.disciplines },
          { label: discipline.name, href: routes.discipline(discipline.id) },
          { label: list.name, href: routes.list(discipline.id, list.id) },
          { label: problem.title },
          { label: student.name ?? student.email },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={student.name ?? student.email} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{student.name ?? student.email}</h1>
              <SubmissionStatusBadge status={detail.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {problem.title} · {detail.timeSpentMinutes}min ·{" "}
              <MessageSquare className="inline h-3 w-3" /> {detail.messageCount} msgs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={axis} onChange={(e) => onChangeAxis(e.target.value)} className="w-44">
            <option value="students">Navegar entre alunos</option>
            <option value="problems">Navegar entre exercícios</option>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={!goPrev}
            aria-label="Anterior"
          >
            <ArrowLeft className="h-4 w-4" />
            <Kbd className="ml-1">K</Kbd>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={!goNext}
            aria-label="Próximo"
          >
            <Kbd className="mr-1">J</Kbd>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)_22rem]">
        {/* Coluna 1 - Enunciado e contexto */}
        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Enunciado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{problem.statement}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock4 className="h-3 w-3" /> {detail.timeSpentMinutes}min
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> {detail.messageCount} mensagens
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <CellTeacherNote
                studentId={student.id}
                problemId={problem.id}
                initialNote={detail.teacherNote}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2 - Código entregue */}
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Código entregue</CardTitle>
            <SubmissionStatusBadge status={detail.status} />
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            <CodeViewer code={detail.code} language={detail.codeLanguage} />
          </CardContent>
        </Card>

        {/* Coluna 3 - IA + transcript */}
        <Card>
          <CardContent className="pt-4">
            <Tabs defaultValue="correction">
              <TabsList>
                <TabsTrigger value="correction">Correção</TabsTrigger>
                <TabsTrigger value="hints">Dicas</TabsTrigger>
                <TabsTrigger value="transcript">Conversa</TabsTrigger>
              </TabsList>
              <TabsContent value="correction">
                <AiCorrectionPanel studentId={student.id} problemId={problem.id} />
              </TabsContent>
              <TabsContent value="hints">
                <AiHintsPanel studentId={student.id} problemId={problem.id} />
              </TabsContent>
              <TabsContent value="transcript">
                <ConversationTranscript messages={detail.messages} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
