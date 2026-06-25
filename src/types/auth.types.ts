export type UserRole = "student" | "tutor" | "admin";

export interface AuthUser {
    id: number | string;
    email: string;
    role: UserRole;

    name?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;

    is_teacher?: boolean;
    approved_is?: boolean;
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    is_teacher: boolean;
}

export interface AuthUserResponse {
    user?: Partial<AuthUser>;
    detail?: string;
    message?: string;
}