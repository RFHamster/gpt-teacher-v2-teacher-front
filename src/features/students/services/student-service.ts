import { api } from "@/lib/api/client";
import type { Student } from "@/types/entities";

export interface InviteStudentsInput {
  disciplineId: string;
  emails: string[];
}

export interface InviteStudentsResult {
  invited: Student[];
  duplicatesIgnored: string[];
  tempPassword: string;
}

interface StudentPublic {
  id: string;
  email: string;
  name: string;
  registration_number?: string | null;
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function mapStudent(s: StudentPublic): Student {
  return {
    id: s.id,
    name: s.name ?? null,
    email: s.email,
    status: "active",
    createdAt: new Date().toISOString(),
  };
}

export const studentService = {
  byDiscipline: async (disciplineId: string): Promise<Student[]> => {
    const { data } = await api.get<StudentPublic[]>(`/classrooms/${disciplineId}/students`);
    return data.map(mapStudent);
  },

  byId: async (disciplineId: string, studentId: string): Promise<Student> => {
    const { data } = await api.get<StudentPublic[]>(`/classrooms/${disciplineId}/students`);
    const found = data.find((s) => s.id === studentId);
    if (!found) throw new Error("Aluno não encontrado nesta disciplina");
    return mapStudent(found);
  },

  invite: async (input: InviteStudentsInput): Promise<InviteStudentsResult> => {
    const invited: Student[] = [];
    const duplicatesIgnored: string[] = [];
    const tempPassword = generateTempPassword();

    for (const email of input.emails) {
      try {
        // Registra o aluno com senha temporária
        const { data: newStudent } = await api.post<StudentPublic>("/auth/register/student", {
          email,
          name: email.split("@")[0],
          password: tempPassword,
        });

        // Adiciona à turma
        await api.post(`/classrooms/${input.disciplineId}/students`, {
          student_id: newStudent.id,
        });

        invited.push(mapStudent(newStudent));
      } catch {
        // Email já cadastrado ou já está na turma
        duplicatesIgnored.push(email);
      }
    }

    return { invited, duplicatesIgnored, tempPassword };
  },
};
