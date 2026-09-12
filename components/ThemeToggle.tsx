"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full text-nav-muted"
        aria-label="สลับโหมดการแสดงผล"
        disabled
      >
        <Sun className="h-4 w-4 opacity-40" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full text-nav-foreground hover:bg-nav-hover transition-colors"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      title={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-nav-foreground transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-nav-foreground transition-transform rotate-0 scale-100" />
      )}
    </Button>
  );
}
