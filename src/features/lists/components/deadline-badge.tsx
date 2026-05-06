import { Clock4 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, relativeFromNow } from "@/utils/format";

export function DeadlineBadge({ deadline }: { deadline: string | null }) {
  if (!deadline) {
    return <Badge variant="outline">Sem prazo (rascunho)</Badge>;
  }
  const ms = new Date(deadline).getTime() - Date.now();
  const days = ms / (24 * 60 * 60 * 1000);
  const variant: "danger" | "warning" | "info" | "secondary" =
    ms < 0 ? "secondary" : days < 1 ? "danger" : days < 3 ? "warning" : "info";
  return (
    <Badge variant={variant} title={formatDateTime(deadline)}>
      <Clock4 className="h-3 w-3" />
      {ms < 0 ? `Encerrou ${relativeFromNow(deadline)}` : `${relativeFromNow(deadline)}`}
    </Badge>
  );
}
