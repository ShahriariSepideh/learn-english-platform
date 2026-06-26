"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import {
    BookOpen,
    CheckCircle2,
    Heart,
    Loader2,
    Pencil,
    RefreshCcw,
    UserRound,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/apiError";
import { routes } from "@/lib/routes";
import { getStudentProfile } from "@/services/student.service";
import type { StudentInfo, StudentProfileUser } from "@/types/student.types";

function getFullName(profile?: StudentProfileUser | null, fallback?: string) {
    const firstName = profile?.first_name ?? "";
    const lastName = profile?.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || fallback || "دانش‌آموز";
}

function getArrayCount(value: unknown): number {
    if (Array.isArray(value)) {
        return value.length;
    }

    return 0;
}

function getHomeworkCount(student?: StudentInfo): number {
    const value = student?.student_homework_completed;

    if (typeof value === "number") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.length;
    }

    return 0;
}

function StudentDashboardContent() {
    const { user, logout } = useAuth();

    const {
        data: profile,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["student-profile"],
        queryFn: getStudentProfile,
    });

    const student = profile?.student;
    const displayName = getFullName(profile, user?.full_name || user?.name);

    const coursesCount = getArrayCount(student?.courses_list);
    const favouriteTutorsCount = getArrayCount(student?.favourite_tutors);
    const homeworkCompletedCount = getHomeworkCount(student);
    const isActive = student?.student_active ?? false;

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <section className="mx-auto max-w-6xl">
                <div className="mb-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/30">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-bold text-emerald-600 transition-colors duration-300 dark:text-emerald-300">
                                Student Dashboard
                            </p>

                            <h1 className="text-2xl font-black text-slate-950 transition-colors duration-300 dark:text-white">
                                خوش آمدید، {displayName}
                            </h1>

                            <p className="mt-2 leading-7 text-slate-500 transition-colors duration-300 dark:text-slate-400">
                                اطلاعات این داشبورد از APIهای واقعی بک‌اند دریافت می‌شود.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <ThemeToggle />

                            <Link
                                href={routes.studentEditProfile}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <Pencil size={18} />
                                ویرایش پروفایل
                            </Link>

                            <button
                                type="button"
                                onClick={logout}
                                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                خروج
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <DashboardLoading />
                ) : isError ? (
                    <DashboardError
                        message={getApiErrorMessage(error)}
                        onRetry={() => refetch()}
                        isFetching={isFetching}
                    />
                ) : (
                    <>
                        <div className="mb-6 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-slate-950 transition-colors duration-300 dark:text-white">
                                        وضعیت پروفایل
                                    </h2>

                                    <p className="mt-2 leading-7 text-slate-500 transition-colors duration-300 dark:text-slate-400">
                                        {profile?.bio || "هنوز توضیحی برای پروفایل ثبت نشده است."}
                                    </p>
                                </div>

                                <span
                                    className={
                                        isActive
                                            ? "inline-flex w-fit items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
                                            : "inline-flex w-fit items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300"
                                    }
                                >
                  <CheckCircle2 size={18} />
                                    {isActive ? "دانش‌آموز فعال" : "پروفایل در انتظار تکمیل"}
                </span>
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-4">
                            <DashboardCard
                                icon={<UserRound size={26} />}
                                title="پروفایل"
                                value={profile?.phone_number || "ثبت نشده"}
                                description="شماره تماس ثبت‌شده"
                            />

                            <DashboardCard
                                icon={<BookOpen size={26} />}
                                title="دوره‌های من"
                                value={coursesCount.toString()}
                                description="تعداد دوره‌های ثبت‌نام‌شده"
                            />

                            <DashboardCard
                                icon={<Heart size={26} />}
                                title="استادهای مورد علاقه"
                                value={favouriteTutorsCount.toString()}
                                description="تعداد استادهای ذخیره‌شده"
                            />

                            <DashboardCard
                                icon={<CheckCircle2 size={26} />}
                                title="تکالیف تکمیل‌شده"
                                value={homeworkCompletedCount.toString()}
                                description="تعداد تکالیف انجام‌شده"
                            />
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

function DashboardCard({
                           icon,
                           title,
                           value,
                           description,
                       }: {
    icon: ReactNode;
    title: string;
    value: string;
    description: string;
}) {
    return (
        <article className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 transition-colors duration-300 dark:text-emerald-300">
                {icon}
            </div>

            <h2 className="mb-2 font-black text-slate-950 transition-colors duration-300 dark:text-white">
                {title}
            </h2>

            <p className="mb-2 text-2xl font-black text-slate-950 transition-colors duration-300 dark:text-white">
                {value}
            </p>

            <p className="leading-7 text-slate-500 transition-colors duration-300 dark:text-slate-400">
                {description}
            </p>
        </article>
    );
}

function DashboardLoading() {
    return (
        <div className="flex min-h-64 items-center justify-center rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 text-slate-500 shadow-sm transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90 dark:text-slate-400">
            <div className="flex items-center gap-3 font-bold">
                <Loader2 className="animate-spin" size={22} />
                در حال دریافت اطلاعات داشبورد...
            </div>
        </div>
    );
}

function DashboardError({
                            message,
                            onRetry,
                            isFetching,
                        }: {
    message: string;
    onRetry: () => void;
    isFetching: boolean;
}) {
    return (
        <div className="rounded-[2rem] border border-red-200 bg-white/90 p-8 text-center shadow-sm transition-colors duration-300 dark:border-red-400/30 dark:bg-slate-900/90">
            <h2 className="text-xl font-black text-slate-950 transition-colors duration-300 dark:text-white">
                دریافت اطلاعات داشبورد ناموفق بود
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-8 text-slate-500 transition-colors duration-300 dark:text-slate-400">
                {message}
            </p>

            <button
                type="button"
                onClick={onRetry}
                disabled={isFetching}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isFetching ? (
                    <Loader2 className="animate-spin" size={18} />
                ) : (
                    <RefreshCcw size={18} />
                )}
                تلاش دوباره
            </button>
        </div>
    );
}

export default function StudentDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboardContent />
        </ProtectedRoute>
    );
}