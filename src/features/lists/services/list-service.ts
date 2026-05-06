import { mockResponse, mockId, nowIso, delay } from "@/lib/mocks/utils";
import {
  exerciseLists,
  problemsByDiscipline,
  studentsByDiscipline,
  submissionsByList,
} from "@/lib/mocks/fixtures";
import type {
  ExerciseList,
  ExerciseListSummary,
  Problem,
  SubmissionCell,
} from "@/types/entities";

export interface CreateListInput {
  disciplineId: string;
  name: string;
  description?: string;
  deadline: string | null;
  problemIds: string[];
  publish: boolean;
}

let listsStore: ExerciseList[] = [...exerciseLists];

export const listService = {
  byDiscipline: (disciplineId: string) =>
    mockResponse<ExerciseListSummary[]>(
      listsStore.filter((l) => l.disciplineId === disciplineId).map((l) => ({ ...l })),
      300,
    ),

  byId: async (listId: string): Promise<ExerciseList> => {
    const found = listsStore.find((l) => l.id === listId);
    if (!found) throw new Error("Lista não encontrada");
    await delay(200);
    return found;
  },

  problemsForDiscipline: (disciplineId: string) =>
    mockResponse<Problem[]>(problemsByDiscipline[disciplineId] ?? [], 200),

  create: async (input: CreateListInput): Promise<ExerciseList> => {
    await delay(400);
    const allProblems = problemsByDiscipline[input.disciplineId] ?? [];
    const problems = input.problemIds
      .map((id) => allProblems.find((p) => p.id === id))
      .filter((p): p is Problem => !!p);
    const created: ExerciseList = {
      id: mockId("list"),
      disciplineId: input.disciplineId,
      name: input.name,
      description: input.description,
      deadline: input.deadline,
      status: input.publish ? "active" : "draft",
      problemCount: problems.length,
      createdAt: nowIso(),
      problems,
    };
    listsStore = [created, ...listsStore];
    return created;
  },

  updateDeadline: async (listId: string, deadline: string): Promise<void> => {
    listsStore = listsStore.map((l) => (l.id === listId ? { ...l, deadline } : l));
    await delay(200);
  },

  /** Matriz aluno×exercício (somente alunos ativos da disciplina). */
  matrix: async (listId: string) => {
    await delay(300);
    const list = listsStore.find((l) => l.id === listId);
    if (!list) throw new Error("Lista não encontrada");
    const students = (studentsByDiscipline[list.disciplineId] ?? []).filter(
      (s) => s.status === "active",
    );
    const cells = submissionsByList[listId] ?? [];

    // Se não houver mock de células para essa lista, gera dinamicamente.
    if (cells.length === 0 && students.length > 0) {
      const dynamic: SubmissionCell[] = [];
      students.forEach((stu, sIdx) => {
        list.problems.forEach((p, pIdx) => {
          const seed = (sIdx + pIdx) % 5;
          const status: SubmissionCell["status"] =
            seed === 0 ? "not_started" : seed === 1 ? "attempted" : "delivered";
          dynamic.push({
            studentId: stu.id,
            problemId: p.id,
            status,
            messageCount: status === "not_started" ? 0 : 4 + ((sIdx * 2 + pIdx * 3) % 30),
            timeSpentMinutes: status === "not_started" ? 0 : 8 + ((sIdx + pIdx) % 50),
            lastSessionAt: status === "not_started" ? undefined : nowIso(),
          });
        });
      });
      return { list, students, cells: dynamic };
    }
    return { list, students, cells };
  },
};
