export interface StudentMiniCourse {
    id: number | string;
    title?: string;
    name?: string;
}

export interface StudentMiniTutor {
    id: number | string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
}

export interface StudentInfo {
    id?: number | string;
    user?: number | string;
    courses_list?: Array<number | string | StudentMiniCourse>;
    favourite_tutors?: Array<number | string | StudentMiniTutor>;
    student_active?: boolean;
    student_homework_completed?: number | Array<unknown>;
}

export interface StudentProfileUser {
    id?: number | string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string | null;
    bio?: string | null;
    profile_picture?: string | null;
    student?: StudentInfo;
}

export interface StudentProfileResponse {
    user?: StudentProfileUser;
}

export interface UpdateStudentProfilePayload {
    first_name: string;
    last_name: string;
    phone_number?: string;
    bio?: string;
}