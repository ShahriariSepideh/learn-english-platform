import { api } from "@/services/api";
import type { BlogPost } from "@/types/blog.types";

interface PaginatedResponse<T> {
    results?: T[];
    count?: number;
    next?: string | null;
    previous?: string | null;
}

function extractList<T>(data: T[] | PaginatedResponse<T>): T[] {
    if (Array.isArray(data)) {
        return data;
    }

    return data.results ?? [];
}

export async function getBlogPosts(): Promise<BlogPost[]> {
    const response = await api.get<BlogPost[] | PaginatedResponse<BlogPost>>(
        "/blogs/"
    );

    return extractList(response.data);
}

export async function getLatestBlogPosts(): Promise<BlogPost[]> {
    const posts = await getBlogPosts();

    return posts.slice(0, 3);
}