import { mockResponse, mockId, nowIso } from "@/lib/mocks/utils";
import { disciplines } from "@/lib/mocks/fixtures";
import type { Discipline, Semester } from "@/types/entities";

export interface CreateDisciplineInput {
  name: string;
  description?: string;
  semester: Semester;
}

let store: Discipline[] = [...disciplines];

export const disciplineService = {
  list: () => mockResponse<Discipline[]>(store, 250),

  listActive: () =>
    mockResponse<Discipline[]>(store.filter((d) => !d.isArchived), 250),

  byId: (id: string) => {
    const found = store.find((d) => d.id === id);
    if (!found) return Promise.reject(new Error("Disciplina não encontrada"));
    return mockResponse(found, 200);
  },

  create: async (input: CreateDisciplineInput): Promise<Discipline> => {
    const created: Discipline = {
      id: mockId("disc"),
      name: input.name,
      description: input.description,
      semester: input.semester,
      isArchived: false,
      createdAt: nowIso(),
      studentCount: 0,
      activeListCount: 0,
      closedListCount: 0,
    };
    store = [created, ...store];
    return mockResponse(created, 350);
  },

  archive: async (id: string): Promise<void> => {
    store = store.map((d) => (d.id === id ? { ...d, isArchived: true } : d));
    await mockResponse(undefined, 200);
  },
};
