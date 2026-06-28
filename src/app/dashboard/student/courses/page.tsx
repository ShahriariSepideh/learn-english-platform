"use client";

import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock3,
    Loader2,
    XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getApiErrorMessage } from "@/lib/apiError";
import {
    getEnrollmentCourseTitle,
    getEnrollmentStatus,
    getMyEnrollments,
    type MyEnrollment,
} from "@/services/enrollment.service";

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
        case "pending_payment":
            return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300";
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
        default:
            return <Clock3 size={16} />;
    }
}

function getCourseId(enrollment: MyEnrollment): string | null {
    const item = enrollment as unknown as Record<string, unknown>;
    const course = item.course;

    if (typeof item.course_id === "string" || typeof item.course_id === "number") {
        return String(item.course_id);
    }

    if (typeof course === "string" || typeof course === "number") {
        return String(course);
    }

    if (typeof course === "object" && course !== null) {
        const courseRecord = course as Record<string, unknown>;

        if (typeof courseRecord.id === "string" || typeof courseRecord.id === "number") {
            return String(courseRecord.id);
        }
    }

    return null;
}

function StudentCoursesContent() {
    const {
        data: enrollments = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["student-enrollments"],
        queryFn: getMyEnrollments,
    });

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <section className="mx-auto max-w-6xl">
                <div className="mb-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/30">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                                My Courses
                            </p>

                            <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                              دوره های من
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <ThemeToggle />

                            <Link
                                href="/dashboard/student"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <ArrowRight size={18} />
                                بازگشت به داشبورد
                            </Link>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <LoadingState text="در حال دریافت دوره‌ها..." />
                ) : isError ? (
                    <ErrorState message={getApiErrorMessage(error)} />
                ) : enrollments.length === 0 ? (
                    <EmptyState text="هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید." />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {enrollments.map((enrollment, index) => (
                            <CourseCard
                                key={String(enrollment.id ?? index)}
                                enrollment={enrollment}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function CourseCard({ enrollment }: { enrollment: MyEnrollment }) {
    const status = getEnrollmentStatus(enrollment);
    const courseTitle = getEnrollmentCourseTitle(enrollment);
    const courseId = getCourseId(enrollment);
    const canEnterCourse = status === "approved" && courseId;

    return (
        <article className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm transition dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                <BookOpen size={26} />
            </div>

            <h2 className="line-clamp-2 font-black text-slate-950 dark:text-white">
                {courseTitle}
            </h2>

            {enrollment.created_at && (
                <p className="mt-3 text-xs font-bold text-slate-400">
                    تاریخ ثبت‌نام:{" "}
                    {new Date(enrollment.created_at).toLocaleDateString("fa-IR")}
                </p>
            )}

            <span
                className={`mt-4 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${getStatusClassName(
                    status
                )}`}
            >
                {getStatusIcon(status)}
                {getStatusLabel(status)}
            </span>

            {canEnterCourse && (
                <Link
                    href={`/dashboard/student/courses/${courseId}`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 transition hover:bg-emerald-300"
                >
                    ورود به دوره
                </Link>
            )}
        </article>
    );
}

function LoadingState({ text }: { text: string }) {
    return (
        <div className="flex min-h-64 items-center justify-center rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 text-slate-500 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90 dark:text-slate-400">
            <div className="flex items-center gap-3 font-bold">
                <Loader2 className="animate-spin" size={22} />
                {text}
            </div>
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm font-bold leading-7 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
            {message}
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-10 text-center leading-7 text-slate-500 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-400">
            {text}
        </div>
    );
}

export default function StudentCoursesPage() {
    return (
        <ProtectedRoute allowedRoles={["student"]}>
            <StudentCoursesContent />
        </ProtectedRoute>
    );
}