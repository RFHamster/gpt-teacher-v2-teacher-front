"use client";

import { Bot, User as UserIcon, FileCode } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";
import type { SessionMessage } from "@/types/entities";

const roleConfig = {
  user: { label: "Aluno", icon: UserIcon, container: "bg-muted/40", align: "items-end" },
  assistant: {
    label: "Assistente",
    icon: Bot,
    container: "bg-blue-50 dark:bg-blue-900/20",
    align: "items-start",
  },
  code_review: {
    label: "Code review da IA",
    icon: FileCode,
    container: "bg-amber-50 dark:bg-amber-900/20 font-mono text-xs",
    align: "items-start",
  },
} as const;

export function ConversationTranscript({ messages }: { messages: SessionMessage[] }) {
  if (messages.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        Sem interações nesta tentativa.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => {
        const cfg = roleConfig[m.role];
        const Icon = cfg.icon;
        return (
          <div key={m.id} className={cn("flex flex-col gap-1", cfg.align)}>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Icon className="h-3 w-3" />
              {cfg.label} · {formatDateTime(m.createdAt)}
            </div>
            <div
              className={cn(
                "max-w-[90%] whitespace-pre-wrap rounded-md border border-border px-3 py-2 text-sm",
                cfg.container,
              )}
            >
              {m.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
