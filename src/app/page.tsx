import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { HomeSections } from "@/components/home/HomeSections";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { routes } from "@/lib/routes";

export default function HomePage() {
  return (
      <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
            <Link href={routes.home} className="font-black tracking-tight">
              Learn English
            </Link>

            <div className="flex items-center gap-3">
              <Link
                  href={routes.login}
                  className="hidden rounded-2xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white sm:inline-flex"
              >
                ورود
              </Link>

              <ThemeToggle />
            </div>
          </div>
        </header>

        <section className="relative border-b border-slate-200 dark:border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.20),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_35%)]" />

          <div className="relative mx-auto grid min-h-[680px] w-full max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
            <span className="mb-5 inline-flex rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
              Learn English Platform
            </span>

              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-6xl">
                پلتفرم هوشمند آموزش آنلاین زبان انگلیسی
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                این پلتفرم به شما کمک می‌کند تا راحت‌تر، منظم‌تر و هدفمندتر زبان
                انگلیسی را یاد بگیرید. با دسترسی به دوره‌های آموزشی، اساتید منتخب
                و محتوای کاربردی، مسیر یادگیری شما ساده‌تر و جذاب‌تر می‌شود.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                    href={routes.login}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
                >
                  ورود به حساب
                  <ArrowLeft size={18} />
                </Link>

                <Link
                    href={routes.studentRegister}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-6 py-3 font-bold text-slate-800 transition hover:border-slate-400 hover:bg-white dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-900"
                >
                  ثبت‌نام دانش‌آموز
                </Link>

                <Link
                    href={routes.tutorRegister}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-6 py-3 font-bold text-slate-800 transition hover:border-slate-400 hover:bg-white dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-900"
                >
                  ثبت‌نام استاد
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-2xl shadow-emerald-950/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-emerald-950/20">
                <div className="mb-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-emerald-400 p-4 text-slate-950">
                    <BookOpenCheck size={26} />
                    <p className="mt-4 text-sm font-black">Courses</p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-4 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    <GraduationCap size={26} />
                    <p className="mt-4 text-sm font-black">Tutors</p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-4 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    <ShieldCheck size={26} />
                    <p className="mt-4 text-sm font-black">JWT Auth</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-3xl bg-slate-50 p-5 dark:bg-slate-950/80">
                  <div className="flex items-center justify-between rounded-2xl bg-white p-4 dark:bg-slate-900">
                  <span className="text-slate-700 dark:text-slate-300">
                    Student Dashboard
                  </span>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-600 dark:text-emerald-300">
                    Active
                  </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-white p-4 dark:bg-slate-900">
                  <span className="text-slate-700 dark:text-slate-300">
                    Tutor Approval Flow
                  </span>
                    <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-600 dark:text-amber-300">
                    Pending
                  </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-white p-4 dark:bg-slate-900">
                  <span className="text-slate-700 dark:text-slate-300">
                    Course Enrollment
                  </span>
                    <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-600 dark:text-sky-300">
                    API Based
                  </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20">
          <HomeSections />
        </section>
      </main>
  );
}