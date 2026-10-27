import { api } from "@/lib/api/client";
import { nowIso } from "@/lib/mocks/utils";
import type { ExerciseList, ExerciseListSummary, Problem, SubmissionCell } from "@/types/entities";

// ── Tipos raw do backend ──────────────────────────────────────────────────────

interface ListPublic {
  id: string;
  classroom_id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  created_at: string;
}

interface ProblemPublic {
  id: string;
  classroom_id: string;
  list_id: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  file_path?: string | null;
  is_sandbox: boolean;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapProblem(p: ProblemPublic): Problem {
  return {
    id: p.id,
    disciplineId: p.classroom_id,
    title: p.title,
    statement: p.description ?? "",
    difficulty: "medium",
    createdAt: nowIso(),
  };
}

function mapList(l: ListPublic, problems: ProblemPublic[]): ExerciseList {
  const listProblems = problems.filter((p) => p.list_id === l.id && !p.is_sandbox);
  return {
    id: l.id,
    disciplineId: l.classroom_id,
    name: l.name,
    description: l.description ?? undefined,
    deadline: l.deadline,
    status: l.deadline && new Date(l.deadline) < new Date() ? "closed" : "active",
    problemCount: listProblems.length,
    createdAt: l.created_at,
    problems: listProblems.map(mapProblem),
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export interface CreateListInput {
  disciplineId: string;
  name: string;
  description?: string;
  deadline: string | null;
  problemIds: string[];     // existing classroom problems to assign
  bankProblemIds: string[]; // bank problems to copy + assign
  publish: boolean;
}

export interface UpdateListInput {
  name?: string;
  description?: string;
  deadline?: string | null;
}

export const listService = {
  // Lista todas as listas de uma disciplina (classroom)
  byDiscipline: async (disciplineId: string): Promise<ExerciseListSummary[]> => {
    const [{ data: lists }, { data: problems }] = await Promise.all([
      api.get<ListPublic[]>(`/classrooms/${disciplineId}/lists`),
      api.get<ProblemPublic[]>(`/classrooms/${disciplineId}/problems`),
    ]);
    return lists.map((l) => mapList(l, problems));
  },

  // Busca uma lista por ID (precisa buscar os problemas do classroom)
  byId: async (listId: string): Promise<ExerciseList> => {
    const { data: list } = await api.get<ListPublic>(`/lists/${listId}`);
    const { data: problems } = await api.get<ProblemPublic[]>(
      `/classrooms/${list.classroom_id}/problems`,
    );
    return mapList(list, problems);
  },

  // Problemas disponíveis para adicionar a uma lista (apenas do banco do professor)
  problemsForDiscipline: async (_disciplineId: string): Promise<Problem[]> => {
    const { data } = await api.get<ProblemPublic[]>(`/teachers/me/bank-problems`).catch(() => ({ data: [] as ProblemPublic[] }));
    return data.map((p) => ({ ...mapProblem(p), disciplineId: "bank" }));
  },

  // Cria nova lista e atribui problemas a ela
  create: async (input: CreateListInput): Promise<ExerciseList> => {
    // 1. Cria a lista no backend
    const { data: newList } = await api.post<ListPublic>(
      `/classrooms/${input.disciplineId}/lists`,
      {
        name: input.name,
        description: input.description || null,
        deadline: input.publish && input.deadline ? new Date(input.deadline).toISOString() : null,
      },
    );

    const listId = newList.id;

    // 2. Copia problemas do banco para a turma (com list_id já atribuído)
    if (input.bankProblemIds.length > 0) {
      const bankDetails = await Promise.all(
        input.bankProblemIds.map((id) => api.get<ProblemPublic>(`/teachers/me/bank-problems/${id}`)),
      );
      await Promise.all(
        bankDetails.map(({ data: p }) => {
          const form = new FormData();
          form.append("title", p.title);
          form.append("description", p.description ?? "");
          if (p.category) form.append("category", p.category);
          form.append("list_id", listId);
          return api.post(`/classrooms/${input.disciplineId}/problems`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }),
      );
    }

    // 3. Vincula problemas já existentes na turma à nova lista
    if (input.problemIds.length > 0) {
      await Promise.all(
        input.problemIds.map((id) =>
          api.put(`/problems/${id}`, { list_id: listId }),
        ),
      );
    }

    // 4. Retorna lista populada
    const { data: problems } = await api.get<ProblemPublic[]>(
      `/classrooms/${input.disciplineId}/problems`,
    );
    return mapList(newList, problems);
  },

  update: async (listId: string, input: UpdateListInput): Promise<ExerciseList> => {
    const { data: updated } = await api.put<ListPublic>(`/lists/${listId}`, {
      name: input.name,
      description: input.description ?? null,
      deadline: input.deadline ? new Date(input.deadline).toISOString() : null,
    });
    const { data: problems } = await api.get<ProblemPublic[]>(
      `/classrooms/${updated.classroom_id}/problems`,
    );
    return mapList(updated, problems);
  },

  delete: async (listId: string): Promise<void> => {
    await api.delete(`/lists/${listId}`);
  },

  // Vincula problema já existente no classroom à lista
  assignProblem: async (problemId: string, listId: string): Promise<void> => {
    await api.put(`/problems/${problemId}`, { list_id: listId });
  },

  // Remove problema da lista (list_id = null), mas não exclui o problema
  unassignProblem: async (problemId: string): Promise<void> => {
    await api.put(`/problems/${problemId}`, { list_id: null });
  },

  // Copia problema do banco para o classroom já vinculado à lista
  addBankProblemToList: async (
    disciplineId: string,
    listId: string,
    bankProblemId: string,
  ): Promise<void> => {
    const { data: p } = await api.get<ProblemPublic>(`/teachers/me/bank-problems/${bankProblemId}`);
    const form = new FormData();
    form.append("title", p.title);
    form.append("description", p.description ?? "");
    if (p.category) form.append("category", p.category);
    form.append("list_id", listId);
    await api.post(`/classrooms/${disciplineId}/problems`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateDeadline: async (listId: string, deadline: string): Promise<void> => {
    await api.put(`/lists/${listId}`, { deadline: new Date(deadline).toISOString() });
  },

  matrix: async (listId: string) => {
    const { data: list } = await api.get<ListPublic>(`/lists/${listId}`);
    const [{ data: allProblems }, { data: students }] = await Promise.all([
      api.get<ProblemPublic[]>(`/classrooms/${list.classroom_id}/problems`),
      api.get<{ id: string; name: string; email: string }[]>(
        `/classrooms/${list.classroom_id}/students`,
      ),
    ]);

    const listData = mapList(list, allProblems);
    const visibleProblems = listData.problems;
    const activeStudents = students.map((s) => ({
      id: s.id,
      name: s.name ?? null,
      email: s.email,
      status: "active" as const,
      createdAt: nowIso(),
    }));

    type SessionPublic = {
      id: string;
      student_id: string;
      problem_id: string;
      status: "open" | "closed";
      started_at: string | null;
      closed_at: string | null;
      submitted_code?: string | null;
    };

    const sessionResults = await Promise.all(
      visibleProblems.map((p) =>
        api
          .get<SessionPublic[]>(`/classrooms/${list.classroom_id}/problems/${p.id}/sessions`)
          .then(({ data }) => ({ problemId: p.id, sessions: data }))
          .catch(() => ({ problemId: p.id, sessions: [] as SessionPublic[] })),
      ),
    );

    const sessionMap = new Map<string, SessionPublic>();
    for (const { problemId, sessions } of sessionResults) {
      const seenStudents = new Set<string>();
      for (const s of sessions) {
        if (!seenStudents.has(s.student_id)) {
          sessionMap.set(`${s.student_id}:${problemId}`, s);
          seenStudents.add(s.student_id);
        }
      }
    }

    const cells: SubmissionCell[] = activeStudents.flatMap((stu) =>
      visibleProblems.map((p) => {
        const s = sessionMap.get(`${stu.id}:${p.id}`);
        const status = !s ? "not_started" : s.submitted_code ? "delivered" : "attempted";
        return {
          studentId: stu.id,
          problemId: p.id,
          status: status as SubmissionCell["status"],
          messageCount: 0,
          timeSpentMinutes: 0,
        };
      }),
    );

    return { list: listData, students: activeStudents, cells };
  },
};
