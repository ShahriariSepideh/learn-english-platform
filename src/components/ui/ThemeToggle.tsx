"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const isDark = theme === "dark";

    function handleToggleTheme() {
        setTheme(isDark ? "light" : "dark");
    }

    return (
        <button
            type="button"
            onClick={handleToggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-900 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            aria-label="تغییر حالت روشن و تاریک"
            title="تغییر حالت روشن و تاریک"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}