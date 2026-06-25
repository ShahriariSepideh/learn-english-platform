"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types/auth.types";
import { routes } from "@/lib/routes";
import { useAuth } from "@/hooks/useAuth";

export function useRequireAuth(allowedRoles?: UserRole[]) {
    const router = useRouter();
    const auth = useAuth();

    useEffect(() => {
        if (auth.isLoading) {
            return;
        }

        if (!auth.isAuthenticated) {
            router.replace(routes.login);
            return;
        }

        if (
            allowedRoles &&
            auth.user &&
            !allowedRoles.includes(auth.user.role)
        ) {
            router.replace(routes.home);
        }
    }, [allowedRoles, auth.isAuthenticated, auth.isLoading, auth.user, router]);

    return auth;
}