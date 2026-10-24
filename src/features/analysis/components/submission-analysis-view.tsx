"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, MessageSquare, Clock4, Send } from "lucide-react";
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
import { SessionIndicatorsPanel } from "./session-indicators-panel";
import { useSaveFeedback } from "../hooks/use-analysis";

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
  const saveFeedback = useSaveFeedback(discipline.id, problem.id, student.id);
  const [feedbackText, setFeedbackText] = useState(detail.teacherFeedback ?? "");
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  async function handleSaveFeedback() {
    if (!detail.sessionId) return;
    await saveFeedback.mutateAsync({ sessionId: detail.sessionId, feedback: feedbackText });
    setFeedbackSaved(true);
    setTimeout(() => setFeedbackSaved(false), 3000);
  }

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

          {detail.sessionId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Devolutiva ao aluno</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0">
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Escreva sua devolutiva para o aluno..."
                  className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleSaveFeedback}
                  disabled={saveFeedback.isPending || !feedbackText.trim()}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                  {saveFeedback.isPending ? "Salvando..." : feedbackSaved ? "Salvo!" : "Enviar devolutiva"}
                </button>
              </CardContent>
            </Card>
          )}
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
            <Tabs defaultValue="indicators">
              <TabsList>
                <TabsTrigger value="indicators">Indicadores</TabsTrigger>
                <TabsTrigger value="correction">Correção IA</TabsTrigger>
                <TabsTrigger value="hints">Dicas</TabsTrigger>
                <TabsTrigger value="transcript">Conversa</TabsTrigger>
              </TabsList>
              <TabsContent value="indicators">
                {detail.sessionId ? (
                  <SessionIndicatorsPanel sessionId={detail.sessionId} />
                ) : (
                  <p className="py-4 text-sm text-muted-foreground">
                    Sessão não disponível para este aluno.
                  </p>
                )}
              </TabsContent>
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
