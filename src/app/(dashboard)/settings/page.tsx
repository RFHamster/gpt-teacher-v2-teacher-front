import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Configurações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Perfil & preferências</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Em breve: dados pessoais, preferências de notificação e tema (claro/escuro).
        </CardContent>
      </Card>
    </div>
  );
}
