"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    FileText,
    Loader2,
    Plus,
    Send,
    X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getApiErrorMessage } from "@/lib/apiError";
import {
    getHomeworks,
    getSubmittedHomeworks,
    submitHomeworkAnswer,
    type Homework,
    type SubmittedHomework,
} from "@/services/homework.service";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getTextValue(value: unknown): string | null {
    if (typeof value === "string" && value.trim() !== "") return value;
    if (typeof value === "number") return value.toString();

    return null;
}

function getHomeworkId(homework: Homework, index: number): string | number {
    return homework.id ?? index;
}

function getHomeworkTitle(homework: Homework): string {
    return (
        getTextValue(homework.title) ??
        getTextValue(homework.name) ??
        "تکلیف بدون عنوان"
    );
}

function getHomeworkDescription(homework: Homework): string {
    return (
        getTextValue(homework.description) ??
        "توضیحی برای این تکلیف ثبت نشده است."
    );
}

function getHomeworkFileUrl(homework: Homework): string | null {
    return (
        getTextValue(homework.document) ??
        getTextValue(homework.file) ??
        getTextValue(homework.homework_file)
    );
}

function getHomeworkDate(homework: Homework): string | null {
    return (
        getTextValue(homework.due_date) ??
        getTextValue(homework.created_at) ??
        getTextValue(homework.updated_at)
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

function formatPersianDateTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "ثبت نشده";
    }

    return date.toLocaleString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getLessonTitle(homework: Homework): string {
    const lesson = homework.lesson;

    if (typeof lesson === "string" || typeof lesson === "number") {
        return `درس شماره ${lesson}`;
    }

    if (isRecord(lesson)) {
        return (
            getTextValue(lesson.title) ??
            getTextValue(lesson.name) ??
            getTextValue(lesson.lesson_title) ??
            "درس ثبت نشده"
        );
    }

    return "درس ثبت نشده";
}

function getCourseTitle(homework: Homework): string {
    const course = homework.course;

    if (typeof course === "string" || typeof course === "number") {
        return `دوره شماره ${course}`;
    }

    if (isRecord(course)) {
        return (
            getTextValue(course.title) ??
            getTextValue(course.name) ??
            getTextValue(course.course_title) ??
            "دوره ثبت نشده"
        );
    }

    const lesson = homework.lesson;

    if (isRecord(lesson)) {
        const lessonCourse = lesson.course;

        if (typeof lessonCourse === "string" || typeof lessonCourse === "number") {
            return `دوره شماره ${lessonCourse}`;
        }

        if (isRecord(lessonCourse)) {
            return (
                getTextValue(lessonCourse.title) ??
                getTextValue(lessonCourse.name) ??
                getTextValue(lessonCourse.course_title) ??
                "دوره ثبت نشده"
            );
        }
    }

    return "دوره ثبت نشده";
}

function StudentHomeworksContent() {
    const queryClient = useQueryClient();
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [selectedHomeworkId, setSelectedHomeworkId] = useState<string>("");
    const [answer, setAnswer] = useState("");

    const {
        data: homeworks = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["student-homeworks"],
        queryFn: getHomeworks,
    });

    const {
        data: submittedHomeworks = [],
        isLoading: isSubmittedLoading,
    } = useQuery({
        queryKey: ["student-submitted-homeworks"],
        queryFn: getSubmittedHomeworks,
    });

    const submittedMap = useMemo(() => {
        const map = new Map<string, SubmittedHomework>();

        submittedHomeworks.forEach((item) => {
            map.set(String(item.homework_id), item);
        });

        return map;
    }, [submittedHomeworks]);

    const selectedHomework = useMemo(() => {
        return homeworks.find((homework, index) => {
            return String(getHomeworkId(homework, index)) === selectedHomeworkId;
        });
    }, [homeworks, selectedHomeworkId]);

    const submitMutation = useMutation({
        mutationFn: submitHomeworkAnswer,
        onSuccess: async () => {
            toast.success("تکلیف با موفقیت ثبت شد.");

            setIsSubmitModalOpen(false);
            setSelectedHomeworkId("");
            setAnswer("");

            await queryClient.invalidateQueries({
                queryKey: ["student-submitted-homeworks"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["student-profile"],
            });
        },
        onError: (mutationError) => {
            toast.error(getApiErrorMessage(mutationError));
        },
    });

    const openSubmitModal = (homework?: Homework, index?: number) => {
        if (homework && typeof index === "number") {
            setSelectedHomeworkId(String(getHomeworkId(homework, index)));
        }

        setIsSubmitModalOpen(true);
    };

    const handleSubmitHomework = () => {
        if (!selectedHomework) {
            toast.error("لطفاً یک تکلیف را انتخاب کنید.");
            return;
        }

        if (answer.trim().length < 3) {
            toast.error("متن پاسخ تکلیف را وارد کنید.");
            return;
        }

        const homeworkIndex = homeworks.findIndex((homework) => homework === selectedHomework);

        submitMutation.mutate({
            homework_id: getHomeworkId(selectedHomework, homeworkIndex),
            title: getHomeworkTitle(selectedHomework),
            course_title: getCourseTitle(selectedHomework),
            lesson_title: getLessonTitle(selectedHomework),
            answer: answer.trim(),
        });
    };

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <section className="mx-auto max-w-6xl">
                <div className="mb-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/30">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                                Homeworks
                            </p>

                            <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                                همه تکالیف
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <ThemeToggle />

                            <button
                                type="button"
                                onClick={() => openSubmitModal()}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-300"
                            >
                                <Plus size={18} />
                                ثبت تکلیف
                            </button>

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

                {isLoading || isSubmittedLoading ? (
                    <LoadingState text="در حال دریافت تکالیف..." />
                ) : isError ? (
                    <ErrorState message={getApiErrorMessage(error)} />
                ) : homeworks.length === 0 ? (
                    <EmptyState text="هنوز تکلیفی برای شما ثبت نشده است." />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {homeworks.map((homework, index) => {
                            const homeworkId = getHomeworkId(homework, index);
                            const submittedHomework = submittedMap.get(String(homeworkId));

                            return (
                                <HomeworkCard
                                    key={String(homeworkId)}
                                    homework={homework}
                                    submittedHomework={submittedHomework}
                                    onSubmit={() => openSubmitModal(homework, index)}
                                />
                            );
                        })}
                    </div>
                )}

                {isSubmitModalOpen && (
                    <SubmitHomeworkModal
                        homeworks={homeworks}
                        selectedHomeworkId={selectedHomeworkId}
                        answer={answer}
                        isPending={submitMutation.isPending}
                        onChangeHomework={setSelectedHomeworkId}
                        onChangeAnswer={setAnswer}
                        onClose={() => setIsSubmitModalOpen(false)}
                        onSubmit={handleSubmitHomework}
                    />
                )}
            </section>
        </main>
    );
}

