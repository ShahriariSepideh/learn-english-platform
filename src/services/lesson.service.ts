import { api } from "@/services/api";
import { initializeAccessToken } from "@/services/auth.service";

export type Lesson = {
    id?: string | number;
    title?: string;
    name?: string;
    description?: string;
    content?: string;
    video_url?: string;
    video?: string;
    file?: string;
    document?: string;
    created_at?: string;
    updated_at?: string;
    course?: unknown;
};

type LessonApiResponse =
    | Lesson[]
    | {
    results?: Lesson[];
};

export type CourseSummary = {
    id?: string | number;
    title?: string;
    name?: string;
    description?: string;
};

function getLessonCourseId(lesson: Lesson): string | null {
    const course = lesson.course;

    if (typeof course === "string" || typeof course === "number") {
        return String(course);
    }

    if (typeof course === "object" && course !== null) {
        const courseRecord = course as Record<string, unknown>;
        const courseId = courseRecord.id;

        if (typeof courseId === "string" || typeof courseId === "number") {
            return String(courseId);
        }
    }

    return null;
}

export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
    initializeAccessToken();

    const response = await api.get<LessonApiResponse>(`/lessons/?course=${courseId}`);
    const data = response.data;

    const lessons = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
            ? data.results
            : [];

    return lessons.filter((lesson) => {
        const lessonCourseId = getLessonCourseId(lesson);

        if (!lessonCourseId) {
            return true;
        }

        return lessonCourseId === courseId;
    });
}

export async function getCourseDetail(courseId: string): Promise<CourseSummary> {
    initializeAccessToken();

    const response = await api.get<CourseSummary>(`/courses/${courseId}/`);

    return response.data;
}