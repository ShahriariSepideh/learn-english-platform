"use client";

import type { ReactNode } from "react";
import { BookOpen, CreditCard, FileText, UserRound } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

function StudentDashboardContent() {
    const { user, logout } = useAuth();

    const displayName = user?.full_name || user?.name || "دانش‌آموز";

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-10 dark:bg-slate-950">
            <section className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                            Student Dashboard
                        </p>

                        <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                            خوش آمدید، {displayName}
                        </h1>

                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            این داشبورد برای مشاهده پروفایل، دوره‌ها، پرداخت‌ها و تکالیف
                            دانش‌آموز طراحی شده است.
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
                        icon={<UserRound size={26} />}
                        title="پروفایل"
                        description="مشاهده و ویرایش اطلاعات شخصی"
                    />

                    <DashboardCard
                        icon={<BookOpen size={26} />}
                        title="دوره‌های من"
                        description="لیست دوره‌های ثبت‌نام‌شده"
                    />

                    <DashboardCard
                        icon={<CreditCard size={26} />}
                        title="پرداخت‌ها"
                        description="نمایش وضعیت پرداخت و ثبت‌نام"
                    />

                    <DashboardCard
                        icon={<FileText size={26} />}
                        title="تکالیف"
                        description="مشاهده تکالیف ثبت‌شده"
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

export default function StudentDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboardContent />
        </ProtectedRoute>
    );
}