"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/components/providers/theme-provider";
import { cn } from "@/utils/cn";

const order: Theme[] = ["light", "dark", "system"];
const labels: Record<Theme, string> = {
  light: "Claro",
  dark: "Escuro",
  system: "Sistema",
};

export function ThemeToggle() {
  const { theme, resolved, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Antes do mount evitamos render do ícone — assim não há mismatch SSR/client.
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" aria-label="Tema" className="opacity-0">
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  function next() {
    const idx = order.indexOf(theme);
    const nextTheme = order[(idx + 1) % order.length]!;
    setTheme(nextTheme);
  }

  const Icon = theme === "system" ? Monitor : resolved === "dark" ? Moon : Sun;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={next}
      aria-label={`Tema: ${labels[theme]} (clique para alternar)`}
      title={`Tema: ${labels[theme]}`}
      className={cn("gap-1.5")}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden text-xs md:inline">{labels[theme]}</span>
    </Button>
  );
}
