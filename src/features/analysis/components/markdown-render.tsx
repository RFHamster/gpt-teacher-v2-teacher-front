"use client";

/**
 * Mini-renderer de markdown sem dependências.
 * Suporta: headings, parágrafos, listas, code blocks (triplo backtick),
 * inline code, bold (**), italic (*).
 *
 * Quando integrarmos o backend de IA, dá pra trocar por react-markdown.
 */

import { Fragment } from "react";
import { cn } from "@/utils/cn";

function inline(text: string): React.ReactNode {
  // ` ` `code` -> <code>
  const codeSplit = text.split(/(`[^`]+`)/g);
  return codeSplit.map((seg, idx) => {
    if (seg.startsWith("`") && seg.endsWith("`")) {
      return (
        <code key={idx} className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          {seg.slice(1, -1)}
        </code>
      );
    }
    // bold then italic
    const boldSplit = seg.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Fragment key={idx}>
        {boldSplit.map((b, bIdx) => {
          if (b.startsWith("**") && b.endsWith("**")) {
            return <strong key={bIdx}>{b.slice(2, -2)}</strong>;
          }
          const itSplit = b.split(/(\*[^*]+\*)/g);
          return (
            <Fragment key={bIdx}>
              {itSplit.map((it, iIdx) =>
                it.startsWith("*") && it.endsWith("*") ? (
                  <em key={iIdx}>{it.slice(1, -1)}</em>
                ) : (
                  <Fragment key={iIdx}>{it}</Fragment>
                ),
              )}
            </Fragment>
          );
        })}
      </Fragment>
    );
  });
}

export function MarkdownRender({ content, className }: { content: string; className?: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) {
        codeLines.push(lines[i] ?? "");
        i++;
      }
      i++;
      blocks.push(
        <pre
          key={key++}
          className="overflow-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-xs"
          data-lang={lang}
        >
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(
        <h4 key={key++} className="mt-1 text-sm font-semibold">
          {inline(line.slice(4))}
        </h4>,
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h3 key={key++} className="mt-2 text-base font-semibold">
          {inline(line.slice(3))}
        </h3>,
      );
      i++;
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (
        i < lines.length &&
        ((lines[i] ?? "").startsWith("- ") || (lines[i] ?? "").startsWith("* "))
      ) {
        items.push((lines[i] ?? "").replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc space-y-1 pl-5 text-sm">
          {items.map((it, idx) => (
            <li key={idx}>{inline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal space-y-1 pl-5 text-sm">
          {items.map((it, idx) => (
            <li key={idx}>{inline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    blocks.push(
      <p key={key++} className="text-sm leading-relaxed">
        {inline(line)}
      </p>,
    );
    i++;
  }

  return <div className={cn("flex flex-col gap-2", className)}>{blocks}</div>;
}
