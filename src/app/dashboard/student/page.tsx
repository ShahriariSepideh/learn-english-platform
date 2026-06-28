"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock3,
    CreditCard,
    Home,
    Loader2,
    Pencil,
    RefreshCcw,
    UserRound,
    X,
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

type HomeworkPreviewItem = {
    id: string;
    title: string;
    subtitle: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getTextValue(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim() !== "") return value;
    if (typeof value === "number") return value.toString();

    return undefined;
}

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

function getHomeworkPreviewItems(student?: StudentInfo): HomeworkPreviewItem[] {
    const value = student?.student_homework_completed;

    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((item, index) => {
        if (isRecord(item)) {
            const title =
                getTextValue(item.title) ??
                getTextValue(item.name) ??
                `تکلیف شماره ${index + 1}`;

            const subtitle =
                getTextValue(item.created_at) ??
                getTextValue(item.date) ??
                getTextValue(item.due_date) ??
                "تکلیف تکمیل‌شده";

            return {
                id: getTextValue(item.id) ?? String(index),
                title,
                subtitle,
            };
        }

        return {
            id: String(index),
            title: `تکلیف شماره ${index + 1}`,
            subtitle: "تکلیف تکمیل‌شده",
        };
    });
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
        case "pending_payment":
            return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300";
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
        case "pending_payment":
        default:
            return <Clock3 size={16} />;
    }
}

function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
}

function StudentDashboardContent() {
    const { user, logout } = useAuth();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
    const paymentsCount = enrollments.length;
    const homeworkCompletedCount = getHomeworkCount(student);
    const homeworkPreviewItems = getHomeworkPreviewItems(student);
    const isActive = student?.student_active ?? false;

    const recentCourses = enrollments.slice(0, 3);
    const recentPayments = enrollments.slice(0, 3);
    const recentHomeworks = homeworkPreviewItems.slice(0, 3);

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
                                value={displayName}
                                onClick={() => setIsProfileModalOpen(true)}
                            />

                            <DashboardCard
                                icon={<BookOpen size={26} />}
                                title="دوره‌های من"
                                value={coursesCount.toString()}
                                onClick={() => scrollToSection("my-courses")}
                            />

                            <DashboardCard
                                icon={<CreditCard size={26} />}
                                title="پرداخت‌ها"
                                value={paymentsCount.toString()}
                                onClick={() => scrollToSection("payments")}
                            />

                            <DashboardCard
                                icon={<CheckCircle2 size={26} />}
                                title="تکالیف تکمیل‌شده"
                                value={homeworkCompletedCount.toString()}
                                onClick={() => scrollToSection("homeworks")}
                            />
                        </div>

                        <div className="mt-6 grid gap-6">
                            <PreviewSection
                                id="my-courses"
                                title="دوره‌های من"
                                href="/dashboard/student/courses"
                                linkLabel="نمایش همه دوره‌ها"
                            >
                                <EnrollmentPreviewList
                                    enrollments={recentCourses}
                                    isLoading={isEnrollmentsLoading}
                                    isError={isEnrollmentsError}
                                    errorMessage={
                                        isEnrollmentsError
                                            ? getApiErrorMessage(enrollmentsError)
                                            : ""
                                    }
                                    emptyText="هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید."
                                    type="course"
                                />
                            </PreviewSection>

                            <PreviewSection
                                id="payments"
                                title="پرداخت‌ها"
                                href="/dashboard/student/payments"
                                linkLabel="نمایش همه پرداخت‌ها"
                            >
                                <EnrollmentPreviewList
                                    enrollments={recentPayments}
                                    isLoading={isEnrollmentsLoading}
                                    isError={isEnrollmentsError}
                                    errorMessage={
                                        isEnrollmentsError
                                            ? getApiErrorMessage(enrollmentsError)
                                            : ""
                                    }
                                    emptyText="هنوز پرداخت یا ثبت‌نامی برای شما ثبت نشده است."
                                    type="payment"
                                />
                            </PreviewSection>

                            <PreviewSection
                                id="homeworks"
                                title="تکالیف تکمیل‌شده"
                                href="/dashboard/student/homeworks"
                                linkLabel="نمایش همه تکالیف"
                            >
                                <HomeworkPreviewList
                                    items={recentHomeworks}
                                    totalCount={homeworkCompletedCount}
                                />
                            </PreviewSection>
                        </div>

                        {isProfileModalOpen && (
                            <ProfileModal
                                profile={profile}
                                displayName={displayName}
                                onClose={() => setIsProfileModalOpen(false)}
                            />
                        )}
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
                           onClick,
                       }: {
    icon: ReactNode;
    title: string;
    value: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 text-right shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/90 dark:bg-slate-900/90"
        >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-400 group-hover:text-slate-950 dark:text-emerald-300">
                {icon}
            </div>

            <h2 className="mb-2 font-black text-slate-950 transition-colors duration-300 dark:text-white">
                {title}
            </h2>

            <p className="text-2xl font-black text-slate-950 transition-colors duration-300 dark:text-white">
                {value}
            </p>
        </button>
    );
}

