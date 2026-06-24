import { api } from "@/services/api";
import type { Tutor } from "@/types/tutor.types";

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

export async function getTutors(): Promise<Tutor[]> {
    const response = await api.get<Tutor[] | PaginatedResponse<Tutor>>(
        "/tutors/"
    );

    return extractList(response.data);
}

export async function getFeaturedTutors(): Promise<Tutor[]> {
    const tutors = await getTutors();

    const approvedTutors = tutors.filter((tutor) => tutor.approved_is !== false);

    return approvedTutors.slice(0, 3);
}