import { api } from "@/services/api";
import { initializeAccessToken } from "@/services/auth.service";
import type {
    StudentInfo,
    StudentProfileResponse,
    StudentProfileUser,
    UpdateStudentProfilePayload,
} from "@/types/student.types";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getStringOrUndefined(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    return value;
}

function normalizeUserData(data: unknown): StudentProfileUser {
    if (!isRecord(data)) {
        return {};
    }

    if (isRecord(data.user)) {
        const user = data.user as StudentProfileUser;

        return {
            ...user,
            student: isRecord(data.student)
                ? (data.student as StudentInfo)
                : user.student,
        };
    }

    if (isRecord(data.profile)) {
        return data.profile as StudentProfileUser;
    }

    return data as StudentProfileUser;
}

function extractStudentInfo(data: unknown): StudentInfo | undefined {
    if (!isRecord(data)) {
        return undefined;
    }

    if (isRecord(data.student)) {
        return data.student as StudentInfo;
    }

    if (isRecord(data.dashboard)) {
        const dashboard = data.dashboard;

        if (isRecord(dashboard.student)) {
            return dashboard.student as StudentInfo;
        }

        return dashboard as StudentInfo;
    }

    if (
        "courses_list" in data ||
        "favourite_tutors" in data ||
        "student_active" in data ||
        "student_homework_completed" in data
    ) {
        return data as StudentInfo;
    }

    return undefined;
}

function mergeStudentProfile(
    base: StudentProfileUser,
    next: StudentProfileUser
): StudentProfileUser {
    const nextPhoneNumber = getStringOrUndefined(next.phone_number);
    const nextBio = getStringOrUndefined(next.bio);
    const nextProfilePicture = getStringOrUndefined(next.profile_picture);

    return {
        ...base,
        ...next,
        student: {
            ...(base.student ?? {}),
            ...(next.student ?? {}),
        },
        phone_number:
            nextPhoneNumber && nextPhoneNumber.trim() !== ""
                ? nextPhoneNumber
                : base.phone_number ?? "",
        bio:
            nextBio && nextBio.trim() !== ""
                ? nextBio
                : base.bio ?? "",
        profile_picture:
            nextProfilePicture && nextProfilePicture.trim() !== ""
                ? nextProfilePicture
                : base.profile_picture ?? null,
    };
}

function normalizeStudentProfile(
    data: StudentProfileResponse | StudentProfileUser
): StudentProfileUser {
    return normalizeUserData(data);
}

export async function getStudentProfile(): Promise<StudentProfileUser> {
    initializeAccessToken();

    const [meResult, dashboardResult] = await Promise.allSettled([
        api.get<unknown>("/me/"),
        api.get<unknown>("/students/me/dashboard/"),
    ]);

    let profile: StudentProfileUser = {};

    if (meResult.status === "fulfilled") {
        const meUser = normalizeUserData(meResult.value.data);
        const meStudent = extractStudentInfo(meResult.value.data);

        profile = mergeStudentProfile(profile, {
            ...meUser,
            student: meStudent ?? meUser.student,
        });
    }

    if (dashboardResult.status === "fulfilled") {
        const dashboardUser = normalizeUserData(dashboardResult.value.data);
        const dashboardStudent = extractStudentInfo(dashboardResult.value.data);

        profile = mergeStudentProfile(profile, {
            ...dashboardUser,
            student: dashboardStudent ?? dashboardUser.student,
        });
    }

    if (meResult.status === "rejected" && dashboardResult.status === "rejected") {
        throw dashboardResult.reason;
    }

    return profile;
}

export async function updateStudentProfile(
    payload: UpdateStudentProfilePayload | FormData
): Promise<StudentProfileUser> {
    initializeAccessToken();

    if (payload instanceof FormData) {
        const response = await api.patch<StudentProfileResponse | StudentProfileUser>(
            "/students/me/profile/",
            payload,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return normalizeStudentProfile(response.data);
    }

    const response = await api.patch<StudentProfileResponse | StudentProfileUser>(
        "/students/me/profile/",
        {
            first_name: payload.first_name,
            last_name: payload.last_name,
            phone_number: payload.phone_number ?? "",
            bio: payload.bio ?? "",
        }
    );

    return normalizeStudentProfile(response.data);
}