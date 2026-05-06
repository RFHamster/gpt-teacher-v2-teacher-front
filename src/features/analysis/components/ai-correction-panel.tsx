"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AiStateIndicator } from "@/components/ui/ai-state";
import { MarkdownRender } from "./markdown-render";
import { useGenerateCorrection } from "../hooks/use-analysis";
import type { AiState } from "@/types/entities";

export function AiCorrectionPanel({
  studentId,
  problemId,
}: {
  studentId: string;
  problemId: string;
}) {
  const generate = useGenerateCorrection();
  const [state, setState] = useState<AiState>("not_generated");
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    setState("not_generated");
    setContent(null);
  }, [studentId, problemId]);

  function trigger() {
    setState("generating");
    generate.mutate(
      { studentId, problemId },
      {
        onSuccess: (ai) => {
          setState(ai.state);
          setContent(ai.content ?? null);
        },
        onError: () => setState("error"),
      },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Correção da IA
        </h4>
        <AiStateIndicator
          state={state}
          onGenerate={trigger}
          onRegenerate={trigger}
          generateLabel="Gerar correção"
          regenerateLabel="Regenerar"
        />
      </div>
      {state === "generating" && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-20" />
        </div>
      )}
      {state === "ready" && content && <MarkdownRender content={content} />}
      {state === "not_generated" && (
        <p className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
          A correção é gerada sob demanda — usa créditos da IA. Clique em &quot;Gerar correção&quot;.
        </p>
      )}
    </div>
  );
}
