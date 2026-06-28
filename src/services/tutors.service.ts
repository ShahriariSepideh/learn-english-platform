import { api } from "@/services/api";

export type TutorUser = {
    id: number | string;
    email?: string;
    first_name?: string;
    last_name?: string;
};

export type TutorLanguage =
    | string
    | {
    language?: string;
    level?: string;
};

export type TutorCourse = {
    id: number | string;
    course_title?: string;
    duration_minutes?: number;
    course_type?: string;
    price_per_hour?: string;
    language?: string;
    days_available?: string[];
    time_slots?: string[];
    start_date?: string;
    description?: string;
};

export type Tutor = {
    id: number | string;
    user?: TutorUser;
    profile_picture?: string | null;
    languages_spoken?: TutorLanguage[] | Record<string, string>;
    country?: string;
    subjects?: string[];
    phone_number?: string;
    bio?: string;
    teaching_style?: string;
    expectation?: string;
    description?: string;
    intro_video_url?: string;
    intro_video_file?: string | null;
    courses?: TutorCourse[];
    certificates?: unknown[];
    educations?: unknown[];
    experiences?: unknown[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function normalizeTutors(data: unknown): Tutor[] {
    if (Array.isArray(data)) return data as Tutor[];

    if (isRecord(data)) {
        if (Array.isArray(data.results)) return data.results as Tutor[];
        if (Array.isArray(data.tutors)) return data.tutors as Tutor[];
        if (Array.isArray(data.data)) return data.data as Tutor[];
    }

    return [];
}

export async function getTutors(): Promise<Tutor[]> {
    const response = await api.get<unknown>("/tutors/");
    return normalizeTutors(response.data);
}

export function getTutorName(tutor: Tutor): string {
    const firstName = tutor.user?.first_name ?? "";
    const lastName = tutor.user?.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || tutor.user?.email || `استاد ${tutor.id}`;
}

export function getTutorBio(tutor: Tutor): string {
    return (
        tutor.bio ||
        tutor.description ||
        tutor.teaching_style ||
        "توضیحی برای این استاد ثبت نشده است."
    );
}

export function getTutorSubjects(tutor: Tutor): string[] {
    if (!Array.isArray(tutor.subjects)) return [];
    return tutor.subjects.filter(Boolean);
}

export function getTutorLanguages(tutor: Tutor): string[] {
    const value = tutor.languages_spoken;

    if (!value) return [];

    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === "string") return item;

                const language = item.language ?? "";
                const level = item.level ?? "";

                if (language && level) return `${language} (${level})`;
                return language || level;
            })
            .filter(Boolean);
    }

    return Object.entries(value).map(([language, level]) => `${language} (${level})`);
}

export function getTutorPrice(tutor: Tutor): string {
    const firstCourse = tutor.courses?.[0];

    if (!firstCourse?.price_per_hour) return "قیمت ثبت نشده";

    return `${firstCourse.price_per_hour} دلار / ساعت`;
}

export function getTutorCoursesCount(tutor: Tutor): number {
    return tutor.courses?.length ?? 0;
}