function PreviewSection({
                            id,
                            title,
                            href,
                            linkLabel,
                            children,
                        }: {
    id: string;
    title: string;
    href: string;
    linkLabel: string;
    children: ReactNode;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90"
        >
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-lg font-black text-slate-950 transition-colors duration-300 dark:text-white">
                        {title}
                    </h2>
                </div>

                <Link
                    href={href}
                    className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
                >
                    {linkLabel}
                    <ArrowLeft size={16} />
                </Link>
            </div>

            {children}
        </section>
    );
}

function EnrollmentPreviewList({
                                   enrollments,
                                   isLoading,
                                   isError,
                                   errorMessage,
                                   emptyText,
                                   type,
                               }: {
    enrollments: MyEnrollment[];
    isLoading: boolean;
    isError: boolean;
    errorMessage: string;
    emptyText: string;
    type: "course" | "payment";
}) {
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                <Loader2 className="animate-spin" size={18} />
                در حال دریافت اطلاعات...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-7 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
                {errorMessage}
            </div>
        );
    }

    if (enrollments.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center leading-7 text-slate-500 transition-colors duration-300 dark:border-slate-700 dark:text-slate-400">
                {emptyText}
            </div>
        );
    }

    return (
        <div className="grid gap-3 md:grid-cols-3">
            {enrollments.map((enrollment, index) => (
                <EnrollmentCard
                    key={String(enrollment.id ?? index)}
                    enrollment={enrollment}
                    type={type}
                />
            ))}
        </div>
    );
}

function EnrollmentCard({
                            enrollment,
                            type,
                        }: {
    enrollment: MyEnrollment;
    type: "course" | "payment";
}) {
    const status = getEnrollmentStatus(enrollment);
    const courseTitle = getEnrollmentCourseTitle(enrollment);

    return (
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                {type === "payment" ? <CreditCard size={21} /> : <BookOpen size={21} />}
            </div>

            <h3 className="line-clamp-1 font-black text-slate-950 transition-colors duration-300 dark:text-white">
                {courseTitle}
            </h3>

            {enrollment.created_at && (
                <p className="mt-2 text-xs font-bold text-slate-400">
                    {type === "payment" ? "تاریخ ثبت پرداخت/درخواست: " : "تاریخ ثبت‌نام: "}
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
        </article>
    );
}

function HomeworkPreviewList({
                                 items,
                                 totalCount,
                             }: {
    items: HomeworkPreviewItem[];
    totalCount: number;
}) {
    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center leading-7 text-slate-500 transition-colors duration-300 dark:border-slate-700 dark:text-slate-400">
                {totalCount > 0
                    ? `تعداد تکالیف تکمیل‌شده شما: ${totalCount}`
                    : "هنوز تکلیفی برای شما ثبت نشده است."}
            </div>
        );
    }

    return (
        <div className="grid gap-3 md:grid-cols-3">
            {items.map((item) => (
                <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950"
                >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                        <CheckCircle2 size={21} />
                    </div>

                    <h3 className="line-clamp-1 font-black text-slate-950 transition-colors duration-300 dark:text-white">
                        {item.title}
                    </h3>

                    <p className="mt-2 text-xs font-bold text-slate-400">
                        {item.subtitle}
                    </p>
                </article>
            ))}
        </div>
    );
}

function ProfileModal({
                          profile,
                          displayName,
                          onClose,
                      }: {
    profile?: StudentProfileUser;
    displayName: string;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="mb-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                            Profile
                        </p>

                        <h2 className="text-xl font-black text-slate-950 dark:text-white">
                            اطلاعات دانش‌آموز
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="grid gap-3">
                    <ProfileRow label="نام کامل" value={displayName} />
                    <ProfileRow label="نام" value={profile?.first_name || "ثبت نشده"} />
                    <ProfileRow
                        label="نام خانوادگی"
                        value={profile?.last_name || "ثبت نشده"}
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <Link
                        href={routes.studentEditProfile}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-300"
                    >
                        <Pencil size={17} />
                        ویرایش اطلاعات
                    </Link>
                </div>
            </div>
        </div>
    );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-bold text-slate-400">{label}</p>
            <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
        </div>
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