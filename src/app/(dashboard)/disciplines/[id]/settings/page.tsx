"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DisciplineSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da disciplina</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Em breve: editar nome, semestre, arquivar disciplina e gerenciar permissões.
      </CardContent>
    </Card>
  );
}
