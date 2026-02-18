import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { InputField } from '../components/InputField';
import axios from 'axios';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // Валидация
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

            // Получаем токен из ответа
            const { token } = response.data;

            // Сохраняем токен в localStorage
            localStorage.setItem('authToken', token);

            console.log('Успешный вход, токен сохранен:', token);

            // Перенаправляем на главную страницу
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
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-5 text-center">Войти в аккаунт</h2>
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <InputField label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <InputField label="Пароль" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Войти
                    </button>
                </div>
            </form>
        </div>
    );
};