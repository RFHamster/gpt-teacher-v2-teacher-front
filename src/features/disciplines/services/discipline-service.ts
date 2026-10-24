import { api } from "@/lib/api/client";
import type { Discipline } from "@/types/entities";

export interface CreateDisciplineInput {
  name: string;
  description?: string;
  semester: string;
}

export interface UpdateDisciplineInput {
  name: string;
}

interface ClassroomPublic {
  id: string;
  name: string;
  teacher_id: string;
}

interface StudentPublic {
  id: string;
}

interface ListPublic {
  id: string;
  deadline: string | null;
}

function mapClassroom(c: ClassroomPublic, studentCount = 0, activeListCount = 0, closedListCount = 0): Discipline {
  return {
    id: c.id,
    name: c.name,
    description: undefined,
    semester: "",
    isArchived: false,
    createdAt: new Date().toISOString(),
    studentCount,
    activeListCount,
    closedListCount,
  };
}

async function fetchStudentCount(classroomId: string): Promise<number> {
  try {
    const { data } = await api.get<StudentPublic[]>(`/classrooms/${classroomId}/students`);
    return data.length;
  } catch {
    return 0;
  }
}

async function fetchListCounts(classroomId: string): Promise<{ active: number; closed: number }> {
  try {
    const { data } = await api.get<ListPublic[]>(`/classrooms/${classroomId}/lists`);
    const now = new Date();
    const active = data.filter((l) => !l.deadline || new Date(l.deadline) >= now).length;
    const closed = data.filter((l) => l.deadline && new Date(l.deadline) < now).length;
    return { active, closed };
  } catch {
    return { active: 0, closed: 0 };
  }
}

export const disciplineService = {
  list: async (): Promise<Discipline[]> => {
    const { data } = await api.get<ClassroomPublic[]>("/classrooms");
    const [studentCounts, listCounts] = await Promise.all([
      Promise.all(data.map((c) => fetchStudentCount(c.id))),
      Promise.all(data.map((c) => fetchListCounts(c.id))),
    ]);
    return data.map((c, i) => mapClassroom(c, studentCounts[i] ?? 0, listCounts[i]?.active ?? 0, listCounts[i]?.closed ?? 0));
  },

  listActive: async (): Promise<Discipline[]> => {
    const { data } = await api.get<ClassroomPublic[]>("/classrooms");
    const [studentCounts, listCounts] = await Promise.all([
      Promise.all(data.map((c) => fetchStudentCount(c.id))),
      Promise.all(data.map((c) => fetchListCounts(c.id))),
    ]);
    return data.map((c, i) => mapClassroom(c, studentCounts[i] ?? 0, listCounts[i]?.active ?? 0, listCounts[i]?.closed ?? 0));
  },

  byId: async (id: string): Promise<Discipline> => {
    const [{ data }, studentCount, listCount] = await Promise.all([
      api.get<ClassroomPublic>(`/classrooms/${id}`),
      fetchStudentCount(id),
      fetchListCounts(id),
    ]);
    return mapClassroom(data, studentCount, listCount.active, listCount.closed);
  },

  create: async (input: CreateDisciplineInput): Promise<Discipline> => {
    const { data: me } = await api.get<{ id: string }>("/teachers/me");
    const { data } = await api.post<ClassroomPublic>("/classrooms", {
      name: input.name,
      teacher_id: me.id,
    });
    return mapClassroom(data);
  },

  update: async (id: string, input: UpdateDisciplineInput): Promise<Discipline> => {
    const { data } = await api.put<ClassroomPublic>(`/classrooms/${id}`, {
      name: input.name,
    });
    return mapClassroom(data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/classrooms/${id}`);
  },

  archive: async (_id: string): Promise<void> => {
    // Backend doesn't support archiving; treated as client-side only
  },
};
