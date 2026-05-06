"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { routes } from "@/config/routes";

export function DisciplineTabs({ disciplineId }: { disciplineId: string }) {
  const pathname = usePathname();
  const items = [
    { href: routes.discipline(disciplineId), label: "Visão Geral", exact: true },
    { href: routes.disciplineLists(disciplineId), label: "Listas de Exercícios" },
    { href: routes.disciplineStudents(disciplineId), label: "Alunos" },
    { href: routes.disciplineSettings(disciplineId), label: "Configurações" },
  ];

  return (
    <div className="flex border-b border-border">
      {items.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "text-foreground after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
