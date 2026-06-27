"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  BookOpenText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ImageIcon,
  UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/services/auth.service";
import {
  getCourseImage,
  getCourseTitle,
  getCourses,
  type Course,
} from "@/services/courses.service";
import {
  getTutorLanguages,
  getTutorName,
  getTutorSubjects,
  getTutors,
  type Tutor,
} from "@/services/tutors.service";
import {
  getBlogAuthor,
  getBlogDate,
  getBlogDescription,
  getBlogImage,
  getBlogTitle,
  getBlogs,
  type Blog,
} from "@/services/blogs.service";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const dashboardInfo = getDashboardInfo(user);

  async function handleLogout() {
    await logoutUser();
    window.location.href = "/login";
  }

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["home-courses"],
    queryFn: getCourses,
  });

  const { data: tutors = [], isLoading: tutorsLoading } = useQuery({
    queryKey: ["home-tutors"],
    queryFn: getTutors,
  });

  const { data: blogs = [], isLoading: blogsLoading } = useQuery({
    queryKey: ["home-blogs"],
    queryFn: getBlogs,
  });

  const featuredCourses = courses.slice(0, 3);
  const featuredTutors = tutors.slice(0, 3);
  const latestBlogs = blogs.slice(0, 3);

  const isLoading = coursesLoading || tutorsLoading || blogsLoading;

  return (
      <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <section className="mx-auto max-w-6xl">
          <header className="mb-6 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/30">
            <nav className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
                  <BookOpen size={24} />
                </div>

                <div>
                  <p className="text-xl font-black text-slate-950 dark:text-white">
                    Learn English
                  </p>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Online Learning Platform
                  </p>
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-3">
                <ThemeToggle />

                <Link
                    href="/courses"
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  دوره‌ها
                </Link>

                <Link
                    href="/tutors"
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  اساتید
                </Link>

                <Link
                    href="/blog"
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  بلاگ
                </Link>

                {isAuthenticated ? (
                    <>
                      {dashboardInfo && (
                          <Link
                              href={dashboardInfo.href}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300"
                          >
                            <LayoutDashboard size={17} />
                            {dashboardInfo.label}
                          </Link>
                      )}

                      <button
                          type="button"
                          onClick={handleLogout}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400"
                      >
                        <LogOut size={17} />
                        خروج
                      </button>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300"
                    >
                      ورود
                    </Link>
                )}
              </div>
            </nav>

            <div className="flex flex-col items-center text-center">
              <h1 className="whitespace-nowrap text-3xl font-black leading-[1.4] text-slate-950 dark:text-white md:text-4xl xl:text-5xl">
                دوره، استاد و محتوای آموزشی را یک‌جا پیدا کن
              </h1>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                    href="/courses"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300"
                >
                  مشاهده دوره‌ها
                  <ArrowLeft size={18} />
                </Link>

                <Link
                    href="/register/student"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  ثبت‌نام دانش‌آموز
                </Link>
              </div>
            </div>
          </header>

          <section className="mb-8 grid gap-4 md:grid-cols-3">
            <HeroStat
                icon={<BookOpen size={20} />}
                label="دوره فعال"
                value={`${courses.length}`}
            />

            <HeroStat
                icon={<UserRound size={20} />}
                label="استاد ثبت‌شده"
                value={`${tutors.length}`}
            />

            <HeroStat
                icon={<BookOpenText size={20} />}
                label="مقاله آموزشی"
                value={`${blogs.length}`}
            />
          </section>

          {isLoading ? (
              <HomeLoading />
          ) : (
              <div className="grid gap-8">
                <HomeSection
                    title="دوره‌های پیشنهادی"
                    href="/courses"
                    linkLabel="همه دوره‌ها"
                >
                  {featuredCourses.length === 0 ? (
                      <EmptyState text="هنوز دوره‌ای ثبت نشده است." />
                  ) : (
                      <div className="grid gap-5 md:grid-cols-3">
                        {featuredCourses.map((course) => (
                            <CourseMiniCard key={String(course.id)} course={course} />
                        ))}
                      </div>
                  )}
                </HomeSection>

                <HomeSection
                    title="استادهای منتخب"
                    href="/tutors"
                    linkLabel="همه استادها"
                >
                  {featuredTutors.length === 0 ? (
                      <EmptyState text="هنوز استادی ثبت نشده است." />
                  ) : (
                      <div className="grid gap-5 md:grid-cols-3">
                        {featuredTutors.map((tutor) => (
                            <TutorMiniCard key={String(tutor.id)} tutor={tutor} />
                        ))}
                      </div>
                  )}
                </HomeSection>

                <HomeSection
                    title="آخرین مقاله‌ها"
                    href="/blog"
                    linkLabel="همه مقاله‌ها"
                >
                  {latestBlogs.length === 0 ? (
                      <EmptyState text="هنوز مقاله‌ای ثبت نشده است." />
                  ) : (
                      <div className="grid gap-5 md:grid-cols-3">
                        {latestBlogs.map((blog) => (
                            <BlogMiniCard key={String(blog.id)} blog={blog} />
                        ))}
                      </div>
                  )}
                </HomeSection>
              </div>
          )}
        </section>
      </main>
  );
}

