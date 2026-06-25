import { api } from "@/services/api";
import type {
    AuthUser,
    AuthUserResponse,
    LoginRequest,
    RegisterRequest,
    UserRole,
} from "@/types/auth.types";

type BackendUser = Partial<AuthUser> & {
    id?: number | string;
    email?: string;
    is_teacher?: boolean;
    role?: UserRole;
};

function getUserRole(user: BackendUser): UserRole {
    if (user.role) {
        return user.role;
    }

    if (user.is_teacher) {
        return "tutor";
    }

    return "student";
}

function getFullName(user: BackendUser): string | undefined {
    if (user.full_name) {
        return user.full_name;
    }

    const firstName = user.first_name ?? "";
    const lastName = user.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
        return fullName;
    }

    return user.name;
}

function normalizeUser(data: BackendUser | AuthUserResponse): AuthUser | null {
    const rawUser: BackendUser =
        "user" in data && data.user ? data.user : (data as BackendUser);

    if (!rawUser.email) {
        return null;
    }

    return {
        ...rawUser,
        id: rawUser.id ?? rawUser.email,
        email: rawUser.email,
        role: getUserRole(rawUser),
        full_name: getFullName(rawUser),
        name: rawUser.name ?? getFullName(rawUser),
    };
}

export async function loginUser(payload: LoginRequest): Promise<AuthUser | null> {
    const response = await api.post<BackendUser | AuthUserResponse>(
        "/login/",
        payload
    );

    return normalizeUser(response.data);
}

export async function registerUser(
    payload: RegisterRequest
): Promise<AuthUser | null> {
    const response = await api.post<BackendUser | AuthUserResponse>(
        "/register/",
        payload
    );

    return normalizeUser(response.data);
}

export async function getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<BackendUser | AuthUserResponse>("/me/");
    const user = normalizeUser(response.data);

    if (!user) {
        throw new Error("اطلاعات کاربر از سرور دریافت نشد.");
    }

    return user;
}

export async function logoutUser(): Promise<void> {
    await api.post("/logout/");
}