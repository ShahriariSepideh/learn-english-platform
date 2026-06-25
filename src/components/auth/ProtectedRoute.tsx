"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { routes } from "@/lib/routes";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth.types";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
}

export function ProtectedRoute({
                                   children,
                                   allowedRoles,
                               }: ProtectedRouteProps) {
    const router = useRouter();
    const auth = useAuth();

    const isRoleAllowed =
        !allowedRoles ||
        (auth.user ? allowedRoles.includes(auth.user.role) : false);

    useEffect(() => {
        if (auth.isLoading) {
            return;
        }

        if (!auth.isAuthenticated) {
            router.replace(routes.login);
            return;
        }

        if (!isRoleAllowed) {
            router.replace(routes.home);
        }
    }, [auth.isAuthenticated, auth.isLoading, isRoleAllowed, router]);

    if (auth.isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-4 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                    <span>در حال بررسی وضعیت ورود...</span>
                </div>
            </main>
        );
    }

    if (!auth.isAuthenticated || !isRoleAllowed) {
        return null;
    }

    return <>{children}</>;
}