'use client';

export default function AuthCard({ children, title }: { children: React.ReactNode; title: string; }) {
    return (
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
            <h1 className="text-2xl font-bold text-center mb-8">{title}</h1>
            {children}
        </div>
    );
}


