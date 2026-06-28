"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    BookOpen,
    BriefcaseBusiness,
    Clock3,
    Heart,
    Loader2,
    LogOut,
    MessageSquare,
    Pencil,
    PlusCircle,
    RefreshCcw,
    Trash2,
    UserRound,
    Users,
    Video,
} from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getApiErrorMessage } from "@/lib/apiError";
import { api } from "@/services/api";
import { initializeAccessToken, logoutUser } from "@/services/auth.service";

type TutorUser = {
    id?: number | string;
    email?: string;
    first_name?: string;
    last_name?: string;
};

type TutorCourseReview = {
    id?: number | string;
    course?: TutorCourse | number | string;
    course_id?: number | string;
    course_title?: string;
    student?: TutorEnrollmentStudent | TutorUser | string | null;
    rating?: number | string | null;
    score?: number | string | null;
    satisfaction?: number | string | null;
    satisfaction_percent?: number | string | null;
    percent?: number | string | null;
    comment?: string | null;
    text?: string | null;
    description?: string | null;
    created_at?: string;
    submitted_at?: string;
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
    course_type?: string;
    schedule_day?: string;
    schedule_start?: string;
    schedule_end?: string;
    capacity?: number;
    active_students?: number;
    length?: number;
    course_duration?: number;
    average_rating?: number | string | null;
    avg_rating?: number | string | null;
    rating?: number | string | null;
    satisfaction?: number | string | null;
    satisfaction_percent?: number | string | null;
    reviews?: TutorCourseReview[];
};

type TutorEnrollmentStudent = {
    id?: number | string;
    user?: TutorUser;
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
    id?: number | string;
    user?: TutorUser;
    profile_picture?: string | null;
    country?: string;
    subjects?: string[];
    languages_spoken?: unknown;
    bio?: string;
    teaching_style?: string;
    expectation?: string;
    description?: string;
    intro_video_file?: string | null;
    intro_video_url?: string;
    certificates?: unknown[];
    educations?: unknown[];
    experiences?: unknown[];
    courses?: TutorCourse[];
    enrollments?: TutorEnrollment[];
    reviews?: TutorCourseReview[];
    is_approved?: boolean | string | number;
    approved_is?: boolean | string | number;
    approved?: boolean | string | number;
    status?: string;
    admin_approved?: boolean | string | number;
    profile_approved?: boolean | string | number;
    tutor_approved?: boolean | string | number;

};

