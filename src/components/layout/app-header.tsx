"use client";

import { Bell, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/features/auth";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

export function AppHeader() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:px-6">
      <div className="lg:hidden">
        <span className="text-sm font-semibold">GPT Teacher</span>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <Button variant="ghost" size="sm" aria-label="Notificações">
          <Bell className="h-4 w-4" />
        </Button>
        {user && (
          <div className="flex items-center gap-2">
            <Avatar name={user.name} size="sm" />
            <div className="hidden text-right md:block">
              <div className="text-xs font-medium leading-tight">{user.name}</div>
              <div className="text-[10px] text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout.mutate(undefined, { onSuccess: () => router.push(routes.login) })}
          aria-label="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
