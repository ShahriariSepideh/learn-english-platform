"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { loginUser } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { routes } from "@/lib/routes";
import { setAuthUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";

const loginSchema = z.object({
    email: z.string().email("ایمیل معتبر وارد کنید."),
    password: z.string().min(1, "رمز عبور را وارد کنید."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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
            const user = await loginUser(values);

            if (!user) {
                throw new Error("اطلاعات کاربر از سرور دریافت نشد.");
            }

            dispatch(setAuthUser(user));
            toast.success("ورود با موفقیت انجام شد.");

            if (user.role === "tutor") {
                router.push(routes.tutorDashboard);
                return;
            }

            router.push(routes.studentDashboard);
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    }

    return (
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/30">
            <div className="mb-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400/15 text-emerald-600 transition-colors duration-300 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <LockKeyhole size={28} />
                </div>

                <h1 className="text-2xl font-black text-slate-950 transition-colors duration-300 dark:text-white">
                    ورود به حساب
                </h1>

            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-bold text-slate-700 transition-colors duration-300 dark:text-slate-200"
                    >
                        ایمیل
                    </label>

                    <div className="relative">
                        <Mail
                            size={18}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                        />

                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            {...register("email")}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-11 text-slate-950 outline-none transition-colors duration-300 placeholder:text-slate-400 focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
                            placeholder="example@email.com"
                        />
                    </div>

                    {errors.email && (
                        <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-bold text-slate-700 transition-colors duration-300 dark:text-slate-200"
                    >
                        رمز عبور
                    </label>

                    <div className="relative">
                        <LockKeyhole
                            size={18}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                        />

                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            {...register("password")}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-11 text-slate-950 outline-none transition-colors duration-300 placeholder:text-slate-400 focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
                            placeholder="رمز عبور"
                        />
                    </div>

                    {errors.password && (
                        <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300"
                >
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    ورود
                </button>
            </form>

            <div className="mt-6 grid gap-3 text-center text-sm text-slate-500 transition-colors duration-300 dark:text-slate-400">
                <p>
                    حساب دانش‌آموز ندارید؟{" "}
                    <Link
                        href={routes.studentRegister}
                        className="font-bold text-emerald-600 transition-colors duration-300 hover:text-emerald-500 dark:text-emerald-300 dark:hover:text-emerald-200"
                    >
                        ثبت‌نام دانش‌آموز
                    </Link>
                </p>

                <p>
                    می‌خواهید استاد شوید؟{" "}
                    <Link
                        href={routes.tutorRegister}
                        className="font-bold text-emerald-600 transition-colors duration-300 hover:text-emerald-500 dark:text-emerald-300 dark:hover:text-emerald-200"
                    >
                        ثبت‌نام استاد
                    </Link>
                </p>
            </div>
        </div>
    );
}