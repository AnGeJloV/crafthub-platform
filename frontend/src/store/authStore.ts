import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    email: string;
    fullName: string;
    role: 'ROLE_USER' | 'ROLE_SELLER' | 'ROLE_ADMIN';
}

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setAuth: (user, token) => set({ user, token }),
            logout: () => {
                set({ user: null, token: null });
                localStorage.removeItem('authToken');
            },
        }),
        {
            name: 'crafthub-auth',
        }
    )
);