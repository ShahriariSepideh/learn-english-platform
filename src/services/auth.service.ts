import { api } from "@/services/api";
import type {
    AuthUser,
    AuthUserResponse,
    LoginRequest,
    RegisterRequest,
} from "@/types/auth.types";

function extractUser(data: AuthUser | AuthUserResponse): AuthUser | null {
    if ("email" in data && "role" in data) {
        return data;
    }

    return data.user ?? null;
}

export async function loginUser(payload: LoginRequest): Promise<AuthUser | null> {
    const response = await api.post<AuthUser | AuthUserResponse>(
        "/login/",
        payload
    );

    return extractUser(response.data);
}

export async function registerUser(
    payload: RegisterRequest
): Promise<AuthUser | null> {
    const response = await api.post<AuthUser | AuthUserResponse>(
        "/register/",
        payload
    );

    return extractUser(response.data);
}

export async function getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<AuthUser>("/me/");

    return response.data;
}

export async function logoutUser(): Promise<void> {
    await api.post("/logout/");
}