"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Banknote,
    BookOpen,
    GraduationCap,
    ImageIcon,
    Loader2,
    ReceiptText,
    RefreshCcw,
    UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getApiErrorMessage } from "@/lib/apiError";
import {
    enrollInCourse,
    formatTomanPrice,
    getCourseImage,
    getCourseLevel,
    getCourseTitle,
    getCourseTomanPrice,
    getCourseTutorName,
    getCourses,
    type Course,
    type EnrollInCoursePayload,
} from "@/services/courses.service";

function CoursesPageContent() {
    const queryClient = useQueryClient();

    const {
        data: courses = [],
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["courses"],
        queryFn: getCourses,
    });

    const enrollMutation = useMutation({
        mutationFn: enrollInCourse,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
            await queryClient.invalidateQueries({ queryKey: ["student-profile"] });

            toast.success("درخواست ثبت‌نام شما با وضعیت در انتظار بررسی ثبت شد.");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error));
        },
    });

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <section className="mx-auto max-w-6xl">
                <div className="mb-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/30">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>

                            <h1 className="text-2xl font-black text-slate-950 transition-colors duration-300 dark:text-white">
                                دوره‌های آموزشی
                            </h1>

                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <ThemeToggle />

                            <Link
                                href="/dashboard/student"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              خانه
                            </Link>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <CoursesLoading />
                ) : isError ? (
                    <CoursesError
                        message={getApiErrorMessage(error)}
                        onRetry={() => refetch()}
                        isFetching={isFetching}
                    />
                ) : courses.length === 0 ? (
                    <EmptyCourses />
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {courses.map((course) => (
                            <CourseCard
                                key={String(course.id)}
                                course={course}
                                isEnrolling={
                                    enrollMutation.isPending &&
                                    String(enrollMutation.variables?.courseId) === String(course.id)
                                }
                                onEnroll={(payload) => enrollMutation.mutate(payload)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function CourseCard({
                        course,
                        isEnrolling,
                        onEnroll,
                    }: {
    course: Course;
    isEnrolling: boolean;
    onEnroll: (payload: EnrollInCoursePayload) => void;
}) {
    const image = getCourseImage(course);
    const title = getCourseTitle(course);
    const tutorName = getCourseTutorName(course);
    const level = getCourseLevel(course);
    const paymentAmount = getCourseTomanPrice(course);
    const formattedPrice = formatTomanPrice(course);

    const [paymentProof, setPaymentProof] = useState<File | null>(null);

    function handleEnroll() {
        if (!paymentProof) {
            toast.error("لطفاً فایل رسید یا مدرک پرداخت را انتخاب کنید.");
            return;
        }

        onEnroll({
            courseId: course.id,
            paymentAmount,
            paymentProof,
        });
    }

    return (
        <article className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:border-slate-800/90 dark:bg-slate-900/90 dark:hover:shadow-black/30">
            <div className="relative flex h-44 items-center justify-center overflow-hidden bg-slate-200 transition-colors duration-300 dark:bg-slate-800">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-emerald-100 to-slate-200 text-emerald-700 dark:from-emerald-400/10 dark:to-slate-800 dark:text-emerald-300">
                        <ImageIcon size={32} />
                        <span className="text-sm font-black">Course Image</span>
                    </div>
                )}

                <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700 shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-slate-200">
                    {level}
                </span>
            </div>

            <div className="p-5">
                <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                        <BookOpen size={22} />
                    </div>

                    <div>
                        <h2 className="line-clamp-2 font-black leading-7 text-slate-950 dark:text-white">
                            {title}
                        </h2>

                        <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <UserRound size={15} />
                            {tutorName}
                        </p>
                    </div>
                </div>


                <div className="mt-5 grid gap-4">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                        <span className="inline-flex items-center gap-2">
                            <Banknote size={18} />
                            مبلغ پرداخت
                        </span>

                        <span>{formattedPrice}</span>
                    </div>

                    <label className="grid gap-2">
                        <span className="inline-flex items-center gap-2 text-sm font-black text-slate-600 dark:text-slate-300">
                            <ReceiptText size={18} />
                            رسید پرداخت
                        </span>

                        <input
                            type="file"
                            accept="image/png,image/jpeg,application/pdf"
                            onChange={(event) =>
                                setPaymentProof(event.target.files?.[0] ?? null)
                            }
                            className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 file:ml-3 file:rounded-xl file:border-0 file:bg-emerald-400 file:px-3 file:py-2 file:font-black file:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                        />
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400">
                            <GraduationCap size={18} />
                            {course.language ?? "English"}
                        </div>

                        <button
                            type="button"
                            onClick={handleEnroll}
                            disabled={isEnrolling}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isEnrolling && <Loader2 className="animate-spin" size={18} />}
                            ثبت‌نام در دوره
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

function CoursesLoading() {
    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="h-96 animate-pulse rounded-[2rem] border border-slate-200/80 bg-white/80 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/80"
                />
            ))}
        </div>
    );
}

function CoursesError({
                          message,
                          onRetry,
                          isFetching,
                      }: {
    message: string;
    onRetry: () => void;
    isFetching: boolean;
}) {
    return (
        <div className="rounded-[2rem] border border-red-200 bg-white/90 p-8 text-center shadow-sm dark:border-red-400/30 dark:bg-slate-900/90">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
                دریافت دوره‌ها ناموفق بود
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-8 text-slate-500 dark:text-slate-400">
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

function EmptyCourses() {
    return (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
            هنوز دوره‌ای برای نمایش وجود ندارد.
        </div>
    );
}

export default function CoursesPage() {
    return <CoursesPageContent />;
}