"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CodeViewer({ code, language }: { code: string; language: string }) {
  function copy() {
    navigator.clipboard.writeText(code);
  }
  return (
    <div className="flex h-full flex-col rounded-md border border-border bg-muted/30">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
        <span className="font-mono">{language}</span>
        <Button variant="ghost" size="sm" onClick={copy} aria-label="Copiar código">
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
      {code ? (
        <pre className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed">
          <code>{code}</code>
        </pre>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          Nenhum código submetido.
        </div>
      )}
    </div>
  );
}
