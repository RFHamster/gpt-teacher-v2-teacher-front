"use client";

import { useEffect, useRef, useState } from "react";
import { Save, ShieldAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveStudentNote } from "../hooks/use-analysis";

export function StudentGeneralNote({
  studentId,
  initialNote,
}: {
  studentId: string;
  initialNote?: string;
}) {
  const [note, setNote] = useState(initialNote ?? "");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const save = useSaveStudentNote();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNote(initialNote ?? "");
  }, [initialNote, studentId]);

  function onChange(value: string) {
    setNote(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save.mutate({ studentId, note: value }, { onSuccess: () => setSavedAt(new Date()) });
    }, 600);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-sm">
          Anotações gerais sobre este aluno
        </Label>
        <span className="text-[10px] text-muted-foreground">
          {save.isPending ? (
            "Salvando..."
          ) : savedAt ? (
            <>
              <Save className="mr-1 inline h-2.5 w-2.5" />
              Salvo
            </>
          ) : (
            "Auto-save ativo"
          )}
        </span>
      </div>
      <Textarea
        value={note}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Observações que valem para qualquer contexto deste aluno..."
        rows={4}
      />
      <p className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300">
        <ShieldAlert className="h-3 w-3" />
        Estas anotações são privadas e visíveis em qualquer contexto deste aluno na disciplina.
        Os alunos nunca veem o que está aqui.
      </p>
    </div>
  );
}
