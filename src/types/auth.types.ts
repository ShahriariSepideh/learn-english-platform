export type UserRole = "student" | "tutor" | "admin";

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    approved_is?: boolean;
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}