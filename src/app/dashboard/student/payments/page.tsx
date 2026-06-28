"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    FileText,
    Loader2,
    XCircle,
    UserRound,
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
        case "cancelled":
            return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getTextValue(value: unknown): string | null {
    if (typeof value === "string" && value.trim() !== "") return value;
    if (typeof value === "number") return value.toString();

    return null;
}

function getPaymentAmount(enrollment: MyEnrollment): string {
    const item = enrollment as unknown as Record<string, unknown>;

    const possibleAmount =
        getTextValue(item.amount) ??
        getTextValue(item.paid_amount) ??
        getTextValue(item.payment_amount) ??
        getTextValue(item.total_amount) ??
        getTextValue(item.price);

    if (!possibleAmount) {
        return "ثبت نشده";
    }

    return possibleAmount;
}

function getPaymentTutorName(enrollment: MyEnrollment): string {
    const item = enrollment as unknown as Record<string, unknown>;
    const course = item.course;

    if (isRecord(course)) {
        const directTutorName =
            getTextValue(course.tutor_name) ??
            getTextValue(course.teacher_name) ??
            getTextValue(course.instructor_name);

        if (directTutorName) {
            return directTutorName;
        }

        const tutor =
            course.tutor ??
            course.teacher ??
            course.instructor;

        if (isRecord(tutor)) {
            const tutorFullName =
                getTextValue(tutor.full_name) ??
                getTextValue(tutor.name);

            if (tutorFullName) {
                return tutorFullName;
            }

            const tutorFirstName = getTextValue(tutor.first_name) ?? "";
            const tutorLastName = getTextValue(tutor.last_name) ?? "";
            const tutorName = `${tutorFirstName} ${tutorLastName}`.trim();

            if (tutorName) {
                return tutorName;
            }

            const user = tutor.user;

            if (isRecord(user)) {
                const userFullName =
                    getTextValue(user.full_name) ??
                    getTextValue(user.name);

                if (userFullName) {
                    return userFullName;
                }

                const userFirstName = getTextValue(user.first_name) ?? "";
                const userLastName = getTextValue(user.last_name) ?? "";
                const userName = `${userFirstName} ${userLastName}`.trim();

                if (userName) {
                    return userName;
                }
            }
        }
    }

    return "استاد ثبت نشده";
}

function getReceiptUrl(enrollment: MyEnrollment): string | null {
    const item = enrollment as unknown as Record<string, unknown>;

    const directReceipt =
        getTextValue(item.receipt) ??
        getTextValue(item.payment_receipt) ??
        getTextValue(item.receipt_file) ??
        getTextValue(item.receipt_url);

    if (directReceipt) return directReceipt;

    const payment = item.payment;

    if (isRecord(payment)) {
        return (
            getTextValue(payment.receipt) ??
            getTextValue(payment.receipt_file) ??
            getTextValue(payment.receipt_url)
        );
    }

    return null;
}

function getPaymentDateValue(enrollment: MyEnrollment): string | null {
    const item = enrollment as unknown as Record<string, unknown>;

    const directDate =
        getTextValue(item.paid_at) ??
        getTextValue(item.payment_date) ??
        getTextValue(item.payment_created_at) ??
        getTextValue(item.submitted_at) ??
        getTextValue(item.updated_at) ??
        getTextValue(item.created_at);

    if (directDate) return directDate;

    const payment = item.payment;

    if (isRecord(payment)) {
        return (
            getTextValue(payment.paid_at) ??
            getTextValue(payment.payment_date) ??
            getTextValue(payment.created_at) ??
            getTextValue(payment.updated_at)
        );
    }

    return null;
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

function formatPersianTime(value: string | null): string {
    if (!value) return "ثبت نشده";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "ثبت نشده";
    }

    return date.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StudentPaymentsContent() {
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
                                Payments
                            </p>

                            <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                                همه پرداخت‌ها
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
                    <LoadingState text="در حال دریافت پرداخت‌ها..." />
                ) : isError ? (
                    <ErrorState message={getApiErrorMessage(error)} />
                ) : enrollments.length === 0 ? (
                    <EmptyState text="هنوز پرداخت یا ثبت‌نامی برای شما ثبت نشده است." />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {enrollments.map((enrollment, index) => (
                            <PaymentCard
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
function PaymentCard({ enrollment }: { enrollment: MyEnrollment }) {
    const status = getEnrollmentStatus(enrollment);
    const courseTitle = getEnrollmentCourseTitle(enrollment);
    const amount = getPaymentAmount(enrollment);
    const receiptUrl = getReceiptUrl(enrollment);
    const paymentDateValue = getPaymentDateValue(enrollment);
    const tutorName = getPaymentTutorName(enrollment);

    return (
        <article className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm transition dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                    <CreditCard size={26} />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                    <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${getStatusClassName(
                            status
                        )}`}
                    >
                        {getStatusIcon(status)}
                        {getStatusLabel(status)}
                    </span>

                    {receiptUrl ? (
                        <a
                            href={receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-black text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <FileText size={15} />
                            مشاهده رسید
                        </a>
                    ) : (
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-black text-slate-400 dark:border-slate-700">
                            <FileText size={15} />
                            بدون رسید
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-bold text-slate-400">
                    پرداخت برای دوره
                </p>

                <h2 className="mt-2 line-clamp-2 font-black leading-7 text-slate-950 dark:text-white">
                    {courseTitle}
                </h2>

                <div className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                    <UserRound size={16} />
                    <span>استاد: {tutorName}</span>
                </div>
            </div>

            <div className="grid gap-3">
                <PaymentInfoBox label="مبلغ پرداخت" value={amount} />

                <div className="grid gap-3 md:grid-cols-2">
                    <PaymentInfoBox
                        label="تاریخ ثبت پرداخت"
                        value={formatPersianDate(paymentDateValue)}
                        icon={<CalendarDays size={16} />}
                    />

                    <PaymentInfoBox
                        label="ساعت ثبت پرداخت"
                        value={formatPersianTime(paymentDateValue)}
                        icon={<Clock3 size={16} />}
                    />
                </div>
            </div>
        </article>
    );
}

function PaymentInfoBox({
                            label,
                            value,
                            icon,
                        }: {
    label: string;
    value: string;
    icon?: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                {icon}
                {label}
            </div>

            <p className="mt-2 font-black text-slate-950 dark:text-white">
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

export default function StudentPaymentsPage() {
    return (
        <ProtectedRoute allowedRoles={["student"]}>
            <StudentPaymentsContent />
        </ProtectedRoute>
    );
}