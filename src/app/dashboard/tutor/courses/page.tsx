"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowRight,
    BriefcaseBusiness,
    Heart,
    Loader2,
    Pencil,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getApiErrorMessage } from "@/lib/apiError";
import { api } from "@/services/api";
import { initializeAccessToken } from "@/services/auth.service";

type TutorCourseReview = {
    id?: number | string;
    course?: TutorCourse | number | string;
    course_id?: number | string;
    course_title?: string;
    rating?: number | string | null;
    score?: number | string | null;
    satisfaction?: number | string | null;
    satisfaction_percent?: number | string | null;
    percent?: number | string | null;
};

type TutorCourse = {
    id?: number | string;
    courseId?: string;
    course_title?: string;
    title?: string;
    description?: string;
    detail?: string;
    requirements?: string;
    materials?: string;
    price_per_hour?: string | number;
    price_per_dollar?: string | number;
    price_per_toman?: string | number;
    language?: string;
    level?: string;
    schedule_day?: string;
    schedule_start?: string;
    schedule_end?: string;
    capacity?: number;
    length?: number;
    course_duration?: number;
    average_rating?: number | string | null;
    avg_rating?: number | string | null;
    rating?: number | string | null;
    satisfaction?: number | string | null;
    satisfaction_percent?: number | string | null;
    reviews?: TutorCourseReview[];
};

type TutorDashboard = {
    courses?: TutorCourse[];
    reviews?: TutorCourseReview[];
};

type CreateCoursePayload = {
    title: string;
    description: string;
    detail: string;
    requirements: string;
    materials: string;
    price_per_hour: string;
    price_per_dollar: string;
    price_per_toman: string;
    language: string;
    level: string;
    schedule_day: string;
    schedule_start: string;
    schedule_end: string;
    capacity: number;
    length: number;
    course_duration: number;
};

async function getTutorDashboard(): Promise<TutorDashboard> {
    initializeAccessToken();

    const response = await api.get<unknown>("/tutors/me/dashboard/");

    if (response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
        const data = response.data as {
            tutor?: TutorDashboard;
            courses?: TutorCourse[];
            reviews?: TutorCourseReview[];
        };

        return {
            courses: data.courses ?? data.tutor?.courses ?? [],
            reviews: data.reviews ?? data.tutor?.reviews ?? [],
        };
    }

    return {
        courses: [],
        reviews: [],
    };
}

async function updateCourse(courseId: number | string, payload: CreateCoursePayload) {
    initializeAccessToken();

    return api.patch(`/courses/${courseId}/`, payload);
}

async function deleteCourse(courseId: number | string) {
    initializeAccessToken();

    return api.delete(`/courses/${courseId}/`);
}

function getCourseTitle(course?: TutorCourse | number | string | null) {
    if (typeof course === "string" || typeof course === "number") {
        return `دوره ${course}`;
    }

    return course?.title || course?.course_title || "دوره بدون عنوان";
}

function getCourseId(course?: TutorCourse | number | string | null) {
    if (typeof course === "string" || typeof course === "number") {
        return String(course);
    }

    return course?.id ? String(course.id) : "";
}

function getReviewCourseId(review: TutorCourseReview) {
    if (review.course_id) return String(review.course_id);

    if (typeof review.course === "string" || typeof review.course === "number") {
        return String(review.course);
    }

    if (review.course && typeof review.course === "object" && review.course.id) {
        return String(review.course.id);
    }

    return "";
}

function getReviewCourseTitle(review: TutorCourseReview) {
    if (review.course_title) return review.course_title;

    if (review.course && typeof review.course === "object") {
        return getCourseTitle(review.course);
    }

    if (review.course) return `دوره ${review.course}`;

    return "دوره بدون عنوان";
}

function getNumberValue(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }

    return null;
}

function normalizePercent(value: unknown) {
    const numberValue = getNumberValue(value);

    if (numberValue === null) return null;

    if (numberValue <= 5) {
        return Math.round((numberValue / 5) * 100);
    }

    return Math.round(Math.min(numberValue, 100));
}

function getReviewRatingPercent(review: TutorCourseReview) {
    return (
        normalizePercent(review.satisfaction_percent) ??
        normalizePercent(review.percent) ??
        normalizePercent(review.satisfaction) ??
        normalizePercent(review.rating) ??
        normalizePercent(review.score)
    );
}

function getReviewsFromDashboard(dashboard?: TutorDashboard) {
    const directReviews = dashboard?.reviews ?? [];
    const courseReviews = (dashboard?.courses ?? []).flatMap((course) => course.reviews ?? []);

    return [...directReviews, ...courseReviews];
}

