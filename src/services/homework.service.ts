import { api } from "@/services/api";
import { initializeAccessToken } from "@/services/auth.service";

export type Homework = {
    id?: string | number;
    title?: string;
    name?: string;
    description?: string;
    document?: string;
    file?: string;
    homework_file?: string;
    due_date?: string;
    created_at?: string;
    updated_at?: string;
    lesson?: unknown;
    course?: unknown;
};

export type SubmittedHomework = {
    id: string;
    homework_id: string | number;
    title: string;
    course_title?: string;
    lesson_title?: string;
    answer: string;
    submitted_at: string;
    status: "sent";
};

export type SubmitHomeworkPayload = {
    homework_id: string | number;
    title: string;
    course_title?: string;
    lesson_title?: string;
    answer: string;
};

type HomeworkApiResponse =
    | Homework[]
    | {
    results?: Homework[];
};

type StudentDashboardApiResponse = {
    student?: {
        student_homework_completed?: unknown;
        student_homework_sent?: unknown;
    };
};

function isSubmittedHomework(value: unknown): value is SubmittedHomework {
    return (
        typeof value === "object" &&
        value !== null &&
        "homework_id" in value &&
        "title" in value &&
        "answer" in value
    );
}

function normalizeSubmittedHomeworks(value: unknown): SubmittedHomework[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter(isSubmittedHomework);
}

export async function getHomeworks(): Promise<Homework[]> {
    initializeAccessToken();

    const response = await api.get<HomeworkApiResponse>("/homeworks/");
    const data = response.data;

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.results)) {
        return data.results;
    }

    return [];
}

export async function getSubmittedHomeworks(): Promise<SubmittedHomework[]> {
    initializeAccessToken();

    const response = await api.get<StudentDashboardApiResponse>(
        "/students/me/dashboard/"
    );

    return normalizeSubmittedHomeworks(
        response.data.student?.student_homework_completed
    );
}

export async function submitHomeworkAnswer(
    payload: SubmitHomeworkPayload
): Promise<SubmittedHomework> {
    initializeAccessToken();

    const currentSubmittedHomeworks = await getSubmittedHomeworks();

    const submittedHomework: SubmittedHomework = {
        id: `${payload.homework_id}-${Date.now()}`,
        homework_id: payload.homework_id,
        title: payload.title,
        course_title: payload.course_title,
        lesson_title: payload.lesson_title,
        answer: payload.answer,
        submitted_at: new Date().toISOString(),
        status: "sent",
    };

    const nextSubmittedHomeworks = [
        submittedHomework,
        ...currentSubmittedHomeworks,
    ];

    await api.patch("/students/me/profile/", {
        student_homework_completed: nextSubmittedHomeworks,
        student_homework_sent: nextSubmittedHomeworks,
    });

    return submittedHomework;
}