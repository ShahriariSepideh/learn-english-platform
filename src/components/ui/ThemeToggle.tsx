"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    function handleToggleTheme() {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }

    return (
        <button
            type="button"
            onClick={handleToggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            aria-label="تغییر حالت روشن و تاریک"
            title="تغییر حالت روشن و تاریک"
        >
            <Moon size={20} className="dark:hidden" />
            <Sun size={20} className="hidden dark:block" />
        </button>
    );
}