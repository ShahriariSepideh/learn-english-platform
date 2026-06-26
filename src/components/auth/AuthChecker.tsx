"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@/services/auth.service";
import { clearAuthUser, setAuthLoading, setAuthUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";

export function AuthChecker() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        let isActive = true;

        async function checkAuthStatus() {
            dispatch(setAuthLoading(true));

            try {
                const user = await getCurrentUser();

                if (!isActive) {
                    return;
                }

                dispatch(setAuthUser(user));
            } catch {
                if (!isActive) {
                    return;
                }

                dispatch(clearAuthUser());
            }
        }

        checkAuthStatus();

        return () => {
            isActive = false;
        };
    }, [dispatch]);

    return null;
}