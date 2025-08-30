'use client';

export default function BackgroundAccents() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 -left-20 h-72 w-72 bg-blue-600/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -right-20 h-72 w-72 bg-purple-600/20 blur-3xl rounded-full" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),rgba(0,0,0,0)_60%)]" />
        </div>
    );
}


