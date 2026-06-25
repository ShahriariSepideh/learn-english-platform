"use client";

import type { ReactNode } from "react";
import { BookOpen, MessageSquare, Star, UsersRound } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

function TutorDashboardContent() {
    const { user, logout } = useAuth();

    const displayName = user?.full_name || user?.name || "استاد";

    if (user?.approved_is === false) {
        return (
            <main className="min-h-screen bg-slate-50 px-6 py-10 dark:bg-slate-950">
                <div className="fixed left-6 top-6 z-50">
                    <ThemeToggle />
                </div>

                <section className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm dark:border-amber-500/30 dark:bg-slate-900">
                    <p className="mb-3 text-sm font-bold text-amber-600 dark:text-amber-300">
                        Tutor Pre-Approval
                    </p>

                    <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                        حساب استاد شما هنوز تأیید نشده است
                    </h1>

                    <p className="mt-4 leading-8 text-slate-500 dark:text-slate-400">
                        استاد باید ابتدا اطلاعات پروفایل، سوابق آموزشی، مدارک و ویدیو معرفی
                        خود را ارسال کند. سپس ادمین در پنل Django وضعیت استاد را تأیید
                        می‌کند. تا قبل از تأیید، دسترسی کامل به داشبورد استاد فعال نمی‌شود.
                    </p>

                    <button
                        type="button"
                        onClick={logout}
                        className="mt-6 rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        خروج
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-10 dark:bg-slate-950">
            <section className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                            Tutor Dashboard
                        </p>

                        <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                            خوش آمدید، {displayName}
                        </h1>

                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            این داشبورد برای مدیریت دوره‌ها، دانش‌آموزان، نظرات و وضعیت کلی
                            استاد طراحی شده است.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            خروج
                        </button>
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-4">
                    <DashboardCard
                        icon={<UsersRound size={26} />}
                        title="دانش‌آموزان"
                        description="تعداد و وضعیت دانش‌آموزان"
                    />

                    <DashboardCard
                        icon={<BookOpen size={26} />}
                        title="دوره‌ها"
                        description="مدیریت دوره‌های فعال"
                    />

                    <DashboardCard
                        icon={<Star size={26} />}
                        title="رضایت"
                        description="نمایش امتیازها و بازخوردها"
                    />

                    <DashboardCard
                        icon={<MessageSquare size={26} />}
                        title="نظرات"
                        description="بازخوردهای دریافتی از دانش‌آموزان"
                    />
                </div>
            </section>
        </main>
    );
}

function DashboardCard({
                           icon,
                           title,
                           description,
                       }: {
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                {icon}
            </div>

            <h2 className="mb-2 font-black text-slate-950 dark:text-white">
                {title}
            </h2>

            <p className="leading-7 text-slate-500 dark:text-slate-400">
                {description}
            </p>
        </article>
    );
}

export default function TutorDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={["tutor"]}>
            <TutorDashboardContent />
        </ProtectedRoute>
    );
}