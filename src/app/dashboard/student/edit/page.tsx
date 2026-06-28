"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ImageIcon, Loader2, Save, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getApiErrorMessage } from "@/lib/apiError";
import { routes } from "@/lib/routes";
import {
    getStudentProfile,
    updateStudentProfile,
} from "@/services/student.service";
import type { StudentProfileUser } from "@/types/student.types";

const studentProfileSchema = z.object({
    first_name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد."),
    last_name: z.string().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد."),
    phone_number: z.string().optional(),
    bio: z.string().optional(),
    profile_picture: z.any().optional(),
});

type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;

function StudentEditProfilePageContent() {
    const {
        data: profile,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["student-profile"],
        queryFn: getStudentProfile,
    });

    if (isLoading) {
        return (
            <StudentEditProfileShell>
                <div className="flex min-h-64 items-center justify-center rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 text-slate-500 shadow-sm transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90 dark:text-slate-400">
                    <div className="flex items-center gap-3 font-bold">
                        <Loader2 className="animate-spin" size={22} />
                        در حال دریافت اطلاعات پروفایل...
                    </div>
                </div>
            </StudentEditProfileShell>
        );
    }

    if (isError) {
        return (
            <StudentEditProfileShell>
                <div className="rounded-[2rem] border border-red-200 bg-white/90 p-8 text-center shadow-sm transition-colors duration-300 dark:border-red-400/30 dark:bg-slate-900/90">
                    <h1 className="text-xl font-black text-slate-950 transition-colors duration-300 dark:text-white">
                        دریافت اطلاعات پروفایل ناموفق بود
                    </h1>

                    <p className="mt-3 leading-8 text-slate-500 transition-colors duration-300 dark:text-slate-400">
                        {getApiErrorMessage(error)}
                    </p>
                </div>
            </StudentEditProfileShell>
        );
    }

    return (
        <StudentEditProfileShell>
            <StudentProfileForm profile={profile} />
        </StudentEditProfileShell>
    );
}

function StudentEditProfileShell({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <section className="mx-auto max-w-4xl">
                <div className="mb-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/30">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-bold text-emerald-600 transition-colors duration-300 dark:text-emerald-300">
                                Edit Student Profile
                            </p>

                            <h1 className="text-2xl font-black text-slate-950 transition-colors duration-300 dark:text-white">
                                ویرایش اطلاعات دانش‌آموز
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <ThemeToggle />

                            <Link
                                href={routes.studentDashboard}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <ArrowRight size={18} />
                                بازگشت
                            </Link>
                        </div>
                    </div>
                </div>

                {children}
            </section>
        </main>
    );
}

