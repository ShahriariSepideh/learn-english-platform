"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { registerUser } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { routes } from "@/lib/routes";
import type { RegisterRequest } from "@/types/auth.types";

const registerSchema = z.object({
    name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد."),
    email: z.string().email("ایمیل معتبر وارد کنید."),
    password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
    role: RegisterRequest["role"];
}

export function RegisterForm({ role }: RegisterFormProps) {
    const router = useRouter();
    const isTutor = role === "tutor";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: RegisterFormValues) {
        try {
            await registerUser({
                ...values,
                role,
            });

            toast.success(
                isTutor
                    ? "ثبت‌نام استاد با موفقیت انجام شد. اکنون وارد حساب شوید."
                    : "ثبت‌نام دانش‌آموز با موفقیت انجام شد. اکنون وارد حساب شوید."
            );

            router.push(routes.login);
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    }

    return (
        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                    {isTutor ? "ثبت‌نام استاد" : "ثبت‌نام دانش‌آموز"}
                </h1>

                <p className="mt-3 leading-7 text-slate-500 dark:text-slate-400">
                    {isTutor
                        ? "برای شروع تدریس، حساب استاد خود را ایجاد کنید."
                        : "برای شروع یادگیری، حساب دانش‌آموز خود را ایجاد کنید."}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                    >
                        نام
                    </label>

                    <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        {...register("name")}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />

                    {errors.name && (
                        <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>
                    )}
                </div>

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
                        autoComplete="new-password"
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
                    {isTutor ? "ثبت‌نام استاد" : "ثبت‌نام دانش‌آموز"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                قبلاً حساب ساخته‌اید؟{" "}
                <Link
                    href={routes.login}
                    className="font-bold text-emerald-600 dark:text-emerald-300"
                >
                    ورود به حساب
                </Link>
            </p>
        </div>
    );
}