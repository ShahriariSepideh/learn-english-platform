import { api } from "@/services/api";
import { initializeAccessToken } from "@/services/auth.service";

export type CourseTutorUser = {
    id?: number | string;
    email?: string;
    first_name?: string;
    last_name?: string;
};

export type CourseTutor = {
    id?: number | string;
    first_name?: string;
    last_name?: string;
    name?: string;
    full_name?: string;
    email?: string;
    user?: number | string | CourseTutorUser;
    profile_picture?: string | null;
    languages_spoken?: string[] | Record<string, string>;
    subjects?: unknown[];
};

export type Course = {
    id: number | string;
    courseId?: string;
    title?: string;
    name?: string;
    description?: string;
    short_description?: string;
    detail?: string;
    requirements?: string;
    materials?: string;
    thumbnail?: string | null;
    image?: string | null;
    cover?: string | null;
    language_flag?: string | null;
    tutor?: CourseTutor | string | number | null;
    teacher?: CourseTutor | string | number | null;
    instructor?: CourseTutor | string | number | null;
    level?: string;
    difficulty_level?: string;
    category?: string;
    language?: string;
    price?: number | string | null;
    price_per_hour?: number | string | null;
    price_per_dollar?: number | string | null;
    price_per_toman?: number | string | null;
    schedule_day?: string;
    schedule_start?: string;
    schedule_end?: string;
    capacity?: number;
    active_students?: number;
    length?: number;
    course_duration?: number;
    status?: string;
};

export type EnrollInCoursePayload = {
    courseId: number | string;
    paymentAmount: string;
    paymentProof: File;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function normalizeCourses(data: unknown): Course[] {
    if (Array.isArray(data)) {
        return data as Course[];
    }

    if (isRecord(data)) {
        if (Array.isArray(data.results)) {
            return data.results as Course[];
        }

        if (Array.isArray(data.courses)) {
            return data.courses as Course[];
        }

        if (Array.isArray(data.data)) {
            return data.data as Course[];
        }
    }

    return [];
}

function normalizeTutors(data: unknown): CourseTutor[] {
    if (Array.isArray(data)) {
        return data as CourseTutor[];
    }

    if (isRecord(data)) {
        if (Array.isArray(data.results)) {
            return data.results as CourseTutor[];
        }

        if (Array.isArray(data.tutors)) {
            return data.tutors as CourseTutor[];
        }

        if (Array.isArray(data.data)) {
            return data.data as CourseTutor[];
        }
    }

    return [];
}

function getTutorId(value: CourseTutor | string | number | null | undefined): string {
    if (!value) return "";

    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    return String(value.id ?? "");
}

function enrichCoursesWithTutorNames(courses: Course[], tutors: CourseTutor[]): Course[] {
    const tutorsById = new Map<string, CourseTutor>();

    tutors.forEach((tutor) => {
        const tutorId = String(tutor.id ?? "");

        if (tutorId) {
            tutorsById.set(tutorId, tutor);
        }
    });

    return courses.map((course) => {
        const currentTutor = course.tutor ?? course.teacher ?? course.instructor;
        const tutorId = getTutorId(currentTutor);
        const fullTutor = tutorId ? tutorsById.get(tutorId) : undefined;

        if (!fullTutor) {
            return course;
        }

        return {
            ...course,
            tutor: {
                ...(typeof currentTutor === "object" && currentTutor !== null ? currentTutor : {}),
                ...fullTutor,
            },
        };
    });
}

export async function getCourses(): Promise<Course[]> {
    const coursesResponse = await api.get<unknown>("/courses/");
    const courses = normalizeCourses(coursesResponse.data);

    try {
        const tutorsResponse = await api.get<unknown>("/tutors/");
        const tutors = normalizeTutors(tutorsResponse.data);

        return enrichCoursesWithTutorNames(courses, tutors);
    } catch {
        return courses;
    }
}

export async function enrollInCourse(payload: EnrollInCoursePayload) {
    initializeAccessToken();

    const formData = new FormData();

    formData.append("course", String(payload.courseId));
    formData.append("payment_amount", payload.paymentAmount);
    formData.append("currency", "toman");
    formData.append("payment_proof", payload.paymentProof, payload.paymentProof.name);

    return api.post("/enrollments/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function getCourseTitle(course: Course): string {
    return course.title ?? course.name ?? `دوره ${course.id}`;
}

export function getCourseDescription(course: Course): string {
    return (
        course.short_description ??
        course.description ??
        "توضیحی برای این دوره ثبت نشده است."
    );
}

export function getCourseImage(course: Course): string | null {
    return course.thumbnail ?? course.image ?? course.cover ?? null;
}

export function getCourseTutorName(course: Course): string {
    const tutor = course.tutor ?? course.teacher ?? course.instructor;

    if (!tutor) {
        return "استاد نامشخص";
    }

    if (typeof tutor === "string" || typeof tutor === "number") {
        return `استاد شماره ${tutor}`;
    }

    if (typeof tutor.user === "object" && tutor.user !== null) {
        const firstName = tutor.user.first_name ?? "";
        const lastName = tutor.user.last_name ?? "";
        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName) return fullName;
        if (tutor.user.email) return tutor.user.email;
    }

    const fullName =
        tutor.full_name ??
        tutor.name ??
        `${tutor.first_name ?? ""} ${tutor.last_name ?? ""}`.trim();

    return fullName || tutor.email || `استاد شماره ${tutor.id ?? "-"}`;
}

export function getCourseLevel(course: Course): string {
    return course.level ?? course.difficulty_level ?? course.category ?? "سطح نامشخص";
}

export function getCourseTomanPrice(course: Course): string {
    const value = course.price_per_toman ?? course.price ?? "0";

    return String(value);
}

export function formatTomanPrice(course: Course): string {
    const value = getCourseTomanPrice(course);

    if (!value || value === "0") {
        return "مبلغ نامشخص";
    }

    return `${value} تومان`;
}