export interface BlogPost {
    id: number | string;
    title: string;
    summary?: string;
    excerpt?: string;
    content?: string;
    author?:
        | string
        | {
        id?: number | string;
        name?: string;
        full_name?: string;
    };
    published_at?: string;
    created_at?: string;
    image?: string | null;
    thumbnail?: string | null;
}