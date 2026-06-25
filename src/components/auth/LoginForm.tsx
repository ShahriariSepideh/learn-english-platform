"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { getCurrentUser, loginUser } from "@/services/auth.service";
import { setAuthUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { getApiErrorMessage } from "@/lib/apiError";
import { routes } from "@/lib/routes";
import type { AuthUser } from "@/types/auth.types";

const loginSchema = z.object({
    email: z.string().email("ایمیل معتبر وارد کنید."),
    password: z.string().min(1, "رمز عبور را وارد کنید."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getRedirectPath(user: AuthUser): string {
    if (user.role === "student") {
        return routes.studentDashboard;
    }

    if (user.role === "tutor") {
        return routes.tutorDashboard;
    }

    return routes.home;
}

export function LoginForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginFormValues) {
        try {
            const loginResponseUser = await loginUser(values);
            const user = loginResponseUser ?? (await getCurrentUser());

            dispatch(setAuthUser(user));
            toast.success("ورود با موفقیت انجام شد.");
            router.push(getRedirectPath(user));
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    }

    return (
        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                    ورود به حساب کاربری
                </h1>

                <p className="mt-3 leading-7 text-slate-500 dark:text-slate-400">
                    برای ادامه یادگیری وارد حساب خود شوید.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                    >
                        ایمیل
                    </label>

                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...register("email")}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />

                    {errors.email && (
                        <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                    >
                        رمز عبور
                    </label>

                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        {...register("password")}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />

                    {errors.password && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    ورود
                </button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>
                    حساب دانش‌آموز ندارید؟{" "}
                    <Link
                        href={routes.studentRegister}
                        className="font-bold text-emerald-600 dark:text-emerald-300"
                    >
                        ثبت‌نام دانش‌آموز
                    </Link>
                </p>

                <p>
                    استاد هستید؟{" "}
                    <Link
                        href={routes.tutorRegister}
                        className="font-bold text-emerald-600 dark:text-emerald-300"
                    >
                        ثبت‌نام استاد
                    </Link>
                </p>
            </div>
        </div>
    );
}