type CreateTutorProfilePayload = {
    country: string;
    phoneNumber: string;
    bio: string;
    teachingStyle: string;
    education: string;
    experience: string;
    language: string;
    languageLevel: string;
    subject: string;
    profilePicture: File | null;
    introVideoFile: File | null;
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

async function createTutorProfile(payload: CreateTutorProfilePayload) {
    initializeAccessToken();

    const formData = new FormData();

    formData.append("country", payload.country);
    formData.append("phone_number", payload.phoneNumber);
    formData.append("bio", payload.bio);
    formData.append("teaching_style", payload.teachingStyle);

    if (payload.education.trim()) {
        formData.append("educations", JSON.stringify([payload.education.trim()]));
    }

    if (payload.experience.trim()) {
        formData.append("experiences", JSON.stringify([payload.experience.trim()]));
    }

    formData.append(
        "languages_spoken",
        JSON.stringify([
            {
                language: payload.language,
                level: payload.languageLevel,
            },
        ])
    );

    formData.append("subjects", JSON.stringify([payload.subject]));

    if (payload.profilePicture) {
        formData.append("profile_picture", payload.profilePicture, payload.profilePicture.name);
    }

    if (payload.introVideoFile) {
        formData.append("intro_video_file", payload.introVideoFile, payload.introVideoFile.name);
    }

    return api.post("/create-tutor-profile/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

async function createCourse(payload: CreateCoursePayload) {
    initializeAccessToken();

    return api.post("/courses/", {
        courseId: `cr-${Date.now()}`,
        ...payload,
    });
}

async function updateCourse(courseId: number | string, payload: CreateCoursePayload) {
    initializeAccessToken();

    return api.patch(`/courses/${courseId}/`, payload);
}

async function deleteCourse(courseId: number | string) {
    initializeAccessToken();

    return api.delete(`/courses/${courseId}/`);
}
async function getTutorDashboard(): Promise<TutorDashboard | null> {
    initializeAccessToken();

    try {
        const dashboardResponse = await api.get<unknown>("/tutors/me/dashboard/");

        let tutor: TutorDashboard | null = null;

        if (Array.isArray(dashboardResponse.data)) {
            tutor = dashboardResponse.data[0] ?? null;
        } else if (typeof dashboardResponse.data === "object" && dashboardResponse.data !== null) {
            const data = dashboardResponse.data as {
                tutor?: TutorDashboard;
                courses?: TutorCourse[];
                enrollments?: TutorEnrollment[];
                reviews?: TutorCourseReview[];
                is_approved?: boolean | string | number;
                approved?: boolean | string | number;
                approved_is?: boolean | string | number;
                admin_approved?: boolean | string | number;
                profile_approved?: boolean | string | number;
                tutor_approved?: boolean | string | number;
                status?: string;
            } & Record<string, unknown>;

            if (data.tutor) {
                const tutorRecord = data.tutor as TutorDashboard & Record<string, unknown>;

                const approvalFlag = resolveApprovalFlag(
                    tutorRecord.approved_is,
                    data.approved_is,
                    tutorRecord.is_approved,
                    data.is_approved,
                    tutorRecord.approved,
                    data.approved,
                    tutorRecord.admin_approved,
                    data.admin_approved,
                    tutorRecord.profile_approved,
                    data.profile_approved,
                    tutorRecord.tutor_approved,
                    data.tutor_approved
                );

                tutor = {
                    ...data.tutor,
                    courses: data.courses ?? data.tutor.courses ?? [],
                    enrollments: data.enrollments ?? data.tutor.enrollments ?? [],
                    reviews: data.reviews ?? data.tutor.reviews ?? [],
                    is_approved: approvalFlag,
                    approved_is: approvalFlag,
                    approved: approvalFlag,
                    admin_approved: resolveApprovalFlag(tutorRecord.admin_approved, data.admin_approved),
                    profile_approved: resolveApprovalFlag(tutorRecord.profile_approved, data.profile_approved),
                    tutor_approved: resolveApprovalFlag(tutorRecord.tutor_approved, data.tutor_approved),
                    status: data.tutor.status ?? data.status,
                };
            } else {
                const dataRecord = data as TutorDashboard & Record<string, unknown>;

                const approvalFlag = resolveApprovalFlag(
                    dataRecord.approved_is,
                    dataRecord.is_approved,
                    dataRecord.approved,
                    dataRecord.admin_approved,
                    dataRecord.profile_approved,
                    dataRecord.tutor_approved
                );

                tutor = {
                    ...dataRecord,
                    is_approved: approvalFlag,
                    approved_is: approvalFlag,
                    approved: approvalFlag,
                };
            }
        }

        if (!tutor) return null;

        return tutor;
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
            return null;
        }

        throw error;
    }
}
function getTutorName(tutor: TutorDashboard | null) {
    if (!tutor) return "استاد";

    const firstName = tutor.user?.first_name ?? "";
    const lastName = tutor.user?.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || tutor.user?.email || "استاد";
}

function getTutorEmail(tutor: TutorDashboard | null) {
    return tutor?.user?.email || "ایمیل ثبت نشده";
}

function isTruthyApproval(value: unknown) {
    if (value === true) return true;
    if (value === 1) return true;

    if (typeof value === "string") {
        const normalized = value.toLowerCase().trim();

        return (
            normalized === "true" ||
            normalized === "1" ||
            normalized === "yes" ||
            normalized === "approved"
        );
    }

    return false;
}


function resolveApprovalFlag(...values: unknown[]) {
    return values.some(isTruthyApproval);
}

function isTutorApproved(tutor: TutorDashboard | null) {
    if (!tutor) return false;

    const tutorRecord = tutor as Record<string, unknown>;
    const userRecord =
        tutor.user && typeof tutor.user === "object"
            ? (tutor.user as Record<string, unknown>)
            : {};

    if (
        resolveApprovalFlag(
            tutorRecord.approved_is,
            tutorRecord.is_approved,
            tutorRecord.approved,
            tutorRecord.admin_approved,
            tutorRecord.profile_approved,
            tutorRecord.tutor_approved,
            userRecord.approved_is,
            userRecord.is_approved,
            userRecord.approved,
            userRecord.admin_approved,
            userRecord.profile_approved,
            userRecord.tutor_approved
        )
    ) {
        return true;
    }

    const status = String(
        tutorRecord.status ??
        tutorRecord.approval_status ??
        tutorRecord.profile_status ??
        ""
    )
        .toLowerCase()
        .trim();

    return status === "approved";
}

function getLanguagesText(value: unknown) {
    if (!value) return "ثبت نشده";

    if (Array.isArray(value)) {
        const items = value
            .map((item) => {
                if (typeof item === "string") return item;

                if (typeof item === "object" && item !== null) {
                    const record = item as Record<string, unknown>;
                    const language = String(record.language ?? "");
                    const level = String(record.level ?? "");

                    if (language && level) return `${language} (${level})`;
                    return language || level;
                }

                return "";
            })
            .filter(Boolean);

        return items.length > 0 ? items.join("، ") : "ثبت نشده";
    }

    if (typeof value === "object" && value !== null) {
        const items = Object.entries(value as Record<string, string>).map(
            ([language, level]) => `${language} (${level})`
        );

        return items.length > 0 ? items.join("، ") : "ثبت نشده";
    }

    return "ثبت نشده";
}

function getTextValue(value: unknown) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);

    return "";
}

