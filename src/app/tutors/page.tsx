"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
    BookOpen,
    BriefcaseBusiness,
    Globe2,
    GraduationCap,
    ImageIcon,
    Loader2,
    MapPin,
    RefreshCcw,
    UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getApiErrorMessage } from "@/lib/apiError";
import {
    getTutorBio,
    getTutorCoursesCount,
    getTutorLanguages,
    getTutorName,
    getTutorPrice,
    getTutorSubjects,
    getTutors,
    type Tutor,
} from "@/services/tutors.service";

function TutorsPageContent() {
    const {
        data: tutors = [],
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["tutors"],
        queryFn: getTutors,
    });

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <section className="mx-auto max-w-6xl">
                <div className="mb-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/30">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-slate-950 transition-colors duration-300 dark:text-white">
                                استادها
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <ThemeToggle />

                            <Link
                                href="/courses"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                دوره‌ها
                            </Link>

                            <Link
                                href="/dashboard/student"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300"
                            >
                                خانه
                            </Link>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <TutorsLoading />
                ) : isError ? (
                    <TutorsError
                        message={getApiErrorMessage(error)}
                        onRetry={() => refetch()}
                        isFetching={isFetching}
                    />
                ) : tutors.length === 0 ? (
                    <EmptyTutors />
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {tutors.map((tutor) => (
                            <TutorCard key={String(tutor.id)} tutor={tutor} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function TutorCard({ tutor }: { tutor: Tutor }) {
    const name = getTutorName(tutor);
    const bio = getTutorBio(tutor);
    const languages = getTutorLanguages(tutor);
    const subjects = getTutorSubjects(tutor);
    const coursesCount = getTutorCoursesCount(tutor);
    const price = getTutorPrice(tutor);

    return (
        <article className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:border-slate-800/90 dark:bg-slate-900/90 dark:hover:shadow-black/30">
            <div className="relative flex h-44 items-center justify-center overflow-hidden bg-slate-200 transition-colors duration-300 dark:bg-slate-800">
                {tutor.profile_picture ? (
                    <img
                        src={tutor.profile_picture}
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-emerald-100 to-slate-200 text-emerald-700 dark:from-emerald-400/10 dark:to-slate-800 dark:text-emerald-300">
                        <ImageIcon size={32} />
                        <span className="text-sm font-black">Tutor Image</span>
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                        <UserRound size={22} />
                    </div>

                    <div>
                        <h2 className="font-black leading-7 text-slate-950 dark:text-white">
                            {name}
                        </h2>

                        <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <MapPin size={15} />
                            {tutor.country || "کشور ثبت نشده"}
                        </p>
                    </div>
                </div>

                <p className="line-clamp-3 min-h-20 leading-7 text-slate-500 dark:text-slate-400">
                    {bio}
                </p>

                <div className="mt-5 grid gap-3">
                    <InfoRow icon={<Globe2 size={18} />} label="زبان‌ها" value={languages.join("، ") || "ثبت نشده"} />
                    <InfoRow icon={<BookOpen size={18} />} label="موضوعات" value={subjects.join("، ") || "ثبت نشده"} />
                    <InfoRow icon={<GraduationCap size={18} />} label="تعداد دوره‌ها" value={`${coursesCount}`} />
                    <InfoRow icon={<BriefcaseBusiness size={18} />} label="هزینه" value={price} />
                </div>

                {tutor.intro_video_file && (
                    <a
                        href={tutor.intro_video_file}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        مشاهده ویدئوی معرفی
                    </a>
                )}
            </div>
        </article>
    );
}

function InfoRow({
                     icon,
                     label,
                     value,
                 }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
            <span className="inline-flex shrink-0 items-center gap-2 font-black text-slate-600 dark:text-slate-300">
                {icon}
                {label}
            </span>
            <span className="line-clamp-1 text-left font-bold text-slate-500 dark:text-slate-400">
                {value}
            </span>
        </div>
    );
}

function TutorsLoading() {
    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="h-96 animate-pulse rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                />
            ))}
        </div>
    );
}

function TutorsError({
                         message,
                         onRetry,
                         isFetching,
                     }: {
    message: string;
    onRetry: () => void;
    isFetching: boolean;
}) {
    return (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
            <h2 className="font-black">خطا در دریافت استادها</h2>
            <p className="mt-2 leading-7">{message}</p>

            <button
                type="button"
                onClick={onRetry}
                disabled={isFetching}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isFetching ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
                تلاش دوباره
            </button>
        </div>
    );
}

function EmptyTutors() {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                <UserRound size={28} />
            </div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
                هنوز استادی ثبت نشده است
            </h2>
        </div>
    );
}

export default function TutorsPage() {
    return <TutorsPageContent />;
}