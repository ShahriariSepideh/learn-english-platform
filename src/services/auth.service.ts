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
    is_student?: boolean;
    is_staff?: boolean;
    role?: UserRole;
    access?: string;
    refresh?: string;
};

type BackendAuthResponse = AuthUserResponse &
    BackendUser & {
    user?: BackendUser;
    access?: string;
    refresh?: string;
    tokens?: {
        access?: string;
        refresh?: string;
    };
};

function getUserRole(user: BackendUser): UserRole {
    if (user.role) {
        return user.role;
    }

    if (user.is_staff) {
        return "admin";
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

function saveAccessToken(data: BackendAuthResponse) {
    const accessToken = data.access ?? data.tokens?.access;

    if (!accessToken) {
        return;
    }

    localStorage.setItem("access_token", accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

function clearAccessToken() {
    localStorage.removeItem("access_token");
    delete api.defaults.headers.common.Authorization;
}

export function initializeAccessToken() {
    if (typeof window === "undefined") {
        return;
    }

    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }
}

function normalizeUser(data: BackendUser | BackendAuthResponse): AuthUser | null {
    const rawUser: BackendUser =
        "user" in data && data.user ? data.user : (data as BackendUser);

    if (!rawUser.email) {
        return null;
    }

    const fullName = getFullName(rawUser);

    return {
        ...rawUser,
        id: rawUser.id ?? rawUser.email,
        email: rawUser.email,
        role: getUserRole(rawUser),
        full_name: fullName,
        name: rawUser.name ?? fullName,
    };
}

export async function loginUser(payload: LoginRequest): Promise<AuthUser> {
    const response = await api.post<BackendAuthResponse>("/login/", payload);

    saveAccessToken(response.data);

    const userFromLoginResponse = normalizeUser(response.data);

    if (userFromLoginResponse) {
        return userFromLoginResponse;
    }

    return getCurrentUser();
}

export async function registerUser(
    payload: RegisterRequest
): Promise<AuthUser | null> {
    const response = await api.post<BackendAuthResponse>("/register/", payload);

    const user = normalizeUser(response.data);

    return user;
}

export async function getCurrentUser(): Promise<AuthUser> {
    initializeAccessToken();

    const response = await api.get<BackendAuthResponse>("/me/");
    const user = normalizeUser(response.data);

    if (!user) {
        throw new Error("اطلاعات کاربر از سرور دریافت نشد.");
    }

    return user;
}

export async function logoutUser(): Promise<void> {
    try {
        await api.post("/logout/");
    } finally {
        clearAccessToken();
    }
}