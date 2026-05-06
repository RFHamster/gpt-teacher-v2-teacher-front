import { CheckCircle2, CircleDashed, Clock4 } from "lucide-react";
import { Badge } from "./badge";
import type { SubmissionStatus, ExerciseListStatus } from "@/types/entities";

const submissionMap: Record<
  SubmissionStatus,
  { label: string; variant: "success" | "warning" | "secondary"; icon: React.ReactNode }
> = {
  delivered: { label: "Entregou", variant: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
  attempted: { label: "Tentou", variant: "warning", icon: <Clock4 className="h-3 w-3" /> },
  not_started: { label: "Não abriu", variant: "secondary", icon: <CircleDashed className="h-3 w-3" /> },
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const cfg = submissionMap[status];
  return (
    <Badge variant={cfg.variant}>
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

const listStatusMap: Record<
  ExerciseListStatus,
  { label: string; variant: "outline" | "info" | "secondary" }
> = {
  draft: { label: "Rascunho", variant: "outline" },
  active: { label: "Ativa", variant: "info" },
  closed: { label: "Encerrada", variant: "secondary" },
};

export function ListStatusBadge({ status }: { status: ExerciseListStatus }) {
  const cfg = listStatusMap[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
