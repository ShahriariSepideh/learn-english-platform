"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clearAuthUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/services/auth.service";
import { routes } from "@/lib/routes";

export function useAuth() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);

    async function logout() {
        try {
            await logoutUser();
            dispatch(clearAuthUser());
            toast.success("با موفقیت خارج شدید.");
            router.push(routes.login);
        } catch {
            dispatch(clearAuthUser());
            router.push(routes.login);
        }
    }

    return {
        ...auth,
        logout,
    };
}