function getListText(value: unknown) {
    if (!value) return "ثبت نشده";

    if (typeof value === "string") {
        return value.trim() || "ثبت نشده";
    }

    if (Array.isArray(value)) {
        const items = value
            .map((item) => {
                if (typeof item === "string") return item;

                if (typeof item === "object" && item !== null) {
                    const record = item as Record<string, unknown>;

                    return (
                        String(record.title ?? "").trim() ||
                        String(record.name ?? "").trim() ||
                        String(record.degree ?? "").trim() ||
                        String(record.description ?? "").trim() ||
                        String(record.organization ?? "").trim() ||
                        String(record.company ?? "").trim()
                    );
                }

                return "";
            })
            .filter(Boolean);

        return items.length > 0 ? items.join("، ") : "ثبت نشده";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return "ثبت نشده";
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

function getPersonName(person: unknown, fallback = "دانش‌آموز بدون نام") {
    if (!person) return fallback;

    if (typeof person === "string") {
        return person.trim() || fallback;
    }

    if (typeof person !== "object") {
        return fallback;
    }

    const record = person as Record<string, unknown>;

    const directName =
        getTextValue(record.full_name) ||
        getTextValue(record.name);

    if (directName) return directName;

    const firstName = getTextValue(record.first_name);
    const lastName = getTextValue(record.last_name);
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) return fullName;

    if (record.user && typeof record.user === "object") {
        const userRecord = record.user as Record<string, unknown>;

        const userDirectName =
            getTextValue(userRecord.full_name) ||
            getTextValue(userRecord.name);

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

function getReviewStudentName(review: TutorCourseReview) {
    return getPersonName(review.student, "دانش‌آموز");
}

function getReviewText(review: TutorCourseReview) {
    return (
        getTextValue(review.comment) ||
        getTextValue(review.text) ||
        getTextValue(review.description) ||
        "متنی برای این نظر ثبت نشده است."
    );
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

    if (review.course) {
        return `دوره ${review.course}`;
    }

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

function getReviewsFromTutor(tutor: TutorDashboard | null | undefined) {
    const directReviews = tutor?.reviews ?? [];
    const courseReviews = (tutor?.courses ?? []).flatMap((course) => course.reviews ?? []);

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

function getLatestItems<T>(items: T[], limit = 3) {
    return items.slice(-limit).reverse();
}

export default function TutorDashboardPage() {
    return (
        <ProtectedRoute>
            <TutorDashboardContent />
        </ProtectedRoute>
    );
}

function TutorDashboardContent() {
    const [editingCourse, setEditingCourse] = useState<TutorCourse | null>(null);

    const {
        data: tutor,
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

    async function handleLogout() {
        await logoutUser();
        window.location.href = "/login";
    }

    function scrollToSection(targetId: string) {
        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
            toast.error("بخش مورد نظر پیدا نشد.");
            return;
        }

        targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 font-black shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <Loader2 className="animate-spin text-emerald-500" size={22} />
                    در حال دریافت داشبورد استاد...
                </div>
            </main>
        );
    }

    if (isError) {
        return (
            <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
                <section className="mx-auto max-w-5xl">
                    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
                        <h1 className="text-xl font-black">خطا در دریافت داشبورد استاد</h1>
                        <p className="mt-3 leading-7">{getApiErrorMessage(error)}</p>

                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isFetching ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
                            تلاش دوباره
                        </button>
                    </div>
                </section>
            </main>
        );
    }

    if (tutor && !isTutorApproved(tutor)) {
        return (
            <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
                <section className="mx-auto max-w-3xl">
                    <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
                        <ThemeToggle />

                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            خانه
                        </Link>


                    </div>

                    <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center text-amber-900 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-400/20 text-amber-700 dark:text-amber-300">
                            <Clock3 size={30} />
                        </div>

                        <h1 className="text-2xl font-black">
                            حساب استاد شما هنوز تأیید نشده است
                        </h1>

                        <p className="mx-auto mt-4 max-w-xl leading-8">
                            پروفایل شما ثبت شده، اما تا زمانی که ادمین آن را تأیید نکند، داشبورد کامل استاد فعال نمی‌شود.
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    const name = getTutorName(tutor ?? null);
    const email = getTutorEmail(tutor ?? null);
    const coursesCount = tutor?.courses?.length ?? 0;
    const enrollments = tutor?.enrollments ?? [];
    const reviews = getReviewsFromTutor(tutor);

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <section className="mx-auto max-w-6xl">
                <div className="mb-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/30">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                                {tutor?.profile_picture ? (
                                    <img
                                        src={tutor.profile_picture}
                                        alt={name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserRound size={30} />
                                )}
                            </div>

                            <div>
                                <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                                    داشبورد استاد
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <p className="font-bold text-slate-500 dark:text-slate-400">
                                        خوش آمدید، {name}
                                    </p>

                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
                                        پروفایل تأیید شده
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <ThemeToggle />

                            {tutor && isTutorApproved(tutor) && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => scrollToSection("create-course")}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 font-black text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
                                    >
                                        <PlusCircle size={18} />
                                        ایجاد دوره
                                    </button>
                                </>
                            )}

                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                خانه
                            </Link>



                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400"
                            >
                                <LogOut size={18} />
                                خروج
                            </button>
                        </div>
                    </div>
                </div>

                {!tutor ? (
                    <TutorCreateProfileForm />
                ) : (
                    <>
                        <div className="mb-6 grid gap-4 md:grid-cols-3">
                            <StatCard
                                icon={<BookOpen size={22} />}
                                label="دوره‌ها"
                                value={`${coursesCount}`}
                            />

                            <StatCard
                                icon={<Users size={22} />}
                                label="ثبت‌نام‌ها"
                                value={`${enrollments.length}`}
                            />

                            <StatCard
                                icon={<MessageSquare size={22} />}
                                label="نظرات"
                                value={`${reviews.length}`}
                            />
                        </div>

                        <section className="mb-6 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                            <h2 className="text-xl font-black">داشبورد کامل استاد فعال شد</h2>

                            <p className="mt-3 leading-7">
                                پروفایل شما توسط ادمین تأیید شده است. اکنون می‌توانید دوره ایجاد کنید،
                                دوره‌های خودتان را مدیریت کنید و دانش‌آموزان ثبت‌نام‌شده را ببینید.
                            </p>
                        </section>

                        <div className="mb-6 grid gap-6">
                            <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
                                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                                    اطلاعات استاد
                                </h2>

                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    <InfoRow label="نام و نام خانوادگی" value={name} />
                                    <InfoRow label="ایمیل" value={email} />
                                    <InfoRow label="کشور" value={tutor.country || "ثبت نشده"} />
                                    <InfoRow label="زبان تدریس" value={getLanguagesText(tutor.languages_spoken)} />
                                    <InfoRow label="موضوعات" value={tutor.subjects?.join("، ") || "ثبت نشده"} />
                                    <InfoRow label="بیوگرافی" value={tutor.bio || "ثبت نشده"} />
                                    <InfoRow label="سوابق" value={getListText(tutor.experiences)} />
                                    <InfoRow label="تحصیلات" value={getListText(tutor.educations ?? tutor.certificates)} />
                                </div>

                                {(tutor.intro_video_file || tutor.intro_video_url) && (
                                    <a
                                        href={tutor.intro_video_file || tutor.intro_video_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300"
                                    >
                                        <Video size={18} />
                                        مشاهده ویدئوی معرفی
                                    </a>
                                )}
                            </section>
                        </div>

                        <div className="grid gap-6">
                            <TutorCreateCourseForm
                                key={String(editingCourse?.id ?? "new-course")}
                                editingCourse={editingCourse}
                                onEditFinished={() => setEditingCourse(null)}
                            />

                            <TutorCoursesManagement
                                courses={tutor.courses ?? []}
                                reviews={reviews}
                                onEditCourse={(course) => {
                                    setEditingCourse(course);
                                    setTimeout(() => scrollToSection("create-course"), 0);
                                }}
                            />

                            <TutorStudentsList enrollments={enrollments} />

                            <TutorCourseReviews reviews={reviews} />
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

function StatCard({
                      icon,
                      label,
                      value,
                      badgeClassName,
                      badgeIcon,
                  }: {
    icon: ReactNode;
    label: string;
    value: string;
    badgeClassName?: string;
    badgeIcon?: ReactNode;
}) {
    return (
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                {icon}
            </div>

            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>

            {badgeClassName ? (
                <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-black ${badgeClassName}`}>
                    {badgeIcon}
                    {value}
                </div>
            ) : (
                <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500">{label}</p>
            <p className="mt-2 leading-7 text-slate-700 dark:text-slate-300">{value}</p>
        </div>
    );
}

function TutorCreateCourseForm({
                                   editingCourse,
                                   onEditFinished,
                               }: {
    editingCourse: TutorCourse | null;
    onEditFinished: () => void;
}) {
    const queryClient = useQueryClient();

    const [title, setTitle] = useState(
        editingCourse?.title ?? editingCourse?.course_title ?? ""
    );
    const [description, setDescription] = useState(editingCourse?.description ?? "");
    const [language, setLanguage] = useState(editingCourse?.language ?? "English");
    const [level, setLevel] = useState(editingCourse?.level ?? "B1");
    const [scheduleDay, setScheduleDay] = useState(
        editingCourse?.schedule_day ?? "Saturday"
    );
    const [scheduleStart, setScheduleStart] = useState(
        editingCourse?.schedule_start ?? "10:00"
    );
    const [scheduleEnd, setScheduleEnd] = useState(
        editingCourse?.schedule_end ?? "11:00"
    );
    const [capacity, setCapacity] = useState(String(editingCourse?.capacity ?? "10"));
    const [pricePerHour, setPricePerHour] = useState(
        String(editingCourse?.price_per_hour ?? editingCourse?.price_per_toman ?? "100000")
    );

    const isEditMode = Boolean(editingCourse?.id);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setLanguage("English");
        setLevel("B1");
        setScheduleDay("Saturday");
        setScheduleStart("10:00");
        setScheduleEnd("11:00");
        setCapacity("10");
        setPricePerHour("100000");
    };

    const createCourseMutation = useMutation({
        mutationFn: createCourse,
        onSuccess: async () => {
            toast.success("دوره با موفقیت ایجاد شد.");
            resetForm();
            await queryClient.invalidateQueries({ queryKey: ["tutor-dashboard"] });
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error));
        },
    });

    const updateCourseMutation = useMutation({
        mutationFn: ({ courseId, payload }: { courseId: number | string; payload: CreateCoursePayload }) =>
            updateCourse(courseId, payload),
        onSuccess: async () => {
            toast.success("تغییرات دوره با موفقیت ذخیره شد.");
            onEditFinished();
            await queryClient.invalidateQueries({ queryKey: ["tutor-dashboard"] });
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error));
        },
    });

    const isPending = createCourseMutation.isPending || updateCourseMutation.isPending;

    function handleCancelEdit() {
        onEditFinished();
        resetForm();
    }

    function handleSubmit() {
        if (!title.trim()) {
            toast.error("عنوان دوره را وارد کنید.");
            return;
        }

        if (!language.trim() || !level.trim() || !scheduleDay.trim()) {
            toast.error("زبان، سطح و روز برگزاری را وارد کنید.");
            return;
        }

        const parsedCapacity = Number(capacity);

        if (!parsedCapacity || parsedCapacity <= 0) {
            toast.error("ظرفیت دوره باید بیشتر از صفر باشد.");
            return;
        }

        const payload: CreateCoursePayload = {
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
            length: 20,
            course_duration: 60,
        };

        if (isEditMode && editingCourse?.id) {
            updateCourseMutation.mutate({
                courseId: editingCourse.id,
                payload,
            });
            return;
        }

        createCourseMutation.mutate(payload);
    }

    return (
        <section
            id="create-course"
            className="scroll-mt-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90"
        >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                        {isEditMode ? <Pencil size={22} /> : <PlusCircle size={22} />}
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-slate-950 dark:text-white">
                            {isEditMode ? "ویرایش دوره" : "ایجاد دوره جدید"}
                        </h2>

                        <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                            {isEditMode
                                ? "اطلاعات دوره را اصلاح کنید و روی ذخیره تغییرات بزنید."
                                : "اطلاعات دوره جدید را وارد کنید."}
                        </p>
                    </div>
                </div>

                {isEditMode && (
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isPending}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-black text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        انصراف از ویرایش
                    </button>
                )}
            </div>

            <div className="grid gap-4">
                <FormField label="عنوان دوره">
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="مثلاً دوره مکالمه انگلیسی"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                </FormField>

                <FormField label="توضیحات دوره">
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                        placeholder="توضیح کوتاه درباره دوره"
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
                            placeholder="A1 / B1 / C1"
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </FormField>

                    <FormField label="روز برگزاری">
                        <input
                            value={scheduleDay}
                            onChange={(event) => setScheduleDay(event.target.value)}
                            placeholder="Saturday"
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
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isPending ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : isEditMode ? (
                        <Pencil size={18} />
                    ) : (
                        <PlusCircle size={18} />
                    )}
                    {isEditMode ? "ذخیره تغییرات" : "ایجاد دوره"}
                </button>
            </div>
        </section>
    );
}

function TutorCoursesManagement({
                                    courses,
                                    reviews,
                                    onEditCourse,
                                }: {
    courses: TutorCourse[];
    reviews: TutorCourseReview[];
    onEditCourse: (course: TutorCourse) => void;
}) {
    const queryClient = useQueryClient();
    const visibleCourses = getLatestItems(courses);

    const deleteCourseMutation = useMutation({
        mutationFn: deleteCourse,
        onSuccess: async () => {
            toast.success("دوره حذف شد.");
            await queryClient.invalidateQueries({ queryKey: ["tutor-dashboard"] });
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error));
        },
    });

    return (
        <section
            id="manage-courses"
            className="scroll-mt-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90"
        >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                        <BriefcaseBusiness size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-slate-950 dark:text-white">
                            مدیریت دوره‌ها
                        </h2>

                        <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                            {courses.length > 3
                                ? "۳ دوره آخر نمایش داده شده است."
                                : "لیست دوره‌های ثبت‌شده شما"}
                        </p>
                    </div>
                </div>

                {courses.length > 3 && (
                    <Link
                        href="/dashboard/tutor/courses"
                        className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 font-black text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
                    >
                        مشاهده همه
                    </Link>
                )}
            </div>

            {courses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    هنوز دوره‌ای برای شما ثبت نشده است.
                </div>
            ) : (
                <div className="grid gap-3">
                    {visibleCourses.map((course, index) => {
                        const satisfactionPercent = getCourseSatisfactionPercent(course, reviews);

                        return (
                            <div
                                key={String(course.id ?? index)}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-3 flex flex-wrap items-center gap-3">
                                            <h3 className="font-black text-slate-950 dark:text-white">
                                                {getCourseTitle(course)}
                                            </h3>

                                            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-black text-rose-600 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
                                                <Heart size={15} className="fill-current" />
                                                {satisfactionPercent === null
                                                    ? "بدون امتیاز"
                                                    : `${satisfactionPercent}% رضایت`}
                                            </div>
                                        </div>

                                        <p className="mt-2 leading-7 text-slate-500 dark:text-slate-400">
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
                                            onClick={() => onEditCourse(course)}
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
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function TutorStudentsList({ enrollments }: { enrollments: TutorEnrollment[] }) {
    const visibleEnrollments = getLatestItems(enrollments);

    return (
        <section
            id="my-students"
            className="scroll-mt-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90"
        >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                        <Users size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-slate-950 dark:text-white">
                            دانش‌آموزان من
                        </h2>

                        <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                            {enrollments.length > 3
                                ? "۳ ثبت‌نام آخر نمایش داده شده است."
                                : "لیست دانش‌آموزان ثبت‌نام‌شده"}
                        </p>
                    </div>
                </div>

                {enrollments.length > 3 && (
                    <Link
                        href="/dashboard/tutor/students"
                        className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 font-black text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
                    >
                        مشاهده همه
                    </Link>
                )}
            </div>

            {enrollments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    هنوز دانش‌آموزی در دوره‌های شما ثبت‌نام نکرده است.
                </div>
            ) : (
                <div className="grid gap-3">
                    {visibleEnrollments.map((enrollment) => (
                        <div
                            key={String(enrollment.id)}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h3 className="font-black text-slate-950 dark:text-white">
                                        {getStudentName(enrollment)}
                                    </h3>

                                    <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                                        دوره: {getCourseTitle(enrollment.course)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 text-xs font-black">
                                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
                                        {getEnrollmentStatusLabel(enrollment.status)}
                                    </span>

                                    <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        مبلغ: {enrollment.payment_amount ?? "-"} {enrollment.currency ?? ""}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function TutorCourseReviews({ reviews }: { reviews: TutorCourseReview[] }) {
    const visibleReviews = getLatestItems(reviews);

    return (
        <section
            id="course-reviews"
            className="scroll-mt-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90"
        >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                        <MessageSquare size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-slate-950 dark:text-white">
                            نظرات دانش‌آموزان
                        </h2>

                        <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                            نظرهای ثبت‌شده برای دوره‌های شما
                        </p>
                    </div>
                </div>

                {reviews.length > 3 && (
                    <Link
                        href="/dashboard/tutor/reviews"
                        className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 font-black text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
                    >
                        مشاهده همه
                    </Link>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    هنوز نظری برای دوره‌های شما ثبت نشده است.
                </div>
            ) : (
                <div className="grid gap-3">
                    {visibleReviews.map((review, index) => {
                        const ratingPercent = getReviewRatingPercent(review);

                        return (
                            <article
                                key={String(review.id ?? index)}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h3 className="font-black text-slate-950 dark:text-white">
                                            {getReviewStudentName(review)}
                                        </h3>

                                        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                                            دوره: {getReviewCourseTitle(review)}
                                        </p>
                                    </div>

                                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-black text-rose-600 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
                                        <Heart size={15} className="fill-current" />
                                        {ratingPercent === null ? "بدون امتیاز" : `${ratingPercent}%`}
                                    </span>
                                </div>

                                <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                                    {getReviewText(review)}
                                </p>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function TutorCreateProfileForm() {
    const queryClient = useQueryClient();

    const [step, setStep] = useState(1);

    const [country, setCountry] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [bio, setBio] = useState("");
    const [teachingStyle, setTeachingStyle] = useState("");
    const [education, setEducation] = useState("");
    const [experience, setExperience] = useState("");
    const [language, setLanguage] = useState("English");
    const [languageLevel, setLanguageLevel] = useState("B1");
    const [subject, setSubject] = useState("English");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [introVideoFile, setIntroVideoFile] = useState<File | null>(null);

    const createProfileMutation = useMutation({
        mutationFn: createTutorProfile,
        onSuccess: async () => {
            toast.success("پروفایل استاد ثبت شد و در انتظار تأیید ادمین قرار گرفت.");
            await queryClient.invalidateQueries({ queryKey: ["tutor-dashboard"] });
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error));
        },
    });

    function goNext() {
        if (step === 1 && (!country || !phoneNumber || !bio)) {
            toast.error("لطفاً کشور، شماره تماس و معرفی کوتاه را وارد کنید.");
            return;
        }

        if (step === 2 && (!language || !languageLevel || !subject)) {
            toast.error("لطفاً زبان، سطح زبان و موضوع تدریس را وارد کنید.");
            return;
        }

        setStep((current) => Math.min(current + 1, 3));
    }

    function goBack() {
        setStep((current) => Math.max(current - 1, 1));
    }

    function handleSubmit() {
        if (!profilePicture) {
            toast.error("لطفاً عکس پروفایل را آپلود کنید.");
            return;
        }

        if (!introVideoFile) {
            toast.error("لطفاً ویدئوی معرفی را آپلود کنید.");
            return;
        }

        createProfileMutation.mutate({
            country,
            phoneNumber,
            bio,
            teachingStyle,
            education,
            experience,
            language,
            languageLevel,
            subject,
            profilePicture,
            introVideoFile,
        });
    }

    return (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
            <div className="mb-6">
                <p className="mb-2 text-sm font-black text-amber-700 dark:text-amber-300">
                    Create Profile
                </p>

                <h2 className="text-xl font-black">
                    پروفایل استاد هنوز تکمیل نشده است
                </h2>

                <p className="mt-3 leading-7">
                    برای فعال شدن داشبورد استاد، ابتدا اطلاعات پروفایل خود را تکمیل کنید.
                    بعد از ارسال، پروفایل شما در انتظار تأیید ادمین قرار می‌گیرد.
                </p>
            </div>

            <div className="mb-6 grid gap-3 md:grid-cols-3">
                <StepBadge active={step === 1} done={step > 1} label="اطلاعات اولیه" />
                <StepBadge active={step === 2} done={step > 2} label="تخصص و زبان" />
                <StepBadge active={step === 3} done={false} label="آپلود فایل" />
            </div>

            <div className="rounded-[1.5rem] border border-amber-200 bg-white/80 p-5 dark:border-amber-400/20 dark:bg-slate-950/60">
                {step === 1 && (
                    <div className="grid gap-4">
                        <FormField label="کشور">
                            <input
                                value={country}
                                onChange={(event) => setCountry(event.target.value)}
                                placeholder="مثلاً Germany"
                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </FormField>

                        <FormField label="شماره تماس">
                            <input
                                value={phoneNumber}
                                onChange={(event) => setPhoneNumber(event.target.value)}
                                placeholder="مثلاً 09123456789"
                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </FormField>

                        <FormField label="معرفی کوتاه">
                            <textarea
                                value={bio}
                                onChange={(event) => setBio(event.target.value)}
                                placeholder="خودتان و سابقه تدریس‌تان را کوتاه معرفی کنید."
                                rows={4}
                                className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold leading-7 text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </FormField>
                    </div>
                )}

                {step === 2 && (
                    <div className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField label="زبان تدریس">
                                <input
                                    value={language}
                                    onChange={(event) => setLanguage(event.target.value)}
                                    placeholder="English"
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                            </FormField>

                            <FormField label="سطح زبان">
                                <input
                                    value={languageLevel}
                                    onChange={(event) => setLanguageLevel(event.target.value)}
                                    placeholder="B1"
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                            </FormField>
                        </div>

                        <FormField label="موضوع تدریس">
                            <input
                                value={subject}
                                onChange={(event) => setSubject(event.target.value)}
                                placeholder="English"
                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </FormField>

                        <FormField label="سبک تدریس">
                            <textarea
                                value={teachingStyle}
                                onChange={(event) => setTeachingStyle(event.target.value)}
                                placeholder="مثلاً کلاس مکالمه‌محور، تمرین محور یا پروژه‌محور"
                                rows={3}
                                className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold leading-7 text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </FormField>
                        <FormField label="سوابق">
                            <textarea
                                value={experience}
                                onChange={(event) => setExperience(event.target.value)}
                                placeholder="مثلاً ۳ سال تدریس مکالمه، تدریس خصوصی آیلتس، سابقه کار در آموزشگاه"
                                rows={3}
                                className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold leading-7 text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </FormField>

                        <FormField label="تحصیلات">
                            <textarea
                                value={education}
                                onChange={(event) => setEducation(event.target.value)}
                                placeholder="مثلاً کارشناسی زبان انگلیسی، مدرک CELTA، دوره تربیت مدرس"
                                rows={3}
                                className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold leading-7 text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </FormField>
                    </div>
                )}

                {step === 3 && (
                    <div className="grid gap-4">
                        <FormField label="عکس پروفایل">
                            <input
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={(event) => setProfilePicture(event.target.files?.[0] ?? null)}
                                className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 file:ml-3 file:rounded-xl file:border-0 file:bg-emerald-400 file:px-3 file:py-2 file:font-black file:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                            />
                        </FormField>

                        <FormField label="ویدئوی معرفی">
                            <input
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                onChange={(event) => setIntroVideoFile(event.target.files?.[0] ?? null)}
                                className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 file:ml-3 file:rounded-xl file:border-0 file:bg-emerald-400 file:px-3 file:py-2 file:font-black file:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                            />
                        </FormField>
                    </div>
                )}

                <div className="mt-6 flex flex-wrap justify-between gap-3">
                    <button
                        type="button"
                        onClick={goBack}
                        disabled={step === 1 || createProfileMutation.isPending}
                        className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        مرحله قبل
                    </button>

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={goNext}
                            className="rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300"
                        >
                            مرحله بعد
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={createProfileMutation.isPending || !profilePicture || !introVideoFile}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {createProfileMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                            ارسال برای تأیید ادمین
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

function StepBadge({
                       active,
                       done,
                       label,
                   }: {
    active: boolean;
    done: boolean;
    label: string;
}) {
    return (
        <div
            className={`rounded-2xl border px-4 py-3 text-center text-sm font-black ${
                active
                    ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
                    : done
                        ? "border-emerald-200 bg-white text-emerald-700 dark:border-emerald-400/20 dark:bg-slate-950 dark:text-emerald-300"
                        : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
            }`}
        >
            {label}
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