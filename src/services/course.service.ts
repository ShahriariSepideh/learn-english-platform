import { api } from "@/services/api";
import type { Course } from "@/types/course.types";

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

export async function getCourses(): Promise<Course[]> {
    const response = await api.get<Course[] | PaginatedResponse<Course>>(
        "/courses/"
    );

    return extractList(response.data);
}

export async function getPopularCourses(): Promise<Course[]> {
    const courses = await getCourses();

    return courses.slice(0, 3);
}