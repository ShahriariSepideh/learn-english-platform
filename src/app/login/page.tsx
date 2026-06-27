import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-6 py-12 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_34%)] transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.12),_transparent_34%)]" />

            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] transition-colors duration-300 dark:bg-slate-950/40" />

            <div className="relative z-10 flex w-full flex-col items-center">
                <LoginForm />

                <div className="mt-5">
                    <ThemeToggle />
                </div>
            </div>
        </main>
    );
}