function getCourseReviews(course: TutorCourse, allReviews: TutorCourseReview[]) {
    const courseId = getCourseId(course);

    return allReviews.filter((review) => {
        const reviewCourseId = getReviewCourseId(review);

        if (courseId && reviewCourseId) return courseId === reviewCourseId;

        return getReviewCourseTitle(review) === getCourseTitle(course);
    });
}

function getCourseSatisfactionPercent(course: TutorCourse, allReviews: TutorCourseReview[]) {
    const directPercent =
        normalizePercent(course.satisfaction_percent) ??
        normalizePercent(course.satisfaction) ??
        normalizePercent(course.average_rating) ??
        normalizePercent(course.avg_rating) ??
        normalizePercent(course.rating);

    if (directPercent !== null) return directPercent;

    const ratings = getCourseReviews(course, allReviews)
        .map(getReviewRatingPercent)
        .filter((item): item is number => item !== null);

    if (ratings.length === 0) return null;

    const average = ratings.reduce((sum, item) => sum + item, 0) / ratings.length;

    return Math.round(average);
}

function TutorCoursesPageContent() {
    const queryClient = useQueryClient();
    const [editingCourse, setEditingCourse] = useState<TutorCourse | null>(null);

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

    const courses = dashboard?.courses ?? [];
    const reviews = getReviewsFromDashboard(dashboard);

    const deleteCourseMutation = useMutation({
        mutationFn: deleteCourse,
        onSuccess: async () => {
            toast.success("دوره حذف شد.");
            await queryClient.invalidateQueries({ queryKey: ["tutor-dashboard"] });
        },
        onError: (mutationError) => {
            toast.error(getApiErrorMessage(mutationError));
        },
    });

    function handleEditCourse(course: TutorCourse) {
        setEditingCourse(course);

        setTimeout(() => {
            document.getElementById("edit-course-form")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 0);
    }

    if (isLoading) {
        return <PageLoading text="در حال دریافت دوره‌های شما..." />;
    }

    if (isError) {
        return (
            <PageError
                title="خطا در دریافت دوره‌ها"
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
                    title="تمام دوره‌های شما"
                    description="همه دوره‌های ثبت‌شده شما در این صفحه نمایش داده می‌شود."
                    icon={<BriefcaseBusiness size={24} />}
                />

                {editingCourse && (
                    <CourseEditForm
                        key={String(editingCourse.id)}
                        editingCourse={editingCourse}
                        onEditFinished={() => setEditingCourse(null)}
                    />
                )}

                {courses.length === 0 ? (
                    <EmptyState text="هنوز دوره‌ای برای شما ثبت نشده است." />
                ) : (
                    <div className="grid gap-4">
                        {courses.map((course, index) => {
                            const satisfactionPercent = getCourseSatisfactionPercent(course, reviews);

                            return (
                                <article
                                    key={String(course.id ?? index)}
                                    className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                                <h2 className="text-lg font-black text-slate-950 dark:text-white">
                                                    {getCourseTitle(course)}
                                                </h2>

                                                <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-black text-rose-600 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
                                                    <Heart size={15} className="fill-current" />
                                                    {satisfactionPercent === null
                                                        ? "بدون امتیاز"
                                                        : `${satisfactionPercent}% رضایت`}
                                                </div>
                                            </div>

                                            <p className="leading-7 text-slate-500 dark:text-slate-400">
                                                {course.description || "توضیحی برای این دوره ثبت نشده است."}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                                                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
                                                    {course.language || "زبان نامشخص"}
                                                </span>

                                                <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    سطح: {course.level || "نامشخص"}
                                                </span>

                                                <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    {course.schedule_day || "روز نامشخص"}، {course.schedule_start || "--"} تا {course.schedule_end || "--"}
                                                </span>

                                                <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    ظرفیت: {course.capacity ?? "نامشخص"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEditCourse(course)}
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 font-black text-blue-600 transition hover:bg-blue-100 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300"
                                            >
                                                <Pencil size={16} />
                                                ویرایش
                                            </button>

                                            {course.id && (
                                                <button
                                                    type="button"
                                                    onClick={() => deleteCourseMutation.mutate(course.id!)}
                                                    disabled={deleteCourseMutation.isPending}
                                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300"
                                                >
                                                    {deleteCourseMutation.isPending ? (
                                                        <Loader2 className="animate-spin" size={16} />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                    حذف
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

function CourseEditForm({
                            editingCourse,
                            onEditFinished,
                        }: {
    editingCourse: TutorCourse;
    onEditFinished: () => void;
}) {
    const queryClient = useQueryClient();

    const [title, setTitle] = useState(editingCourse.title ?? editingCourse.course_title ?? "");
    const [language, setLanguage] = useState(editingCourse.language ?? "English");
    const [description, setDescription] = useState(editingCourse.description ?? "");
    const [level, setLevel] = useState(editingCourse.level ?? "B1");
    const [scheduleDay, setScheduleDay] = useState(editingCourse.schedule_day ?? "Saturday");
    const [scheduleStart, setScheduleStart] = useState(editingCourse.schedule_start ?? "10:00");
    const [scheduleEnd, setScheduleEnd] = useState(editingCourse.schedule_end ?? "11:00");
    const [capacity, setCapacity] = useState(String(editingCourse.capacity ?? "10"));
    const [pricePerHour, setPricePerHour] = useState(
        String(editingCourse.price_per_hour ?? editingCourse.price_per_toman ?? "100000")
    );

    const updateCourseMutation = useMutation({
        mutationFn: (payload: CreateCoursePayload) => updateCourse(editingCourse.id!, payload),
        onSuccess: async () => {
            toast.success("تغییرات دوره ذخیره شد.");
            await queryClient.invalidateQueries({ queryKey: ["tutor-dashboard"] });
            onEditFinished();
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error));
        },
    });

    function handleSubmit() {
        if (!editingCourse.id) {
            toast.error("شناسه دوره برای ویرایش پیدا نشد.");
            return;
        }

        if (!title.trim()) {
            toast.error("عنوان دوره را وارد کنید.");
            return;
        }

        const parsedCapacity = Number(capacity);

        if (!parsedCapacity || parsedCapacity <= 0) {
            toast.error("ظرفیت دوره باید بیشتر از صفر باشد.");
            return;
        }

        updateCourseMutation.mutate({
            title,
            description: description || "توضیحی برای این دوره ثبت نشده است.",
            detail: description || "جزئیات دوره ثبت نشده است.",
            requirements: "نیازمندی خاصی ثبت نشده است.",
            materials: "فایل‌ها و منابع آموزشی دوره",
            price_per_hour: pricePerHour || "100000",
            price_per_dollar: pricePerHour || "100000",
            price_per_toman: pricePerHour || "100000",
            language,
            level,
            schedule_day: scheduleDay,
            schedule_start: scheduleStart,
            schedule_end: scheduleEnd,
            capacity: parsedCapacity,
            length: Number(editingCourse.length ?? 20),
            course_duration: Number(editingCourse.course_duration ?? 60),
        });
    }

    return (
        <section
            id="edit-course-form"
            className="mb-6 scroll-mt-8 rounded-[2rem] border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-400/30 dark:bg-blue-400/10"
        >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-950 dark:text-white">
                        ویرایش دوره
                    </h2>
                    <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                        تغییرات را انجام بده و روی ذخیره تغییرات بزن.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onEditFinished}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    <X size={16} />
                    بستن
                </button>
            </div>

            <div className="grid gap-4">
                <FormField label="عنوان دوره">
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                </FormField>

                <FormField label="توضیحات دوره">
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold leading-7 text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                </FormField>

                <div className="grid gap-4 md:grid-cols-3">
                    <FormField label="زبان">
                        <input
                            value={language}
                            onChange={(event) => setLanguage(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </FormField>

                    <FormField label="سطح">
                        <input
                            value={level}
                            onChange={(event) => setLevel(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </FormField>

                    <FormField label="روز برگزاری">
                        <input
                            value={scheduleDay}
                            onChange={(event) => setScheduleDay(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </FormField>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <FormField label="شروع کلاس">
                        <input
                            type="time"
                            value={scheduleStart}
                            onChange={(event) => setScheduleStart(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </FormField>

                    <FormField label="پایان کلاس">
                        <input
                            type="time"
                            value={scheduleEnd}
                            onChange={(event) => setScheduleEnd(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </FormField>

                    <FormField label="ظرفیت">
                        <input
                            type="number"
                            min="1"
                            value={capacity}
                            onChange={(event) => setCapacity(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </FormField>

                    <FormField label="قیمت دوره به تومان">
                        <input
                            type="number"
                            min="1"
                            value={pricePerHour}
                            onChange={(event) => setPricePerHour(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </FormField>
                </div>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={updateCourseMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {updateCourseMutation.isPending ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <Pencil size={18} />
                    )}
                    ذخیره تغییرات
                </button>
            </div>
        </section>
    );
}

function PageHeader({
                        title,
                        description,
                        icon,
                    }: {
    title: string;
    description: string;
    icon: ReactNode;
}) {
    return (
        <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                        {icon}
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

function FormField({
                       label,
                       children,
                   }: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                {label}
            </span>
            {children}
        </label>
    );
}

export default function TutorCoursesPage() {
    return (
        <ProtectedRoute>
            <TutorCoursesPageContent />
        </ProtectedRoute>
    );
}
