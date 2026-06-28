"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    FileText,
    Loader2,
    PlayCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getApiErrorMessage } from "@/lib/apiError";
import {
    getCourseDetail,
    getCourseLessons,
    type CourseSummary,
    type Lesson,
} from "@/services/lesson.service";



function getTextValue(value: unknown): string | null {
    if (typeof value === "string" && value.trim() !== "") return value;
    if (typeof value === "number") return value.toString();

    return null;
}

function getCourseTitle(course?: CourseSummary): string {
    return (
        getTextValue(course?.title) ??
        getTextValue(course?.name) ??
        "محتوای دوره"
    );
}

function getLessonTitle(lesson: Lesson, index: number): string {
    return (
        getTextValue(lesson.title) ??
        getTextValue(lesson.name) ??
        `درس شماره ${index + 1}`
    );
}

function getLessonDescription(lesson: Lesson): string {
    return (
        getTextValue(lesson.description) ??
        getTextValue(lesson.content) ??
        "توضیحی برای این درس ثبت نشده است."
    );
}

function getLessonVideoUrl(lesson: Lesson): string | null {
    return (
        getTextValue(lesson.video_url) ??
        getTextValue(lesson.video)
    );
}

function getLessonFileUrl(lesson: Lesson): string | null {
    return (
        getTextValue(lesson.file) ??
        getTextValue(lesson.document)
    );
}

function getLessonDate(lesson: Lesson): string | null {
    return (
        getTextValue(lesson.created_at) ??
        getTextValue(lesson.updated_at)
    );
}

function formatPersianDate(value: string | null): string {
    if (!value) return "ثبت نشده";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "ثبت نشده";
    }

    return date.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function StudentCourseContent() {
    const params = useParams();
    const courseId = String(params.courseId ?? "");
    const {
        data: course,
        isLoading: isCourseLoading,
    } = useQuery({
        queryKey: ["student-course-detail", courseId],
        queryFn: () => getCourseDetail(courseId),
        enabled: Boolean(courseId),
    });

    const courseTitle = isCourseLoading ? "در حال دریافت نام دوره..." : getCourseTitle(course);
    const {
        data: lessons = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["student-course-lessons", courseId],
        queryFn: () => getCourseLessons(courseId),
        enabled: Boolean(courseId),
    });

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <section className="mx-auto max-w-6xl">
                <div className="mb-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/30">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                                Course Content
                            </p>

                            <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                                {courseTitle}
                            </h1>

                            <p className="mt-2 text-sm font-bold text-slate-400">
                                محتوای آموزشی دوره
                            </p>

                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <ThemeToggle />

                            <Link
                                href="/dashboard/student/courses"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <ArrowRight size={18} />
                                بازگشت به دوره‌های من
                            </Link>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <LoadingState text="در حال دریافت درس‌های دوره..." />
                ) : isError ? (
                    <ErrorState message={getApiErrorMessage(error)} />
                ) : lessons.length === 0 ? (
                    <EmptyState text="هنوز درسی برای این دوره ثبت نشده است." />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {lessons.map((lesson, index) => (
                            <LessonCard
                                key={String(lesson.id ?? index)}
                                lesson={lesson}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function LessonCard({
                        lesson,
                        index,
                    }: {
    lesson: Lesson;
    index: number;
}) {
    const title = getLessonTitle(lesson, index);
    const description = getLessonDescription(lesson);
    const videoUrl = getLessonVideoUrl(lesson);
    const fileUrl = getLessonFileUrl(lesson);
    const dateValue = getLessonDate(lesson);

    return (
        <article className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm transition dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                    <BookOpen size={26} />
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
                    درس {index + 1}
                </span>
            </div>

            <h2 className="line-clamp-2 font-black leading-7 text-slate-950 dark:text-white">
                {title}
            </h2>

            <p className="mt-3 line-clamp-4 text-sm font-bold leading-7 text-slate-500 dark:text-slate-400">
                {description}
            </p>

            <div className="mt-5 grid gap-3">
                <InfoBox
                    icon={<CalendarDays size={16} />}
                    label="تاریخ ثبت درس"
                    value={formatPersianDate(dateValue)}
                />
            </div>

            <div className="mt-5 grid gap-3">
                {videoUrl ? (
                    <a
                        href={videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 transition hover:bg-emerald-300"
                    >
                        <PlayCircle size={17} />
                        مشاهده ویدیو
                    </a>
                ) : (
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-200 px-4 py-3 font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <PlayCircle size={17} />
                        ویدیو ندارد
                    </span>
                )}

                {fileUrl ? (
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-black text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <FileText size={17} />
                        مشاهده فایل درس
                    </a>
                ) : (
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-black text-slate-400 dark:border-slate-700">
                        <FileText size={17} />
                        فایل ندارد
                    </span>
                )}
            </div>
        </article>
    );
}

function InfoBox({
                     icon,
                     label,
                     value,
                 }: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                {icon}
                {label}
            </div>

            <p className="mt-2 line-clamp-1 font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
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

export default function StudentCoursePage() {
    return (
        <ProtectedRoute allowedRoles={["student"]}>
            <StudentCourseContent />
        </ProtectedRoute>
    );
}