import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-2xl font-semibold">404 — Página não encontrada</h2>
      <Link href="/" className="text-sm underline">
        Voltar para o início
      </Link>
    </div>
  );
}
