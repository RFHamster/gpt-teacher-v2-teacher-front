import type {
  Discipline,
  DisciplineAlert,
  ExerciseList,
  Problem,
  Professor,
  Student,
  SubmissionCell,
} from "@/types/entities";
import { daysFromNow, nowIso } from "./utils";

export const currentProfessor: Professor = {
  id: "prof_1",
  name: "Profa. Marina Costa",
  email: "marina.costa@univ.br",
  avatarUrl: undefined,
};

export const disciplines: Discipline[] = [
  {
    id: "disc_1",
    name: "Algoritmos e Estruturas de Dados I",
    description: "Introdução a algoritmos, complexidade e estruturas básicas.",
    semester: "2025.1",
    isArchived: false,
    createdAt: daysFromNow(-60),
    studentCount: 47,
    activeListCount: 2,
    closedListCount: 3,
  },
  {
    id: "disc_2",
    name: "Programação Orientada a Objetos",
    description: "Fundamentos de POO em Java.",
    semester: "2025.1",
    isArchived: false,
    createdAt: daysFromNow(-58),
    studentCount: 38,
    activeListCount: 1,
    closedListCount: 4,
  },
  {
    id: "disc_3",
    name: "Cálculo Numérico",
    description: "",
    semester: "2025.1",
    isArchived: false,
    createdAt: daysFromNow(-50),
    studentCount: 29,
    activeListCount: 0,
    closedListCount: 2,
  },
  {
    id: "disc_4",
    name: "Algoritmos II (arquivada)",
    description: "Continuação do conteúdo de Algoritmos I.",
    semester: "2024.2",
    isArchived: true,
    createdAt: daysFromNow(-220),
    studentCount: 41,
    activeListCount: 0,
    closedListCount: 6,
  },
];

export const studentsByDiscipline: Record<string, Student[]> = {
  disc_1: [
    { id: "stu_1", name: "Ana Beatriz Souza", email: "ana.souza@univ.br", status: "active", createdAt: daysFromNow(-55) },
    { id: "stu_2", name: "Bruno Oliveira", email: "bruno.oliveira@univ.br", status: "active", createdAt: daysFromNow(-55) },
    { id: "stu_3", name: "Carla Mendes", email: "carla.mendes@univ.br", status: "active", createdAt: daysFromNow(-55) },
    { id: "stu_4", name: "Diego Faria", email: "diego.faria@univ.br", status: "active", createdAt: daysFromNow(-50) },
    { id: "stu_5", name: "Eduarda Lima", email: "eduarda.lima@univ.br", status: "active", createdAt: daysFromNow(-50) },
    { id: "stu_6", name: null, email: "fernando.k@univ.br", status: "pending", createdAt: daysFromNow(-3) },
    { id: "stu_7", name: "Gustavo Pereira", email: "gustavo.pereira@univ.br", status: "active", createdAt: daysFromNow(-50) },
    { id: "stu_8", name: "Helena Ribeiro", email: "helena.ribeiro@univ.br", status: "active", createdAt: daysFromNow(-50) },
    { id: "stu_9", name: null, email: "isadora.m@univ.br", status: "pending", createdAt: daysFromNow(-2) },
    { id: "stu_10", name: "João Vitor Costa", email: "joao.costa@univ.br", status: "active", createdAt: daysFromNow(-50) },
  ],
  disc_2: [
    { id: "stu_11", name: "Lara Tavares", email: "lara.tavares@univ.br", status: "active", createdAt: daysFromNow(-50) },
    { id: "stu_12", name: "Marcos Alves", email: "marcos.alves@univ.br", status: "active", createdAt: daysFromNow(-50) },
    { id: "stu_13", name: "Natália Silva", email: "natalia.silva@univ.br", status: "active", createdAt: daysFromNow(-50) },
  ],
  disc_3: [
    { id: "stu_14", name: "Otávio Reis", email: "otavio.reis@univ.br", status: "active", createdAt: daysFromNow(-45) },
  ],
};

export const problemsByDiscipline: Record<string, Problem[]> = {
  disc_1: [
    { id: "prob_1", disciplineId: "disc_1", title: "Soma de pares", statement: "Dado um array de inteiros, retorne a soma dos elementos em índices pares.", difficulty: "easy", createdAt: daysFromNow(-40) },
    { id: "prob_2", disciplineId: "disc_1", title: "Inversão de string", statement: "Implemente uma função que inverta uma string sem usar reverse().", difficulty: "easy", createdAt: daysFromNow(-40) },
    { id: "prob_3", disciplineId: "disc_1", title: "Busca binária", statement: "Implemente busca binária em um array ordenado.", difficulty: "medium", createdAt: daysFromNow(-35) },
    { id: "prob_4", disciplineId: "disc_1", title: "Anagramas", statement: "Verifique se duas strings são anagramas.", difficulty: "medium", createdAt: daysFromNow(-30) },
    { id: "prob_5", disciplineId: "disc_1", title: "Lista encadeada — reverse", statement: "Reverta uma lista encadeada simples in-place.", difficulty: "hard", createdAt: daysFromNow(-25) },
  ],
  disc_2: [
    { id: "prob_6", disciplineId: "disc_2", title: "Classe Conta Bancária", statement: "Implemente uma classe ContaBancaria com depósito, saque e saldo.", difficulty: "easy", createdAt: daysFromNow(-30) },
  ],
  disc_3: [],
};

