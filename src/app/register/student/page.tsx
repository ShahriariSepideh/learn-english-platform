import { RegisterForm } from "@/components/auth/RegisterForm";

export default function StudentRegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 dark:bg-slate-950">
            <RegisterForm role="student" />
        </main>
    );
}