function HeroStat({
                    icon,
                    label,
                    value,
                  }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
            {icon}
          </div>

          <div className="text-right">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {label}
            </p>

            <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
              {value}
            </p>
          </div>
        </div>
      </div>
  );
}

function HomeSection({
                       title,
                       href,
                       linkLabel,
                       children,
                     }: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            {title}
          </h2>

          <Link
              href={href}
              className="inline-flex items-center gap-2 text-sm font-black text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300"
          >
            {linkLabel}
            <ArrowLeft size={16} />
          </Link>
        </div>

        {children}
      </section>
  );
}

function CourseMiniCard({ course }: { course: Course }) {
  const title = getCourseTitle(course);
  const image = getCourseImage(course);

  return (
      <Link
          href="/courses"
          className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
      >
        <CardImage src={image} alt={title} />

        <div className="p-4">
          <h3 className="line-clamp-1 font-black text-slate-950 dark:text-white">
            {title}
          </h3>

          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
            <GraduationCap size={16} />
            {course.language || "زبان نامشخص"}
          </p>
        </div>
      </Link>
  );
}

function TutorMiniCard({ tutor }: { tutor: Tutor }) {
  const name = getTutorName(tutor);
  const languages = getTutorLanguages(tutor);
  const subjects = getTutorSubjects(tutor);

  return (
      <Link
          href="/tutors"
          className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
          {tutor.profile_picture ? (
              <img
                  src={tutor.profile_picture}
                  alt={name}
                  className="h-full w-full object-cover"
              />
          ) : (
              <UserRound size={26} />
          )}
        </div>

        <h3 className="line-clamp-1 font-black text-slate-950 dark:text-white">
          {name}
        </h3>

        <p className="mt-2 line-clamp-1 text-sm font-bold text-slate-500 dark:text-slate-400">
          {subjects.join("، ") || "موضوع ثبت نشده"}
        </p>

        <p className="mt-2 line-clamp-1 text-sm font-bold text-slate-500 dark:text-slate-400">
          {languages.join("، ") || "زبان ثبت نشده"}
        </p>
      </Link>
  );
}

function BlogMiniCard({ blog }: { blog: Blog }) {
  const title = getBlogTitle(blog);
  const image = getBlogImage(blog);
  const description = getBlogDescription(blog);

  return (
      <Link
          href="/blog"
          className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
      >
        <CardImage src={image} alt={title} />

        <div className="p-4">
          <h3 className="line-clamp-1 font-black text-slate-950 dark:text-white">
            {title}
          </h3>

          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>

          <p className="mt-3 text-xs font-black text-slate-400 dark:text-slate-500">
            {getBlogAuthor(blog)} • {getBlogDate(blog)}
          </p>
        </div>
      </Link>
  );
}

function CardImage({ src, alt }: { src: string | null; alt: string }) {
  return (
      <div className="flex h-36 items-center justify-center overflow-hidden bg-slate-200 dark:bg-slate-800">
        {src ? (
            <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
              <ImageIcon size={28} />
              <span className="text-xs font-black">No Image</span>
            </div>
        )}
      </div>
  );
}

function HomeLoading() {
  return (
      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
            <div
                key={index}
                className="h-64 animate-pulse rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
        ))}
      </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm font-bold text-slate-500 dark:border-slate-700 dark:text-slate-400">
        {text}
      </div>
  );
}

type HomeAuthUser = {
  role?: string;
  user_type?: string;
  account_type?: string;
  is_student?: boolean;
  is_tutor?: boolean;
  student?: unknown;
  tutor?: unknown;
};

function getDashboardInfo(user: unknown) {
  if (!user || typeof user !== "object") return null;

  const currentUser = user as HomeAuthUser;

  const role = String(
      currentUser.role ??
      currentUser.user_type ??
      currentUser.account_type ??
      ""
  ).toLowerCase();

  if (role.includes("tutor") || currentUser.is_tutor || currentUser.tutor) {
    return {
      href: "/dashboard/tutor",
      label: "داشبورد استاد",
    };
  }

  if (role.includes("student") || currentUser.is_student || currentUser.student) {
    return {
      href: "/dashboard/student",
      label: "داشبورد دانش‌آموز",
    };
  }

  return null;
}