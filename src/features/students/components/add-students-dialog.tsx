"use client";

import { useMemo, useState } from "react";
import { Upload, Download, FileSpreadsheet, ClipboardPaste, Mails } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/cn";
import { parseEmails, parseEmailsFromFile, type ParsedEmails } from "../utils/parse-emails";
import { EmailChipPreview } from "./email-chip-preview";
import { useInviteStudents } from "../hooks/use-students";

const emptyParsed: ParsedEmails = { valid: [], invalid: [], duplicates: [] };

export function AddStudentsDialog({
  disciplineId,
  open,
  onOpenChange,
}: {
  disciplineId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [tab, setTab] = useState<"paste" | "upload">("paste");
  const [pasted, setPasted] = useState("");
  const [fileParsed, setFileParsed] = useState<ParsedEmails>(emptyParsed);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<{ invited: number; ignored: number } | null>(null);

  const invite = useInviteStudents(disciplineId);

  const pastedParsed = useMemo(() => parseEmails(pasted), [pasted]);
  const parsed = tab === "paste" ? pastedParsed : fileParsed;
  const canSubmit = parsed.valid.length > 0;

  function reset() {
    setPasted("");
    setFileParsed(emptyParsed);
    setFileName(null);
    setResult(null);
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    const r = await parseEmailsFromFile(file);
    setFileParsed(r);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onSubmit() {
    invite.mutate(
      { emails: parsed.valid },
      {
        onSuccess: (r) => {
          setResult({ invited: r.invited.length, ignored: r.duplicatesIgnored.length });
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mails className="h-4 w-4" /> Adicionar alunos
          </DialogTitle>
          <DialogDescription>
            Convites serão enviados por email. Alunos aparecem como &quot;convite pendente&quot;
            até concluírem o cadastro.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
              <p className="font-medium">
                {result.invited} convite{result.invited === 1 ? "" : "s"} enviado
                {result.invited === 1 ? "" : "s"}!
              </p>
              {result.ignored > 0 && (
                <p className="mt-1 text-xs">
                  {result.ignored} email(s) já estavam na disciplina e foram ignorados.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Fechar</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="paste">
                  <ClipboardPaste className="mr-2 h-3.5 w-3.5" />
                  Colar emails
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <FileSpreadsheet className="mr-2 h-3.5 w-3.5" />
                  Upload de planilha
                </TabsTrigger>
              </TabsList>

              <TabsContent value="paste">
                <div className="flex flex-col gap-3">
                  <Textarea
                    rows={6}
                    value={pasted}
                    onChange={(e) => setPasted(e.target.value)}
                    placeholder="aluno1@univ.br, aluno2@univ.br&#10;aluno3@univ.br"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe por vírgula, ponto-e-vírgula, espaço ou quebra de linha.
                  </p>
                  <EmailChipPreview parsed={pastedParsed} />
                </div>
              </TabsContent>

              <TabsContent value="upload">
                <div className="flex flex-col gap-3">
                  <a
                    href="data:text/csv;charset=utf-8,email%0Aaluno1@univ.br%0Aaluno2@univ.br"
                    download="modelo-alunos.csv"
                    className="inline-flex items-center gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Baixar modelo CSV
                  </a>

                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 p-8 text-center transition-colors",
                      dragOver && "border-foreground/60 bg-muted/40",
                    )}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {fileName ?? "Arraste um arquivo CSV ou clique para selecionar"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aceita CSV. Primeira coluna é tratada como email.
                    </p>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </label>

                  <EmailChipPreview parsed={fileParsed} />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={onSubmit} disabled={!canSubmit || invite.isPending}>
                {invite.isPending
                  ? "Enviando..."
                  : `Enviar ${parsed.valid.length} convite${parsed.valid.length === 1 ? "" : "s"}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
