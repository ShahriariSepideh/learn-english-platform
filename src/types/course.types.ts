export interface CourseTutor {
    id?: number | string;
    name?: string;
    full_name?: string;
    email?: string;
}

export interface Course {
    id: number | string;
    title: string;
    description?: string;
    short_description?: string;
    level?: string;
    category?: string;
    status?: string;
    thumbnail?: string | null;
    image?: string | null;
    price?: number | string | null;
    tutor?: CourseTutor | string | null;
}