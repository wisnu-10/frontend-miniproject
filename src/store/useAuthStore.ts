import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
    // Initialize state from local storage to persist login
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    return {
        user: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken,
        isAuthenticated: !!storedToken,
        login: (user, token) => {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            set({ user, token, isAuthenticated: true });
        },
        logout: () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            set({ user: null, token: null, isAuthenticated: false });
        },
    };
});
