import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { InputField } from '../components/InputField';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * Страница авторизации пользователя.
 * После успешного входа данные сохраняются в Zustand store и localStorage.
 */
export const LoginPage = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError('Пожалуйста, заполните все поля.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Введите корректный email (например: example@mail.com)');
            return;
        }

        try {
            const response = await apiClient.post('/auth/login', {
                email,
                password,
            });

            const { token, email: userEmail, fullName, role } = response.data;

            setAuth({ email: userEmail, fullName, role }, token);

            localStorage.setItem('authToken', token);

            console.log('Успешный вход', token);

            navigate('/');

        } catch (err) {
            console.error('Ошибка входа:', err);

            if (axios.isAxiosError(err) && err.response) {
                if (err.response.status === 403) {
                    setError('Неверный email или пароль.');
                } else {
                    setError(err.response.data.message || 'Произошла ошибка при входе.');
                }
            } else {
                setError('Не удалось подключиться к серверу.');
            }
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Вход в CraftHub</h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <InputField
                    label="Email"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <InputField
                    label="Пароль"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    Войти
                </button>
            </form>

            <div className="mt-6">
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Или войти через</span></div>
                </div>

                <a
                    href="http://localhost:8080/oauth2/authorization/google"
                    className="w-full flex justify-center items-center py-3 px-4 border-2 border-slate-100 rounded-2xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                    <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5 mr-3" alt="Google" />
                    Google Аккаунт
                </a>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
                Нет аккаунта?{' '}
                <button
                    onClick={() => navigate('/register')}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                    Зарегистрироваться
                </button>
            </div>
        </div>
    );
};