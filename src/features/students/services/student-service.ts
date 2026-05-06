import { mockResponse, mockId, nowIso, delay } from "@/lib/mocks/utils";
import { studentsByDiscipline } from "@/lib/mocks/fixtures";
import type { Student } from "@/types/entities";

export interface InviteStudentsInput {
  disciplineId: string;
  emails: string[];
}

export interface InviteStudentsResult {
  invited: Student[];
  duplicatesIgnored: string[];
}

const store: Record<string, Student[]> = { ...studentsByDiscipline };

export const studentService = {
  byDiscipline: (disciplineId: string) =>
    mockResponse<Student[]>(store[disciplineId] ?? [], 250),

  byId: async (disciplineId: string, studentId: string): Promise<Student> => {
    const list = store[disciplineId] ?? [];
    const found = list.find((s) => s.id === studentId);
    if (!found) throw new Error("Aluno não encontrado nesta disciplina");
    await delay(150);
    return found;
  },

  invite: async (input: InviteStudentsInput): Promise<InviteStudentsResult> => {
    await delay(450);
    const existing = store[input.disciplineId] ?? [];
    const existingEmails = new Set(existing.map((s) => s.email.toLowerCase()));
    const duplicates: string[] = [];
    const invited: Student[] = [];
    input.emails.forEach((rawEmail) => {
      const email = rawEmail.trim().toLowerCase();
      if (!email) return;
      if (existingEmails.has(email)) {
        duplicates.push(email);
        return;
      }
      const newStudent: Student = {
        id: mockId("stu"),
        name: null,
        email,
        status: "pending",
        createdAt: nowIso(),
      };
      invited.push(newStudent);
      existingEmails.add(email);
    });
    store[input.disciplineId] = [...invited, ...existing];
    return { invited, duplicatesIgnored: duplicates };
  },
};