export const exerciseLists: ExerciseList[] = [
  {
    id: "list_1",
    disciplineId: "disc_1",
    name: "Lista 3 — Recursão e Listas",
    description: "Exercícios introdutórios de recursão.",
    deadline: daysFromNow(2),
    status: "active",
    problemCount: 4,
    createdAt: daysFromNow(-7),
    problems: problemsByDiscipline.disc_1!.slice(0, 4),
  },
  {
    id: "list_2",
    disciplineId: "disc_1",
    name: "Lista 4 — Estruturas",
    description: "Pilhas, filas e listas encadeadas.",
    deadline: daysFromNow(10),
    status: "active",
    problemCount: 3,
    createdAt: daysFromNow(-3),
    problems: problemsByDiscipline.disc_1!.slice(2, 5),
  },
  {
    id: "list_3",
    disciplineId: "disc_1",
    name: "Lista 2 — Arrays e Strings",
    description: "",
    deadline: daysFromNow(-5),
    status: "closed",
    problemCount: 5,
    deliveryRate: 0.78,
    hasConsolidatedAnalysis: false,
    createdAt: daysFromNow(-25),
    problems: problemsByDiscipline.disc_1!,
  },
  {
    id: "list_4",
    disciplineId: "disc_1",
    name: "Lista 1 — Lógica básica",
    description: "",
    deadline: daysFromNow(-30),
    status: "closed",
    problemCount: 3,
    deliveryRate: 0.92,
    hasConsolidatedAnalysis: true,
    createdAt: daysFromNow(-50),
    problems: problemsByDiscipline.disc_1!.slice(0, 3),
  },
  {
    id: "list_5",
    disciplineId: "disc_2",
    name: "Lista 5 — Encapsulamento",
    description: "",
    deadline: daysFromNow(4),
    status: "active",
    problemCount: 1,
    createdAt: daysFromNow(-5),
    problems: problemsByDiscipline.disc_2!,
  },
];

/** Matriz de submissões mock para list_1 */
export const submissionsByList: Record<string, SubmissionCell[]> = {
  list_1: (() => {
    const list = exerciseLists.find((l) => l.id === "list_1")!;
    const students = studentsByDiscipline.disc_1!.filter((s) => s.status === "active");
    const cells: SubmissionCell[] = [];
    students.forEach((stu, sIdx) => {
      list.problems.forEach((p, pIdx) => {
        const seed = (sIdx + pIdx) % 5;
        const status: SubmissionCell["status"] =
          seed === 0 ? "not_started" : seed === 1 ? "attempted" : "delivered";
        cells.push({
          studentId: stu.id,
          problemId: p.id,
          status,
          messageCount: status === "not_started" ? 0 : 5 + ((sIdx * 3 + pIdx) % 40),
          timeSpentMinutes: status === "not_started" ? 0 : 10 + ((sIdx + pIdx * 2) % 60),
          lastSessionAt: status === "not_started" ? undefined : daysFromNow(-1),
        });
      });
    });
    return cells;
  })(),
};

export const globalAlerts: DisciplineAlert[] = [
  {
    id: "alert_1",
    type: "no_activity",
    severity: "critical",
    title: "5 alunos não abriram nenhum exercício da Lista 3",
    description: "Algoritmos I — prazo em 2 dias",
    link: "/disciplines/disc_1/lists/list_1",
    disciplineId: "disc_1",
    listId: "list_1",
    createdAt: nowIso(),
  },
  {
    id: "alert_2",
    type: "high_message_volume",
    severity: "warning",
    title: "João Vitor Costa tem 47 mensagens no Exercício 2",
    description: "Algoritmos I — Lista 3 — pode estar travado",
    link: "/disciplines/disc_1/lists/list_1/problems/prob_2/students/stu_10",
    disciplineId: "disc_1",
    listId: "list_1",
    studentId: "stu_10",
    problemId: "prob_2",
    createdAt: nowIso(),
  },
  {
    id: "alert_3",
    type: "list_unanalyzed",
    severity: "info",
    title: "Lista 2 encerrou há 5 dias e ainda não foi analisada",
    description: "Algoritmos I — gere a análise consolidada por IA",
    link: "/disciplines/disc_1/lists/list_3",
    disciplineId: "disc_1",
    listId: "list_3",
    createdAt: nowIso(),
  },
  {
    id: "alert_4",
    type: "deadline_close",
    severity: "warning",
    title: "Lista 5 — POO encerra em 4 dias",
    description: "Programação Orientada a Objetos — 28 de 38 alunos ainda não entregaram",
    link: "/disciplines/disc_2/lists/list_5",
    disciplineId: "disc_2",
    listId: "list_5",
    createdAt: nowIso(),
  },
];
