export interface Tutor {
    id: number | string;
    name?: string;
    full_name?: string;
    email?: string;
    bio?: string;
    short_bio?: string;
    introduction?: string;
    languages?: string[] | string;
    specialization?: string;
    profile_image?: string | null;
    video?: string | null;
    approved_is?: boolean;
}