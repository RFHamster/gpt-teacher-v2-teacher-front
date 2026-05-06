import { delay, mockId } from "@/lib/mocks/utils";
import {
  exerciseLists,
  problemsByDiscipline,
  studentsByDiscipline,
  submissionsByList,
} from "@/lib/mocks/fixtures";
import type {
  AiAnalysis,
  ExerciseList,
  Problem,
  SessionMessage,
  Student,
  SubmissionCell,
  SubmissionDetail,
} from "@/types/entities";

// In-memory para anotações
const teacherNotesByCell = new Map<string, string>();
const studentNotes = new Map<string, string>();
const aiAnalysisByCell = new Map<string, AiAnalysis>();
const aiHintsByCell = new Map<string, AiAnalysis>();

function noteKey(studentId: string, problemId: string) {
  return `${studentId}:${problemId}`;
}

function buildSampleCode(problem: Problem, status: SubmissionCell["status"]): string {
  if (status === "not_started") return "";
  if (problem.title.includes("Soma")) {
    return `function somaPares(arr) {
  let total = 0;
  // tentando somar elementos em índices pares
  for (let i = 0; i <= arr.length; i++) {
    if (i % 2 === 0) {
      total += arr[i];  // ❌ off-by-one quando i = arr.length
    }
  }
  return total;
}`;
  }
  if (problem.title.includes("Inversão")) {
    return `function inverter(s) {
  let result = "";
  for (let i = s.length; i >= 0; i--) {
    result += s[i];
  }
  return result;
}`;
  }
  if (problem.title.includes("Busca")) {
    return `function buscaBinaria(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`;
  }
  return `// solução parcial do problema "${problem.title}"
function solve(input) {
  // TODO: implementar
  return null;
}`;
}

function buildMessages(problem: Problem, status: SubmissionCell["status"]): SessionMessage[] {
  if (status === "not_started") return [];
  return [
    {
      id: mockId("msg"),
      role: "user",
      content: `Estou tentando resolver o problema "${problem.title}", mas meu código retorna NaN. O que pode estar errado?`,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: mockId("msg"),
      role: "assistant",
      content:
        "Olá! Pelo seu código, parece que você está acessando uma posição fora dos limites do array no laço `for`. Veja se o `i` pode chegar a `arr.length` — nesse caso `arr[i]` é `undefined`, e somar undefined gera NaN. Quer revisar a condição de parada?",
      createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    },
    {
      id: mockId("msg"),
      role: "user",
      content: "Ah, é mesmo. Devo usar `<` em vez de `<=`?",
      createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    },
    {
      id: mockId("msg"),
      role: "code_review",
      content:
        "Análise do código:\n• Off-by-one em `for (let i = 0; i <= arr.length; i++)`\n• Sugestão: trocar para `i < arr.length`.",
      createdAt: new Date(Date.now() - 49 * 60 * 1000).toISOString(),
    },
    {
      id: mockId("msg"),
      role: "assistant",
      content:
        "Exato. Use `<` aqui. Em geral, em JavaScript, índices de array vão de `0` até `length - 1`. Tente ajustar e rode novamente. Se quiser, posso te mostrar dois casos de teste para validar.",
      createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    },
  ];
}

