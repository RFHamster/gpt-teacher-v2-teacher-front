import { CheckCircle2, AlertCircle, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ParsedEmails } from "../utils/parse-emails";

export function EmailChipPreview({ parsed }: { parsed: ParsedEmails }) {
  const total = parsed.valid.length + parsed.invalid.length + parsed.duplicates.length;
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          {parsed.valid.length} válidos
        </span>
        {parsed.invalid.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 text-red-600" />
            {parsed.invalid.length} inválidos
          </span>
        )}
        {parsed.duplicates.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            {parsed.duplicates.length} duplicados (ignorados)
          </span>
        )}
      </div>

      {parsed.valid.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {parsed.valid.map((email) => (
            <Badge key={email} variant="success">
              {email}
            </Badge>
          ))}
        </div>
      )}

      {parsed.invalid.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {parsed.invalid.map((email) => (
            <Badge key={email} variant="danger">
              {email}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
