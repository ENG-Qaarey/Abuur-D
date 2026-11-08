"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full font-[Inter,sans-serif]">
            {children}
        </div>
    );
}
