"use client";

import {
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { useSessionFeedback, useTriggerFeedbackGeneration } from "../hooks/use-analysis";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Badge({
  positive,
  label,
}: {
  positive: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        positive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      )}
    >
      {positive ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertCircle className="h-3 w-3" />
      )}
      {label}
    </span>
  );
}

function NeutralBadge({
  label,
  color,
}: {
  label: string;
  color: "green" | "amber" | "red";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        color === "green" &&
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        color === "amber" &&
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        color === "red" &&
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      )}
    >
      {label}
    </span>
  );
}

function Notes({ text }: { text: string }) {
  if (!text || text === "Nenhum detectado") return null;
  return (
    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{text}</p>
  );
}

function CodeScoreBar({ score }: { score: number }) {
  const pct = Math.round((score / 10) * 100);
  const color =
    score >= 7
      ? "bg-emerald-500"
      : score >= 4
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-semibold tabular-nums">
        {score}/10
      </span>
    </div>
  );
}

const RESOLUTION_LABELS: Record<string, { label: string; positive: boolean }> = {
  complete: { label: "Resolveu completamente", positive: true },
  partial:  { label: "Resolveu parcialmente",  positive: false },
  none:     { label: "Não avançou",             positive: false },
};

const DEPENDENCY_CONFIG: Record<string, { label: string; color: "green" | "amber" | "red" }> = {
  low:    { label: "Baixa dependência",  color: "green" },
  medium: { label: "Dependência média",  color: "amber" },
  high:   { label: "Alta dependência",   color: "red"   },
};

export function SessionIndicatorsPanel({ sessionId }: { sessionId: string }) {
  const [waitingForTask, setWaitingForTask] = useState(false);
  const { data, isLoading, error, refetch, isFetching } = useSessionFeedback(sessionId);
  const trigger = useTriggerFeedbackGeneration();

  function handleTrigger() {
    setWaitingForTask(true);
    trigger.mutate(undefined, {
      onSettled: () => setWaitingForTask(false),
    });
  }

  const isGenerating = trigger.isPending || waitingForTask;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-3 py-2 text-center">
        <p className="text-sm text-muted-foreground">
          {isGenerating
            ? "Processando sessão, aguarde..."
            : "Nenhum relatório gerado para esta sessão ainda."}
        </p>
        <button
          onClick={handleTrigger}
          disabled={isGenerating}
          className="mx-auto flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/40 disabled:opacity-50"
        >
          {isGenerating ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Zap className="h-3 w-3" />
          )}
          {isGenerating ? "Gerando..." : "Gerar indicadores agora"}
        </button>
      </div>
    );
  }

  const { indicators } = data;
  const ev = indicators.session_evaluation;

  return (
    <div className="flex flex-col gap-4 py-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Avaliado por IA sobre toda a conversa</span>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-muted-foreground hover:text-foreground"
          title="Atualizar"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
        </button>
      </div>

      {/* Resumo geral */}
      {ev?.summary && (
        <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
          {ev.summary}
        </div>
      )}

      {/* Interações */}
      {indicators.attempts_per_session && (
        <Row label="Interações">
          <span className="flex items-center gap-1 text-foreground">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            {indicators.attempts_per_session.student_message_count} do aluno ·{" "}
            {indicators.attempts_per_session.ai_message_count} da IA
          </span>
        </Row>
      )}

      {/* Resolução */}
      {ev && ev.evaluated_by === "llm" && ev.resolution_quality && (
        <Row label="Resolução">
          {(() => {
            const cfg = RESOLUTION_LABELS[ev.resolution_quality];
            return cfg ? (
              <Badge positive={cfg.positive} label={cfg.label} />
            ) : null;
          })()}
        </Row>
      )}

      {/* Qualidade do código */}
      {ev && ev.evaluated_by === "llm" && ev.code_quality_score != null && (
        <Row label="Qualidade do código">
          <CodeScoreBar score={ev.code_quality_score} />
          <Notes text={ev.code_quality_notes} />
        </Row>
      )}

      {/* Dependência de ajuda */}
      {ev && ev.evaluated_by === "llm" && ev.help_dependency && (
        <Row label="Dependência de ajuda">
          {(() => {
            const cfg = DEPENDENCY_CONFIG[ev.help_dependency];
            return cfg ? (
              <div className="flex flex-col gap-0.5">
                <NeutralBadge label={cfg.label} color={cfg.color} />
                <Notes text={ev.help_dependency_notes} />
              </div>
            ) : null;
          })()}
        </Row>
      )}

      {/* Pedido de resposta pronta */}
      {ev && ev.evaluated_by === "llm" && ev.answer_seeking_detected != null && (
        <Row label="Pediu resposta pronta">
          <div className="flex flex-col gap-0.5">
            <Badge
              positive={!ev.answer_seeking_detected}
              label={
                ev.answer_seeking_detected
                  ? `${ev.answer_seeking_count}x detectado`
                  : "Não detectado"
              }
            />
            {ev.answer_seeking_detected && (
              <Notes text={ev.answer_seeking_notes} />
            )}
          </div>
        </Row>
      )}

      {/* Abandono */}
      {indicators.abandonment && (
        <Row label="Abandono">
          <Badge
            positive={indicators.abandonment.abandoned !== true}
            label={
              indicators.abandonment.abandoned === true
                ? indicators.abandonment.idle_minutes
                  ? `Inativo há ${Math.round(indicators.abandonment.idle_minutes)} min`
                  : "Provável abandono"
                : indicators.abandonment.label === "completed"
                  ? "Sessão encerrada"
                  : "Sem abandono"
            }
          />
        </Row>
      )}

      {/* LLM falhou / skipped */}
      {ev?.evaluated_by === "skipped" && (
        <p className="text-xs text-muted-foreground">
          Avaliação por IA indisponível para esta sessão.
        </p>
      )}

      <button
        onClick={handleTrigger}
        disabled={isGenerating}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40 disabled:opacity-50"
      >
        {isGenerating ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <Zap className="h-3 w-3" />
        )}
        {isGenerating ? "Gerando..." : "Regenerar indicadores"}
      </button>
    </div>
  );
}
