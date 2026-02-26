import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api';

export const OAuth2RedirectHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            localStorage.setItem('authToken', token);

            apiClient.get('/users/me')
                .then(res => {
                    const { email, fullName, role } = res.data;
                    setAuth({ email, fullName, role }, token);
                    navigate('/profile');
                })
                .catch(() => {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                });
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, setAuth]);

    return (
        <div className="flex flex-col items-center justify-center mt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Завершение авторизации...</p>
        </div>
    );
};