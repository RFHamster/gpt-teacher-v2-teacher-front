export { disciplineService } from "./services/discipline-service";
export type { CreateDisciplineInput, UpdateDisciplineInput } from "./services/discipline-service";
export {
  useDisciplines,
  useActiveDisciplines,
  useDiscipline,
  useCreateDiscipline,
  useUpdateDiscipline,
  useDeleteDiscipline,
} from "./hooks/use-disciplines";
export { DisciplineCard } from "./components/discipline-card";
export { CreateDisciplineDialog } from "./components/create-discipline-dialog";
