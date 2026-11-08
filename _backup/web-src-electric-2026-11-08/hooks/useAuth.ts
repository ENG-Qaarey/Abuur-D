"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export function useAuth() {
    const { user, token, isAuthenticated, logout, setAuth } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push(ROUTES.HOME);
    };

    return {
        user,
        token,
        isAuthenticated,
        logout: handleLogout,
        setAuth,
    };
}
