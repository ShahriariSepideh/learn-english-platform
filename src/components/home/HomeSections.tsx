"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    BookOpen,
    Newspaper,
    Star,
    UserRound,
} from "lucide-react";
import { getPopularCourses } from "@/services/course.service";
import { getFeaturedTutors } from "@/services/tutor.service";
import { getLatestBlogPosts } from "@/services/blog.service";
import type { Course } from "@/types/course.types";
import type { Tutor } from "@/types/tutor.types";
import type { BlogPost } from "@/types/blog.types";
import { Skeleton } from "@/components/ui/Skeleton";
import { routes } from "@/lib/routes";

function getCourseTutorName(course: Course): string {
    if (!course.tutor) {
        return "مدرس نامشخص";
    }

    if (typeof course.tutor === "string") {
        return course.tutor;
    }

    return course.tutor.full_name || course.tutor.name || "مدرس نامشخص";
}

function getTutorName(tutor: Tutor): string {
    return tutor.full_name || tutor.name || "استاد زبان";
}

function getTutorDescription(tutor: Tutor): string {
    return (
        tutor.short_bio ||
        tutor.bio ||
        tutor.introduction ||
        tutor.specialization ||
        "مدرس زبان انگلیسی با تجربه آموزشی"
    );
}

function getBlogSummary(post: BlogPost): string {
    return post.summary || post.excerpt || post.content || "مقاله آموزشی زبان انگلیسی";
}

function SectionHeader({
                           eyebrow,
                           title,
                           href,
                       }: {
    eyebrow: string;
    title: string;
    href: string;
}) {
    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
        <span className="mb-3 inline-flex rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
          {eyebrow}
        </span>

                <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white md:text-3xl">
                    {title}
                </h2>
            </div>

            <Link
                href={href}
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
                مشاهده همه
                <ArrowLeft size={16} />
            </Link>
        </div>
    );
}

function CardSkeletonGrid() {
    return (
        <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70"
                >
                    <Skeleton className="mb-5 h-28 w-full" />
                    <Skeleton className="mb-3 h-5 w-2/3" />
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="mb-5 h-4 w-4/5" />
                    <Skeleton className="h-10 w-32" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            {message}
        </div>
    );
}

function CourseCard({ course }: { course: Course }) {
    return (
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-emerald-400/50 dark:hover:bg-slate-900">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                <BookOpen size={28} />
            </div>

            <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
          {course.level || course.category || "دوره زبان"}
        </span>

                <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-300">
          <Star size={14} />
          محبوب
        </span>
            </div>

            <h3 className="mb-3 line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">
                {course.title}
            </h3>

            <p className="mb-4 line-clamp-2 leading-7 text-slate-600 dark:text-slate-400">
                {course.short_description ||
                    course.description ||
                    "توضیحات این دوره به زودی تکمیل می‌شود."}
            </p>

            <div className="mb-5 text-sm text-slate-500 dark:text-slate-500">
                مدرس: {getCourseTutorName(course)}
            </div>

            <Link
                href={routes.courses}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
                مشاهده دوره
                <ArrowLeft size={15} />
            </Link>
        </article>
    );
}

function TutorCard({ tutor }: { tutor: Tutor }) {
    return (
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-emerald-400/50 dark:hover:bg-slate-900">
            <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-emerald-600 dark:bg-slate-800 dark:text-emerald-300">
                    <UserRound size={30} />
                </div>

                <div>
                    <h3 className="font-bold text-slate-950 dark:text-white">
                        {getTutorName(tutor)}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                        {tutor.specialization || "مدرس زبان انگلیسی"}
                    </p>
                </div>
            </div>

            <p className="mb-5 line-clamp-3 leading-7 text-slate-600 dark:text-slate-400">
                {getTutorDescription(tutor)}
            </p>

            <Link
                href={routes.tutors}
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
                مشاهده پروفایل
                <ArrowLeft size={15} />
            </Link>
        </article>
    );
}

function BlogCard({ post }: { post: BlogPost }) {
    return (
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-emerald-400/50 dark:hover:bg-slate-900">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
                <Newspaper size={28} />
            </div>

            <h3 className="mb-3 line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">
                {post.title}
            </h3>

            <p className="mb-5 line-clamp-3 leading-7 text-slate-600 dark:text-slate-400">
                {getBlogSummary(post)}
            </p>

            <Link
                href={routes.blog}
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
                خواندن مقاله
                <ArrowLeft size={15} />
            </Link>
        </article>
    );
}

export function HomeSections() {
    const coursesQuery = useQuery({
        queryKey: ["home", "popular-courses"],
        queryFn: getPopularCourses,
    });

    const tutorsQuery = useQuery({
        queryKey: ["home", "featured-tutors"],
        queryFn: getFeaturedTutors,
    });

    const blogsQuery = useQuery({
        queryKey: ["home", "latest-blogs"],
        queryFn: getLatestBlogPosts,
    });

    return (
        <div className="space-y-20">
            <section>
                <SectionHeader
                    eyebrow="Popular Courses"
                    title="دوره‌های محبوب"
                    href={routes.courses}
                />

                {coursesQuery.isLoading ? (
                    <CardSkeletonGrid />
                ) : coursesQuery.isError ? (
                    <EmptyState message="دریافت دوره‌ها از سرور با خطا مواجه شد." />
                ) : coursesQuery.data && coursesQuery.data.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-3">
                        {coursesQuery.data.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <EmptyState message="هنوز دوره‌ای برای نمایش وجود ندارد." />
                )}
            </section>

            <section>
                <SectionHeader
                    eyebrow="Featured Tutors"
                    title="اساتید منتخب"
                    href={routes.tutors}
                />

                {tutorsQuery.isLoading ? (
                    <CardSkeletonGrid />
                ) : tutorsQuery.isError ? (
                    <EmptyState message="دریافت اطلاعات اساتید از سرور با خطا مواجه شد." />
                ) : tutorsQuery.data && tutorsQuery.data.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-3">
                        {tutorsQuery.data.map((tutor) => (
                            <TutorCard key={tutor.id} tutor={tutor} />
                        ))}
                    </div>
                ) : (
                    <EmptyState message="هنوز استادی برای نمایش وجود ندارد." />
                )}
            </section>

            <section>
                <SectionHeader
                    eyebrow="Latest Articles"
                    title="آخرین مقالات بلاگ"
                    href={routes.blog}
                />

                {blogsQuery.isLoading ? (
                    <CardSkeletonGrid />
                ) : blogsQuery.isError ? (
                    <EmptyState message="دریافت مقالات بلاگ از سرور با خطا مواجه شد." />
                ) : blogsQuery.data && blogsQuery.data.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-3">
                        {blogsQuery.data.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <EmptyState message="هنوز مقاله‌ای برای نمایش وجود ندارد." />
                )}
            </section>
        </div>
    );
}