function HomeworkCard({
                          homework,
                          submittedHomework,
                          onSubmit,
                      }: {
    homework: Homework;
    submittedHomework?: SubmittedHomework;
    onSubmit: () => void;
}) {
    const title = getHomeworkTitle(homework);
    const description = getHomeworkDescription(homework);
    const fileUrl = getHomeworkFileUrl(homework);
    const dateValue = getHomeworkDate(homework);
    const lessonTitle = getLessonTitle(homework);
    const courseTitle = getCourseTitle(homework);
    const isSubmitted = Boolean(submittedHomework);

    return (
        <article className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm transition dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                    <CheckCircle2 size={26} />
                </div>

                <span
                    className={
                        isSubmitted
                            ? "inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
                            : "inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300"
                    }
                >
                    {isSubmitted ? "ارسال شده" : "در انتظار ارسال"}
                </span>
            </div>

            <h2 className="line-clamp-2 font-black leading-7 text-slate-950 dark:text-white">
                {title}
            </h2>

            <p className="mt-3 line-clamp-3 text-sm font-bold leading-7 text-slate-500 dark:text-slate-400">
                {description}
            </p>

            <div className="mt-5 grid gap-3">
                <InfoBox
                    icon={<BookOpen size={16} />}
                    label="دوره"
                    value={courseTitle}
                />

                <InfoBox
                    icon={<BookOpen size={16} />}
                    label="درس"
                    value={lessonTitle}
                />

                <InfoBox
                    icon={<CalendarDays size={16} />}
                    label="تاریخ تحویل / ثبت"
                    value={formatPersianDate(dateValue)}
                />
            </div>

            {submittedHomework && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-400/30 dark:bg-emerald-400/10">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        پاسخ ثبت‌شده
                    </p>

                    <p className="mt-2 line-clamp-3 text-sm font-bold leading-7 text-emerald-800 dark:text-emerald-200">
                        {submittedHomework.answer}
                    </p>

                    <p className="mt-3 text-xs font-bold text-emerald-700/70 dark:text-emerald-300/70">
                        تاریخ ارسال: {formatPersianDateTime(submittedHomework.submitted_at)}
                    </p>
                </div>
            )}

            <div className="mt-5 grid gap-3">
                {fileUrl ? (
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-black text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <FileText size={17} />
                        مشاهده فایل تکلیف
                    </a>
                ) : (
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-200 px-4 py-3 font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <FileText size={17} />
                        فایل ندارد
                    </span>
                )}

                {!isSubmitted && (
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 transition hover:bg-emerald-300"
                    >
                        <Send size={17} />
                        ثبت پاسخ تکلیف
                    </button>
                )}
            </div>
        </article>
    );
}

function SubmitHomeworkModal({
                                 homeworks,
                                 selectedHomeworkId,
                                 answer,
                                 isPending,
                                 onChangeHomework,
                                 onChangeAnswer,
                                 onClose,
                                 onSubmit,
                             }: {
    homeworks: Homework[];
    selectedHomeworkId: string;
    answer: string;
    isPending: boolean;
    onChangeHomework: (value: string) => void;
    onChangeAnswer: (value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="mb-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                            Submit Homework
                        </p>

                        <h2 className="text-xl font-black text-slate-950 dark:text-white">
                            ثبت پاسخ تکلیف
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="grid gap-4">
                    <label className="grid gap-2">
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                            انتخاب تکلیف
                        </span>

                        <select
                            value={selectedHomeworkId}
                            onChange={(event) => onChangeHomework(event.target.value)}
                            disabled={isPending}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                        >
                            <option value="">یک تکلیف را انتخاب کنید</option>

                            {homeworks.map((homework, index) => (
                                <option
                                    key={String(getHomeworkId(homework, index))}
                                    value={String(getHomeworkId(homework, index))}
                                >
                                    {getHomeworkTitle(homework)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                            پاسخ دانش‌آموز
                        </span>

                        <textarea
                            value={answer}
                            onChange={(event) => onChangeAnswer(event.target.value)}
                            disabled={isPending}
                            rows={5}
                            placeholder="پاسخ یا توضیحات تکلیف را وارد کنید..."
                            className="resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                        />
                    </label>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        انصراف
                    </button>

                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Send size={18} />
                        )}
                        ثبت تکلیف
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoBox({
                     icon,
                     label,
                     value,
                 }: {
    icon: React.ReactNode;
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

export default function StudentHomeworksPage() {
    return (
        <ProtectedRoute allowedRoles={["student"]}>
            <StudentHomeworksContent />
        </ProtectedRoute>
    );
}