function StudentProfileForm({
                                profile,
                            }: {
    profile: StudentProfileUser | undefined;
}) {
    const queryClient = useQueryClient();

    const profilePictureUrl =
        typeof profile?.profile_picture === "string" &&
        profile.profile_picture.trim() !== ""
            ? profile.profile_picture
            : null;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<StudentProfileFormValues>({
        resolver: zodResolver(studentProfileSchema),
        defaultValues: {
            first_name: profile?.first_name ?? "",
            last_name: profile?.last_name ?? "",
            phone_number: profile?.phone_number ?? "",
            bio: profile?.bio ?? "",
        },
    });

    useEffect(() => {
        if (!profile) return;

        reset({
            first_name: profile.first_name ?? "",
            last_name: profile.last_name ?? "",
            phone_number: profile.phone_number ?? "",
            bio: profile.bio ?? "",
            profile_picture: undefined,
        });
    }, [profile, reset]);

    const mutation = useMutation({
        mutationFn: updateStudentProfile,
        onSuccess: (updatedProfile) => {
            const nextProfile: StudentProfileUser = {
                ...(profile ?? {}),
                ...updatedProfile,
                student: {
                    ...(profile?.student ?? {}),
                    ...(updatedProfile.student ?? {}),
                },
            };

            queryClient.setQueryData(["student-profile"], nextProfile);
            queryClient.invalidateQueries({ queryKey: ["student-profile"] });

            reset({
                first_name: nextProfile.first_name ?? "",
                last_name: nextProfile.last_name ?? "",
                phone_number: nextProfile.phone_number ?? "",
                bio: nextProfile.bio ?? "",
                profile_picture: undefined,
            });

            toast.success("اطلاعات با موفقیت به‌روزرسانی شد.");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error));
        },
    });

    function onSubmit(values: StudentProfileFormValues) {
        const formData = new FormData();

        formData.append("first_name", values.first_name.trim());
        formData.append("last_name", values.last_name.trim());
        formData.append("phone_number", values.phone_number?.trim() ?? "");
        formData.append("bio", values.bio?.trim() ?? "");

        const imageFile = values.profile_picture?.[0] as File | undefined;

        if (imageFile) {
            formData.append("profile_picture", imageFile);
        }

        mutation.mutate(formData);
    }

    return (
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-emerald-400/10 text-emerald-600 transition-colors duration-300 dark:text-emerald-300">
                    {profilePictureUrl ? (
                        <img
                            src={profilePictureUrl}
                            alt="عکس پروفایل"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <UserRound size={24} />
                    )}
                </div>

                <div>
                    <h2 className="font-black text-slate-950 transition-colors duration-300 dark:text-white">
                        اطلاعات پروفایل
                    </h2>

                    <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                        عکس، نام، شماره تلفن و بیوگرافی خود را ویرایش کنید.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
                <div>
                    <label
                        htmlFor="profile_picture"
                        className="mb-2 block text-sm font-bold text-slate-700 transition-colors duration-300 dark:text-slate-200"
                    >
                        عکس پروفایل
                    </label>

                    <label
                        htmlFor="profile_picture"
                        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
                    >
                        <ImageIcon
                            size={28}
                            className="text-emerald-600 dark:text-emerald-300"
                        />

                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                            برای انتخاب عکس جدید کلیک کنید
                        </span>

                        <span className="text-xs font-bold text-slate-400">
                            JPG, PNG, WEBP
                        </span>
                    </label>

                    <input
                        id="profile_picture"
                        type="file"
                        accept="image/*"
                        {...register("profile_picture")}
                        className="hidden"
                    />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="first_name"
                            className="mb-2 block text-sm font-bold text-slate-700 transition-colors duration-300 dark:text-slate-200"
                        >
                            نام
                        </label>

                        <input
                            id="first_name"
                            type="text"
                            {...register("first_name")}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition-colors duration-300 focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-400"
                        />

                        {errors.first_name && (
                            <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                                {errors.first_name.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="last_name"
                            className="mb-2 block text-sm font-bold text-slate-700 transition-colors duration-300 dark:text-slate-200"
                        >
                            نام خانوادگی
                        </label>

                        <input
                            id="last_name"
                            type="text"
                            {...register("last_name")}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition-colors duration-300 focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-400"
                        />

                        {errors.last_name && (
                            <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                                {errors.last_name.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="phone_number"
                        className="mb-2 block text-sm font-bold text-slate-700 transition-colors duration-300 dark:text-slate-200"
                    >
                        شماره تلفن
                    </label>

                    <input
                        id="phone_number"
                        type="text"
                        {...register("phone_number")}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition-colors duration-300 focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-400"
                        placeholder="مثلاً 09120000000"
                    />
                </div>

                <div>
                    <label
                        htmlFor="bio"
                        className="mb-2 block text-sm font-bold text-slate-700 transition-colors duration-300 dark:text-slate-200"
                    >
                       بیوگرافی
                    </label>

                    <textarea
                        id="bio"
                        rows={5}
                        {...register("bio")}
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition-colors duration-300 focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-400"
                        placeholder="چند جمله کوتاه درباره خودتان بنویسید."
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || mutation.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"
                >
                    {mutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Save size={18} />
                    )}
                    ذخیره تغییرات
                </button>
            </form>
        </div>
    );
}

export default function StudentEditProfilePage() {
    return (
        <ProtectedRoute allowedRoles={["student"]}>
            <StudentEditProfilePageContent />
        </ProtectedRoute>
    );
}