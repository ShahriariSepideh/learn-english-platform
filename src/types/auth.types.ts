export type UserRole = "student" | "tutor" | "admin";

export interface AuthUser {
    id: number | string;
    name?: string;
    full_name?: string;
    email: string;
    role: UserRole;
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
    name: string;
    email: string;
    password: string;
    role: Exclude<UserRole, "admin">;
}

export interface AuthUserResponse {
    user?: AuthUser;
    detail?: string;
    message?: string;
}