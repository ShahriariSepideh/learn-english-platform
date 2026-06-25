import { api } from "@/services/api";
import { initializeAccessToken } from "@/services/auth.service";
import type {
    StudentProfileResponse,
    StudentProfileUser,
} from "@/types/student.types";

function normalizeStudentDashboard(data: unknown): StudentProfileUser {
    if (typeof data !== "object" || data === null) {
        return {};
    }

    const record = data as Record<string, unknown>;

    if (
        "user" in record &&
        typeof record.user === "object" &&
        record.user !== null
    ) {
        return record.user as StudentProfileUser;
    }

    if (
        "student" in record &&
        typeof record.student === "object" &&
        record.student !== null
    ) {
        return {
            student: record.student as StudentProfileUser["student"],
        };
    }

    return data as StudentProfileUser;
}

export async function getStudentProfile(): Promise<StudentProfileUser> {
    initializeAccessToken();

    const response = await api.get<StudentProfileResponse | StudentProfileUser>(
        "/students/me/dashboard/"
    );

    return normalizeStudentDashboard(response.data);
}