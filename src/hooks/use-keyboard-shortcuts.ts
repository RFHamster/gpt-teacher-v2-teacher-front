"use client";

import { useEffect } from "react";

export interface ShortcutHandler {
  key: string;
  /** "shift" / "ctrl" / "alt" / "meta" */
  modifiers?: string[];
  description?: string;
  handler: (e: KeyboardEvent) => void;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      for (const s of shortcuts) {
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase();
        if (!keyMatch) continue;
        const mods = s.modifiers ?? [];
        if (mods.includes("shift") !== e.shiftKey) continue;
        if (mods.includes("ctrl") !== e.ctrlKey) continue;
        if (mods.includes("alt") !== e.altKey) continue;
        if (mods.includes("meta") !== e.metaKey) continue;
        e.preventDefault();
        s.handler(e);
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcuts]);
}
