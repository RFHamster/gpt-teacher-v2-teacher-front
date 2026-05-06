export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  disciplines: "/disciplines",
  discipline: (id: string) => `/disciplines/${id}` as const,
  disciplineStudents: (id: string) => `/disciplines/${id}/students` as const,
  disciplineLists: (id: string) => `/disciplines/${id}/lists` as const,
  disciplineSettings: (id: string) => `/disciplines/${id}/settings` as const,
  list: (disciplineId: string, listId: string) =>
    `/disciplines/${disciplineId}/lists/${listId}` as const,
  studentExercise: (
    disciplineId: string,
    listId: string,
    problemId: string,
    studentId: string,
  ) =>
    `/disciplines/${disciplineId}/lists/${listId}/problems/${problemId}/students/${studentId}` as const,
  studentInList: (disciplineId: string, listId: string, studentId: string) =>
    `/disciplines/${disciplineId}/lists/${listId}/students/${studentId}` as const,
  studentProfile: (disciplineId: string, studentId: string) =>
    `/disciplines/${disciplineId}/students/${studentId}` as const,
  settings: "/settings",
} as const;
