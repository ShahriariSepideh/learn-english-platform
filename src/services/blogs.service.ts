import { api } from "@/services/api";

export type Blog = {
    id: number | string;
    title?: string;
    author?: string;
    description?: string;
    content?: string;
    category?: string;
    difficulty_level?: string;
    featured?: boolean;
    created_at?: string;
    updated_at?: string;
    picture?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function normalizeBlogs(data: unknown): Blog[] {
    if (Array.isArray(data)) return data as Blog[];

    if (isRecord(data)) {
        if (Array.isArray(data.results)) return data.results as Blog[];
        if (Array.isArray(data.blogs)) return data.blogs as Blog[];
        if (Array.isArray(data.data)) return data.data as Blog[];
    }

    return [];
}

export async function getBlogs(): Promise<Blog[]> {
    const response = await api.get<unknown>("/blogs/");
    return normalizeBlogs(response.data);
}

export function getBlogTitle(blog: Blog): string {
    return blog.title || `مقاله ${blog.id}`;
}

export function getBlogDescription(blog: Blog): string {
    return cleanText(blog.description || blog.content || "توضیحی برای این مقاله ثبت نشده است.");
}

export function getBlogAuthor(blog: Blog): string {
    return blog.author || "نویسنده نامشخص";
}

export function getBlogCategory(blog: Blog): string {
    return blog.category || "دسته‌بندی نشده";
}

export function getBlogDifficulty(blog: Blog): string {
    return blog.difficulty_level || "سطح نامشخص";
}

export function getBlogImage(blog: Blog): string | null {
    return blog.picture || null;
}

export function getBlogDate(blog: Blog): string {
    if (!blog.created_at) return "تاریخ نامشخص";

    try {
        return new Intl.DateTimeFormat("fa-IR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(new Date(blog.created_at));
    } catch {
        return "تاریخ نامشخص";
    }
}

export function getBlogReadingTime(blog: Blog): string {
    const text = cleanText(blog.content || blog.description || "");
    const wordsCount = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordsCount / 180));

    return `${minutes} دقیقه مطالعه`;
}

function cleanText(value: string): string {
    return value.replace(/\r\n/g, " ").replace(/\s+/g, " ").trim();
}