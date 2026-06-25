import axios from "axios";

type ApiErrorValue =
    | string
    | string[]
    | Record<string, unknown>
    | null
    | undefined;

type ApiErrorResponse = Record<string, ApiErrorValue>;

const fieldLabels: Record<string, string> = {
    detail: "",
    message: "",
    error: "",
    non_field_errors: "",
    email: "ایمیل",
    password: "رمز عبور",
    name: "نام",
    first_name: "نام",
    last_name: "نام خانوادگی",
    is_teacher: "نوع حساب",
    role: "نقش کاربر",
};

function extractMessageFromValue(value: ApiErrorValue): string | null {
    if (!value) {
        return null;
    }

    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value) && value.length > 0) {
        return value[0];
    }

    return null;
}

export function getApiErrorMessage(error: unknown): string {
    if (!axios.isAxiosError<ApiErrorResponse | string>(error)) {
        return "خطای غیرمنتظره‌ای رخ داد.";
    }

    const data = error.response?.data;

    if (!data) {
        return "ارتباط با سرور برقرار نشد.";
    }

    if (typeof data === "string") {
        return data;
    }

    const priorityFields = [
        "detail",
        "message",
        "error",
        "non_field_errors",
        "email",
        "password",
        "first_name",
        "last_name",
        "is_teacher",
        "name",
        "role",
    ];

    for (const field of priorityFields) {
        const message = extractMessageFromValue(data[field]);

        if (message) {
            const label = fieldLabels[field];

            return label ? `${label}: ${message}` : message;
        }
    }

    for (const [field, value] of Object.entries(data)) {
        const message = extractMessageFromValue(value);

        if (message) {
            const label = fieldLabels[field] ?? field;

            return `${label}: ${message}`;
        }
    }

    return "درخواست با خطا مواجه شد.";
}