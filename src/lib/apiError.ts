import axios from "axios";

interface ApiErrorResponse {
    detail?: string;
    message?: string;
    error?: string;
    non_field_errors?: string[];
    email?: string[];
    password?: string[];
    name?: string[];
}

export function getApiErrorMessage(error: unknown): string {
    if (!axios.isAxiosError<ApiErrorResponse>(error)) {
        return "خطای غیرمنتظره‌ای رخ داد.";
    }

    const data = error.response?.data;

    if (!data) {
        return "ارتباط با سرور برقرار نشد.";
    }

    if (data.detail) {
        return data.detail;
    }

    if (data.message) {
        return data.message;
    }

    if (data.error) {
        return data.error;
    }

    if (data.non_field_errors?.length) {
        return data.non_field_errors[0];
    }

    if (data.email?.length) {
        return data.email[0];
    }

    if (data.password?.length) {
        return data.password[0];
    }

    if (data.name?.length) {
        return data.name[0];
    }

    return "درخواست با خطا مواجه شد.";
}