export const analysisService = {
  /** Detalhe da célula (aluno × exercício) */
  submissionDetail: async (
    listId: string,
    problemId: string,
    studentId: string,
  ): Promise<{
    detail: SubmissionDetail;
    list: ExerciseList;
    problem: Problem;
    student: Student;
    /** Outros alunos da mesma lista (para navegação ◀ ▶) */
    siblingStudents: Student[];
    /** Outros exercícios da mesma lista (para o toggle) */
    siblingProblems: Problem[];
  }> => {
    await delay(250);
    const list = exerciseLists.find((l) => l.id === listId);
    if (!list) throw new Error("Lista não encontrada");
    const problem = list.problems.find((p) => p.id === problemId);
    if (!problem) throw new Error("Exercício não encontrado");
    const student = (studentsByDiscipline[list.disciplineId] ?? []).find(
      (s) => s.id === studentId,
    );
    if (!student) throw new Error("Aluno não encontrado");

    const cells = submissionsByList[listId] ?? [];
    const cell =
      cells.find((c) => c.studentId === studentId && c.problemId === problemId) ?? {
        studentId,
        problemId,
        status: "not_started" as const,
        messageCount: 0,
        timeSpentMinutes: 0,
      };

    const detail: SubmissionDetail = {
      ...cell,
      code: buildSampleCode(problem, cell.status),
      codeLanguage: "javascript",
      messages: buildMessages(problem, cell.status),
      teacherNote: teacherNotesByCell.get(noteKey(studentId, problemId)),
    };

    const allStudents = (studentsByDiscipline[list.disciplineId] ?? []).filter(
      (s) => s.status === "active",
    );

    return {
      detail,
      list,
      problem,
      student,
      siblingStudents: allStudents,
      siblingProblems: list.problems,
    };
  },

  generateCorrection: async (
    studentId: string,
    problemId: string,
  ): Promise<AiAnalysis> => {
    const key = noteKey(studentId, problemId);
    aiAnalysisByCell.set(key, { state: "generating" });
    await delay(1800);
    const ai: AiAnalysis = {
      state: "ready",
      generatedAt: new Date().toISOString(),
      content: `**Diagnóstico:** o código contém um *off-by-one* no loop principal — a condição \`i <= arr.length\` faz o índice estourar.\n\n**Correção sugerida:**\n\n\`\`\`js\nfor (let i = 0; i < arr.length; i++) {\n  if (i % 2 === 0) total += arr[i];\n}\n\`\`\`\n\n**Casos de teste recomendados:**\n- \`somaPares([])\` → \`0\`\n- \`somaPares([1])\` → \`1\`\n- \`somaPares([1, 2, 3, 4, 5])\` → \`9\`\n\n**Conceito a reforçar:** índices de array em JS começam em 0 e vão até \`length - 1\`.`,
    };
    aiAnalysisByCell.set(key, ai);
    return ai;
  },

  generateHints: async (
    studentId: string,
    problemId: string,
  ): Promise<AiAnalysis> => {
    const key = noteKey(studentId, problemId);
    aiHintsByCell.set(key, { state: "generating" });
    await delay(1500);
    const ai: AiAnalysis = {
      state: "ready",
      generatedAt: new Date().toISOString(),
      content: `**Como orientar este aluno:**\n\n1. **Não dê a resposta direto.** Pergunte o que ele espera receber quando \`i === arr.length\`.\n2. **Sugira testar com input pequeno:** rodar com \`[1, 2]\` e imprimir cada iteração.\n3. **Reforce:** após corrigir, peça pra ele explicar verbalmente *por que* a condição \`<\` é a correta — isso fixa o conceito.\n\n**Conexão com aulas anteriores:** revise rapidamente "convenção de meio aberto" \`[0, n)\` que aparece em iteração e em busca binária.`,
    };
    aiHintsByCell.set(key, ai);
    return ai;
  },

  getCorrectionState: (studentId: string, problemId: string): AiAnalysis =>
    aiAnalysisByCell.get(noteKey(studentId, problemId)) ?? { state: "not_generated" },

  getHintsState: (studentId: string, problemId: string): AiAnalysis =>
    aiHintsByCell.get(noteKey(studentId, problemId)) ?? { state: "not_generated" },

  saveCellNote: async (studentId: string, problemId: string, note: string) => {
    teacherNotesByCell.set(noteKey(studentId, problemId), note);
    await delay(150);
  },

  saveStudentNote: async (studentId: string, note: string) => {
    studentNotes.set(studentId, note);
    await delay(150);
  },

  getStudentNote: (studentId: string): string => studentNotes.get(studentId) ?? "",

  /** Resumo do aluno na lista (pós-prazo) */
  studentInListSummary: async (listId: string, studentId: string) => {
    await delay(250);
    const list = exerciseLists.find((l) => l.id === listId);
    if (!list) throw new Error("Lista não encontrada");
    const student = (studentsByDiscipline[list.disciplineId] ?? []).find(
      (s) => s.id === studentId,
    );
    if (!student) throw new Error("Aluno não encontrado");
    const cells = (submissionsByList[listId] ?? []).filter((c) => c.studentId === studentId);
    return {
      list,
      student,
      cells,
      problems: list.problems,
      delivered: cells.filter((c) => c.status === "delivered").length,
      attempted: cells.filter((c) => c.status === "attempted").length,
      notStarted:
        list.problems.length -
        cells.filter((c) => c.status !== "not_started").length,
      totalTime: cells.reduce((acc, c) => acc + c.timeSpentMinutes, 0),
      totalMessages: cells.reduce((acc, c) => acc + c.messageCount, 0),
      generalNote: studentNotes.get(studentId) ?? "",
    };
  },

  /** Histórico do aluno em outras listas da mesma disciplina */
  studentHistory: async (disciplineId: string, studentId: string) => {
    await delay(200);
    const lists = exerciseLists.filter((l) => l.disciplineId === disciplineId);
    return lists.map((l) => {
      const cells = (submissionsByList[l.id] ?? []).filter((c) => c.studentId === studentId);
      const delivered = cells.filter((c) => c.status === "delivered").length;
      const total = (problemsByDiscipline[disciplineId] ?? []).length || l.problems.length;
      return {
        listId: l.id,
        listName: l.name,
        status: l.status,
        deliveryRate: total > 0 ? delivered / total : 0,
      };
    });
  },
};
