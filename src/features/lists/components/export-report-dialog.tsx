"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function ExportReportDialog({
  open,
  onOpenChange,
  listName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listName: string;
}) {
  const [format, setFormat] = useState<"pdf" | "xlsx">("pdf");
  const [includeAggregates, setIncludeAggregates] = useState(true);
  const [includeAi, setIncludeAi] = useState(true);
  const [includeMatrix, setIncludeMatrix] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  function generate() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setDone(true);
    }, 1200);
  }

  function reset() {
    setDone(false);
    setGenerating(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Exportar relatório</DialogTitle>
          <DialogDescription>
            {listName} — escolha o formato e o conteúdo que deseja incluir.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
            Relatório gerado (mock). Integração real chega no Sprint 5.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="export-format">Formato</Label>
              <Select
                id="export-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as typeof format)}
              >
                <option value="pdf">PDF — relatório formatado</option>
                <option value="xlsx">XLSX — dados brutos</option>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Conteúdo</Label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeAggregates}
                  onChange={(e) => setIncludeAggregates(e.target.checked)}
                />
                Indicadores agregados
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeAi}
                  onChange={(e) => setIncludeAi(e.target.checked)}
                />
                Insights da IA
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeMatrix}
                  onChange={(e) => setIncludeMatrix(e.target.checked)}
                />
                Matriz aluno × exercício
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                />
                Anotações do professor{" "}
                <span className="text-xs text-muted-foreground">
                  (atenção: contém observações privadas)
                </span>
              </label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {done ? "Fechar" : "Cancelar"}
          </Button>
          {!done && (
            <Button onClick={generate} disabled={generating}>
              <Download className="mr-2 h-4 w-4" />
              {generating ? "Gerando..." : "Gerar e baixar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
