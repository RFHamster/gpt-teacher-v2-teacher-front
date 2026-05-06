"use client";

import { Loader2, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import type { AiState } from "@/types/entities";
import { Button } from "./button";

export function AiStateIndicator({
  state,
  onGenerate,
  onRegenerate,
  generateLabel = "Gerar análise por IA",
  regenerateLabel = "Regenerar",
}: {
  state: AiState;
  onGenerate?: () => void;
  onRegenerate?: () => void;
  generateLabel?: string;
  regenerateLabel?: string;
}) {
  if (state === "not_generated") {
    return (
      <Button onClick={onGenerate} variant="outline" size="sm">
        <Sparkles className="mr-2 h-4 w-4" />
        {generateLabel}
      </Button>
    );
  }
  if (state === "generating") {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Gerando análise...
      </div>
    );
  }
  if (state === "ready") {
    return (
      <Button onClick={onRegenerate} variant="ghost" size="sm">
        <RefreshCw className="mr-2 h-3 w-3" />
        {regenerateLabel}
      </Button>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 text-sm text-red-600">
      <AlertTriangle className="h-4 w-4" />
      Erro ao gerar.
      <Button onClick={onRegenerate} variant="ghost" size="sm">
        Tentar novamente
      </Button>
    </div>
  );
}
