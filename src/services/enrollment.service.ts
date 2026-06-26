import { api } from "@/services/api";
import { initializeAccessToken } from "@/services/auth.service";

export type EnrollmentStatus = "pending" | "approved" | "rejected" | string;

export type EnrollmentCourse = {
    id?: number | string;
    title?: string;
    name?: string;
    description?: string;
};

export type MyEnrollment = {
    id?: number | string;
    status?: EnrollmentStatus;
    enrollment_status?: EnrollmentStatus;
    course?: EnrollmentCourse | number | string;
    course_id?: number | string;
    course_title?: string;
    created_at?: string;
};

function normalizeEnrollments(data: unknown): MyEnrollment[] {
    if (Array.isArray(data)) {
        return data as MyEnrollment[];
    }

    if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;

        if (Array.isArray(record.results)) {
            return record.results as MyEnrollment[];
        }

        if (Array.isArray(record.enrollments)) {
            return record.enrollments as MyEnrollment[];
        }

        if (Array.isArray(record.data)) {
            return record.data as MyEnrollment[];
        }
    }

    return [];
}

export async function getMyEnrollments(): Promise<MyEnrollment[]> {
    initializeAccessToken();

    const response = await api.get<unknown>("/enrollments/my/");

    return normalizeEnrollments(response.data);
}

export function getEnrollmentStatus(enrollment: MyEnrollment): EnrollmentStatus {
    return enrollment.status ?? enrollment.enrollment_status ?? "pending";
}

export function getEnrollmentCourseTitle(enrollment: MyEnrollment): string {
    if (
        enrollment.course &&
        typeof enrollment.course === "object" &&
        !Array.isArray(enrollment.course)
    ) {
        return (
            enrollment.course.title ??
            enrollment.course.name ??
            `دوره ${enrollment.course.id ?? ""}`
        );
    }

    return (
        enrollment.course_title ??
        String(enrollment.course ?? enrollment.course_id ?? "دوره بدون عنوان")
    );
}