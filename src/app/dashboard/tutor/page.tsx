"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    BookOpen,
    BriefcaseBusiness,
    CheckCircle2,
    Clock3,
    GraduationCap,
    Loader2,
    LogOut,
    RefreshCcw,
    UserRound,
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

type TutorCourse = {
    id?: number | string;
    course_title?: string;
    title?: string;
    price_per_hour?: string;
    language?: string;
    course_type?: string;
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
    status?: string;
    is_approved?: boolean;
};

type CreateTutorProfilePayload = {
    country: string;
    phoneNumber: string;
    bio: string;
    teachingStyle: string;
    expectation: string;
    language: string;
    languageLevel: string;
    subject: string;
    profilePicture: File | null;
    introVideoFile: File | null;
};

async function createTutorProfile(payload: CreateTutorProfilePayload) {
    initializeAccessToken();

    const formData = new FormData();

    formData.append("country", payload.country);
    formData.append("phone_number", payload.phoneNumber);
    formData.append("bio", payload.bio);
    formData.append("teaching_style", payload.teachingStyle);
    formData.append("expectation", payload.expectation);

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

async function getTutorDashboard(): Promise<TutorDashboard | null> {
    initializeAccessToken();

    try {
        const response = await api.get<unknown>("/tutors/me/dashboard/");

        if (Array.isArray(response.data)) {
            return response.data[0] ?? null;
        }

        if (typeof response.data === "object" && response.data !== null) {
            return response.data as TutorDashboard;
        }

        return null;
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

function getApprovalLabel(tutor: TutorDashboard | null) {
    if (!tutor) return "پروفایل تکمیل نشده";

    if (tutor.is_approved === true) return "تأیید شده";

    if (tutor.status === "approved") return "تأیید شده";
    if (tutor.status === "rejected") return "رد شده";
    if (tutor.status === "pending") return "در انتظار بررسی";
    if (tutor.status === "under_review") return "در انتظار بررسی";

    return "در انتظار بررسی";
}

function getApprovalIcon(tutor: TutorDashboard | null) {
    const label = getApprovalLabel(tutor);

    if (label === "تأیید شده") return <CheckCircle2 size={18} />;
    if (label === "رد شده") return <AlertCircle size={18} />;

    return <Clock3 size={18} />;
}

function getApprovalClassName(tutor: TutorDashboard | null) {
    const label = getApprovalLabel(tutor);

    if (label === "تأیید شده") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300";
    }

    if (label === "رد شده") {
        return "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300";
    }

    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300";
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



export default function TutorDashboardPage() {
    return (
        <ProtectedRoute>
            <TutorDashboardContent />
        </ProtectedRoute>
    );
}
function TutorDashboardContent() {
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

    const name = getTutorName(tutor ?? null);
    const approvalLabel = getApprovalLabel(tutor ?? null);
    const coursesCount = tutor?.courses?.length ?? 0;
    const certificatesCount = tutor?.certificates?.length ?? 0;
    const educationsCount = tutor?.educations?.length ?? 0;
    const experiencesCount = tutor?.experiences?.length ?? 0;

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
                                <p className="mt-2 font-bold text-slate-500 dark:text-slate-400">
                                    خوش آمدید، {name}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <ThemeToggle />

                            <Link
                                href="/tutors"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                لیست استادها
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
                ) : tutor.is_approved === false ? (
                    <TutorWaitingApproval tutor={tutor} />
                ) : (
                    <>
                        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                            <StatCard
                                icon={<Clock3 size={22} />}
                                label="وضعیت"
                                value={approvalLabel}
                                badgeClassName={getApprovalClassName(tutor)}
                                badgeIcon={getApprovalIcon(tutor)}
                            />

                            <StatCard
                                icon={<BookOpen size={22} />}
                                label="دوره‌ها"
                                value={`${coursesCount}`}
                            />

                            <StatCard
                                icon={<GraduationCap size={22} />}
                                label="مدارک"
                                value={`${certificatesCount}`}
                            />

                            <StatCard
                                icon={<BriefcaseBusiness size={22} />}
                                label="سوابق"
                                value={`${experiencesCount}`}
                            />

                            <StatCard
                                icon={<UserRound size={22} />}
                                label="تحصیلات"
                                value={`${educationsCount}`}
                            />
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                            <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
                                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                                    اطلاعات پروفایل
                                </h2>

                                <div className="mt-5 grid gap-3">
                                    <InfoRow label="کشور" value={tutor.country || "ثبت نشده"} />
                                    <InfoRow label="زبان‌ها" value={getLanguagesText(tutor.languages_spoken)} />
                                    <InfoRow label="موضوعات" value={tutor.subjects?.join("، ") || "ثبت نشده"} />
                                    <InfoRow label="بیوگرافی" value={tutor.bio || "ثبت نشده"} />
                                    <InfoRow label="سبک تدریس" value={tutor.teaching_style || "ثبت نشده"} />
                                    <InfoRow label="انتظار از دانشجو" value={tutor.expectation || "ثبت نشده"} />
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

                            <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
                                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                                    دوره‌های استاد
                                </h2>

                                {!tutor.courses || tutor.courses.length === 0 ? (
                                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                        هنوز دوره‌ای برای شما ثبت نشده است.
                                    </div>
                                ) : (
                                    <div className="mt-5 grid gap-3">
                                        {tutor.courses.map((course, index) => (
                                            <div
                                                key={String(course.id ?? index)}
                                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                                            >
                                                <h3 className="font-black text-slate-950 dark:text-white">
                                                    {course.course_title || course.title || `دوره ${index + 1}`}
                                                </h3>

                                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                                                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
                                                        {course.language || "زبان نامشخص"}
                                                    </span>
                                                    <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                        {course.course_type || "نوع نامشخص"}
                                                    </span>
                                                    <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                        {course.price_per_hour ? `${course.price_per_hour} دلار / ساعت` : "قیمت ثبت نشده"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
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
    icon: React.ReactNode;
    label: string;
    value: string;
    badgeClassName?: string;
    badgeIcon?: React.ReactNode;
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
function TutorCreateProfileForm() {
    const queryClient = useQueryClient();

    const [step, setStep] = useState(1);

    const [country, setCountry] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [bio, setBio] = useState("");
    const [teachingStyle, setTeachingStyle] = useState("");
    const [expectation, setExpectation] = useState("");
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
            expectation,
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

                        <FormField label="انتظار از دانشجو">
                            <textarea
                                value={expectation}
                                onChange={(event) => setExpectation(event.target.value)}
                                placeholder="مثلاً انجام تمرین‌ها، حضور منظم، تمرین روزانه"
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

function TutorWaitingApproval({ tutor }: { tutor: TutorDashboard }) {
    return (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
            <h2 className="text-xl font-black">پروفایل شما در انتظار تأیید ادمین است</h2>

            <p className="mt-3 leading-7">
                اطلاعات پروفایل شما ثبت شده است، اما تا زمانی که مدیر آن را تأیید نکند، داشبورد کامل استاد فعال نمی‌شود.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
                <InfoRow label="کشور" value={tutor.country || "ثبت نشده"} />
                <InfoRow label="موضوعات" value={tutor.subjects?.join("، ") || "ثبت نشده"} />
                <InfoRow label="بیوگرافی" value={tutor.bio || "ثبت نشده"} />
                <InfoRow label="سبک تدریس" value={tutor.teaching_style || "ثبت نشده"} />
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
    children: React.ReactNode;
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