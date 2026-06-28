"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, Users } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getApiErrorMessage } from "@/lib/apiError";
import { api } from "@/services/api";
import { initializeAccessToken } from "@/services/auth.service";

type TutorUser = {
    id?: number | string;
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    name?: string;
};

type TutorCourse = {
    id?: number | string;
    course_title?: string;
    title?: string;
    name?: string;
};

type TutorEnrollmentStudent = {
    id?: number | string;
    user?: TutorUser;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    name?: string;
    email?: string;
};

type TutorEnrollment = {
    id?: number | string;
    course?: TutorCourse;
    student?: TutorEnrollmentStudent;
    status?: string;
    payment_amount?: string | number | null;
    currency?: string;
    payment_note?: string;
    payment_proof?: string | null;
    submitted_at?: string;
    reviewed_at?: string | null;
};

type TutorDashboard = {
    enrollments?: TutorEnrollment[];
};

async function getTutorDashboard(): Promise<TutorDashboard> {
    initializeAccessToken();

    const response = await api.get<unknown>("/tutors/me/dashboard/");

    if (response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
        const data = response.data as {
            tutor?: TutorDashboard;
            enrollments?: TutorEnrollment[];
        };

        return {
            enrollments: data.enrollments ?? data.tutor?.enrollments ?? [],
        };
    }

    return { enrollments: [] };
}

function getTextValue(value: unknown) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);

    return "";
}

function getPersonName(person: unknown, fallback = "دانش‌آموز بدون نام") {
    if (!person) return fallback;

    if (typeof person === "string") return person.trim() || fallback;
    if (typeof person !== "object") return fallback;

    const record = person as Record<string, unknown>;

    const directName = getTextValue(record.full_name) || getTextValue(record.name);
    if (directName) return directName;

    const firstName = getTextValue(record.first_name);
    const lastName = getTextValue(record.last_name);
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;

    if (record.user && typeof record.user === "object") {
        const userRecord = record.user as Record<string, unknown>;

        const userDirectName = getTextValue(userRecord.full_name) || getTextValue(userRecord.name);
        if (userDirectName) return userDirectName;

        const userFirstName = getTextValue(userRecord.first_name);
        const userLastName = getTextValue(userRecord.last_name);
        const userFullName = `${userFirstName} ${userLastName}`.trim();
        if (userFullName) return userFullName;

        return getTextValue(userRecord.email) || fallback;
    }

    return getTextValue(record.email) || fallback;
}

function getStudentName(enrollment: TutorEnrollment) {
    return getPersonName(enrollment.student, "دانش‌آموز بدون نام");
}

function getCourseTitle(course?: TutorCourse | null) {
    return course?.title || course?.course_title || course?.name || "دوره بدون عنوان";
}

function getEnrollmentStatusLabel(status?: string) {
    switch (status) {
        case "draft":
            return "پیش‌نویس";
        case "pending_payment":
            return "در انتظار پرداخت";
        case "under_review":
            return "در انتظار بررسی";
        case "approved":
            return "تأیید شده";
        case "rejected":
            return "رد شده";
        case "cancelled":
            return "لغو شده";
        default:
            return "نامشخص";
    }
}

function getEnrollmentStatusClassName(status?: string) {
    switch (status) {
        case "approved":
            return "bg-emerald-400/10 text-emerald-700 dark:text-emerald-300";
        case "rejected":
            return "bg-red-400/10 text-red-700 dark:text-red-300";
        case "pending_payment":
            return "bg-blue-400/10 text-blue-700 dark:text-blue-300";
        default:
            return "bg-amber-400/10 text-amber-700 dark:text-amber-300";
    }
}

function TutorStudentsPageContent() {
    const {
        data: dashboard,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["tutor-dashboard"],
        queryFn: getTutorDashboard,
        retry: false,
    });

    const enrollments = dashboard?.enrollments ?? [];

    if (isLoading) {
        return <PageLoading text="در حال دریافت دانش‌آموزان شما..." />;
    }

    if (isError) {
        return (
            <PageError
                title="خطا در دریافت دانش‌آموزان"
                message={getApiErrorMessage(error)}
                onRetry={() => refetch()}
                isFetching={isFetching}
            />
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <section className="mx-auto max-w-6xl">
                <PageHeader
                    title="تمام دانش‌آموزان شما"
                    description="همه دانش‌آموزانی که در دوره‌های شما ثبت‌نام کرده‌اند."
                />

                {enrollments.length === 0 ? (
                    <EmptyState text="هنوز دانش‌آموزی در دوره‌های شما ثبت‌نام نکرده است." />
                ) : (
                    <div className="grid gap-4">
                        {enrollments.map((enrollment, index) => (
                            <article
                                key={String(enrollment.id ?? index)}
                                className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-950 dark:text-white">
                                            {getStudentName(enrollment)}
                                        </h2>

                                        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                                            دوره: {getCourseTitle(enrollment.course)}
                                        </p>

                                        {enrollment.submitted_at && (
                                            <p className="mt-1 text-xs font-bold text-slate-400">
                                                تاریخ ثبت‌نام: {new Date(enrollment.submitted_at).toLocaleDateString("fa-IR")}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs font-black">
                                        <span className={`rounded-full px-3 py-1 ${getEnrollmentStatusClassName(enrollment.status)}`}>
                                            {getEnrollmentStatusLabel(enrollment.status)}
                                        </span>

                                        <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            مبلغ: {enrollment.payment_amount ?? "-"} {enrollment.currency ?? ""}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function PageHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                            {title}
                        </h1>
                        <p className="mt-2 font-bold text-slate-500 dark:text-slate-400">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <ThemeToggle />
                    <Link
                        href="/dashboard/tutor"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <ArrowRight size={18} />
                        بازگشت به داشبورد
                    </Link>
                </div>
            </div>
        </div>
    );
}

function PageLoading({ text }: { text: string }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 font-black shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <Loader2 className="animate-spin text-emerald-500" size={22} />
                {text}
            </div>
        </main>
    );
}

function PageError({
                       title,
                       message,
                       onRetry,
                       isFetching,
                   }: {
    title: string;
    message: string;
    onRetry: () => void;
    isFetching: boolean;
}) {
    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
            <section className="mx-auto max-w-5xl">
                <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
                    <h1 className="text-xl font-black">{title}</h1>
                    <p className="mt-3 leading-7">{message}</p>
                    <button
                        type="button"
                        onClick={onRetry}
                        disabled={isFetching}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isFetching ? <Loader2 className="animate-spin" size={18} /> : null}
                        تلاش دوباره
                    </button>
                </div>
            </section>
        </main>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {text}
        </div>
    );
}

export default function TutorStudentsPage() {
    return (
        <ProtectedRoute>
            <TutorStudentsPageContent />
        </ProtectedRoute>
    );
}
