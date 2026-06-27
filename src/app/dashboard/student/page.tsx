"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
    BookOpen,
    CheckCircle2,
    Clock3,
    Heart,
    Pencil,
    Home,
    Loader2,
    RefreshCcw,
    UserRound,
    XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/apiError";
import { routes } from "@/lib/routes";
import { getStudentProfile } from "@/services/student.service";
import {
    getEnrollmentCourseTitle,
    getEnrollmentStatus,
    getMyEnrollments,
    type MyEnrollment,
} from "@/services/enrollment.service";
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

function getStatusLabel(status: string) {
    switch (status) {
        case "approved":
            return "تأیید شده";
        case "rejected":
            return "رد شده";
        case "pending":
        case "under_review":
            return "در انتظار بررسی";
        case "pending_payment":
            return "در انتظار پرداخت";
        case "cancelled":
            return "لغو شده";
        default:
            return status || "نامشخص";
    }
}

function getStatusClassName(status: string) {
    switch (status) {
        case "approved":
            return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300";
        case "rejected":
            return "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300";
        case "pending":
        case "under_review":
        default:
            return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300";
    }
}

function getStatusIcon(status: string) {
    switch (status) {
        case "approved":
            return <CheckCircle2 size={16} />;
        case "rejected":
            return <XCircle size={16} />;
        case "pending":
        case "under_review":
        default:
            return <Clock3 size={16} />;
    }
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

    const {
        data: enrollments = [],
        isLoading: isEnrollmentsLoading,
        isError: isEnrollmentsError,
        error: enrollmentsError,
    } = useQuery({
        queryKey: ["student-enrollments"],
        queryFn: getMyEnrollments,
    });

    const student = profile?.student;
    const displayName = getFullName(profile, user?.full_name || user?.name);

    const coursesCount = enrollments.length || getArrayCount(student?.courses_list);
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

                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <ThemeToggle />

                            <Link
                                href={routes.studentEditProfile}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <Pencil size={18} />
                                ویرایش اطلاعات
                            </Link>

                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <Home size={18} />
                                خانه
                            </Link>

                            <Link
                                href="/courses"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <BookOpen size={18} />
                                دوره‌ها
                            </Link>

                            <button
                                type="button"
                                onClick={logout}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400"
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
                            />

                            <DashboardCard
                                icon={<BookOpen size={26} />}
                                title="دوره‌های من"
                                value={coursesCount.toString()}
                            />

                            <DashboardCard
                                icon={<Heart size={26} />}
                                title="استادهای مورد علاقه"
                                value={favouriteTutorsCount.toString()}
                            />

                            <DashboardCard
                                icon={<CheckCircle2 size={26} />}
                                title="تکالیف تکمیل‌شده"
                                value={homeworkCompletedCount.toString()}
                            />
                        </div>

                        <EnrollmentSection
                            enrollments={enrollments}
                            isLoading={isEnrollmentsLoading}
                            isError={isEnrollmentsError}
                            errorMessage={
                                isEnrollmentsError
                                    ? getApiErrorMessage(enrollmentsError)
                                    : ""
                            }
                        />
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
                       }: {
    icon: ReactNode;
    title: string;
    value: string;
}) {
    return (
        <article className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 transition-colors duration-300 dark:text-emerald-300">
                {icon}
            </div>

            <h2 className="mb-2 font-black text-slate-950 transition-colors duration-300 dark:text-white">
                {title}
            </h2>

            <p className="text-2xl font-black text-slate-950 transition-colors duration-300 dark:text-white">
                {value}
            </p>
        </article>
    );
}

function EnrollmentSection({
                               enrollments,
                               isLoading,
                               isError,
                               errorMessage,
                           }: {
    enrollments: MyEnrollment[];
    isLoading: boolean;
    isError: boolean;
    errorMessage: string;
}) {
    return (
        <section className="mt-6 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-lg font-black text-slate-950 transition-colors duration-300 dark:text-white">
                        دوره‌های ثبت‌نام‌شده
                    </h2>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                        <Loader2 className="animate-spin" size={18} />
                        در حال دریافت دوره‌ها...
                    </div>
                )}
            </div>

            {isError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-7 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
                    {errorMessage}
                </div>
            ) : enrollments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center leading-7 text-slate-500 transition-colors duration-300 dark:border-slate-700 dark:text-slate-400">
                    هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید.
                </div>
            ) : (
                <div className="grid gap-3">
                    {enrollments.map((enrollment, index) => (
                        <EnrollmentCard
                            key={String(enrollment.id ?? index)}
                            enrollment={enrollment}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

function EnrollmentCard({ enrollment }: { enrollment: MyEnrollment }) {
    const status = getEnrollmentStatus(enrollment);
    const courseTitle = getEnrollmentCourseTitle(enrollment);

    return (
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="font-black text-slate-950 transition-colors duration-300 dark:text-white">
                        {courseTitle}
                    </h3>

                    {enrollment.created_at && (
                        <p className="mt-1 text-xs font-bold text-slate-400">
                            تاریخ ثبت‌نام:{" "}
                            {new Date(enrollment.created_at).toLocaleDateString("fa-IR")}
                        </p>
                    )}
                </div>

                <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${getStatusClassName(
                        status
                    )}`}
                >
                    {getStatusIcon(status)}
                    {getStatusLabel(status)}
                </span>
            </div>
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