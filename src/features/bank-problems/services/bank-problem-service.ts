import { api } from "@/lib/api/client";

export interface BankProblem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_path: string | null;
}

export interface CreateBankProblemInput {
  title: string;
  description?: string;
  category?: string;
  file?: File;
}

export interface UpdateBankProblemInput {
  title?: string;
  description?: string;
  category?: string;
}

interface ProblemPublic {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_path: string | null;
}

function mapProblem(p: ProblemPublic): BankProblem {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? null,
    category: p.category ?? null,
    file_path: p.file_path ?? null,
  };
}

export const bankProblemService = {
  list: async (): Promise<BankProblem[]> => {
    const { data } = await api.get<ProblemPublic[]>("/teachers/me/bank-problems");
    return data.map(mapProblem);
  },

  byId: async (id: string): Promise<BankProblem> => {
    const { data } = await api.get<ProblemPublic>(`/teachers/me/bank-problems/${id}`);
    return mapProblem(data);
  },

  create: async (input: CreateBankProblemInput): Promise<BankProblem> => {
    const form = new FormData();
    form.append("title", input.title);
    if (input.description) form.append("description", input.description);
    if (input.category) form.append("category", input.category);
    if (input.file) form.append("file", input.file);

    const { data } = await api.post<ProblemPublic>("/teachers/me/bank-problems", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return mapProblem(data);
  },

  update: async (id: string, input: UpdateBankProblemInput): Promise<BankProblem> => {
    const { data } = await api.put<ProblemPublic>(`/teachers/me/bank-problems/${id}`, input);
    return mapProblem(data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/teachers/me/bank-problems/${id}`);
  },
};
