"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveCellNote } from "../hooks/use-analysis";

export function CellTeacherNote({
  studentId,
  problemId,
  initialNote,
}: {
  studentId: string;
  problemId: string;
  initialNote?: string;
}) {
  const [note, setNote] = useState(initialNote ?? "");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const save = useSaveCellNote();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNote(initialNote ?? "");
  }, [initialNote, studentId, problemId]);

  function onChange(value: string) {
    setNote(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save.mutate(
        { studentId, problemId, note: value },
        { onSuccess: () => setSavedAt(new Date()) },
      );
    }, 600);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs">
          <Lock className="h-3 w-3" />
          Anotações sobre este aluno neste exercício
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
            "Sempre privadas"
          )}
        </span>
      </div>
      <Textarea
        value={note}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Observações para você. Os alunos não veem isto."
        rows={4}
      />
    </div>
  );
}
