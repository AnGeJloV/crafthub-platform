import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { InputField } from '../components/InputField';
import axios from "axios";

export const RegisterPage = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!email || !password || !fullName) {
            setError('Пожалуйста, заполните все поля.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Введите корректный email (например: example@mail.com)');
            return;
        }
        if (password.length < 8) {
            setError('Пароль должен содержать минимум 8 символов.');
            return;
        }

        try {
            // Отправляем POST-запрос на бэкенд
            const response = await apiClient.post('/auth/register', {
                email,
                password,
                fullName,
            });

            console.log('Успешная регистрация:', response.data);
            // Перенаправляем на страницу входа
            navigate('/login');

        } catch (err) {
            console.error('Ошибка регистрации:', err);

            if (axios.isAxiosError(err) && err.response) {
                const errorData = err.response.data;

                if (errorData.details) {
                    const firstErrorMessage = Object.values(errorData.details)[0];
                    setError(firstErrorMessage as string);
                } else {
                    setError(errorData.message || 'Произошла ошибка при регистрации.');
                }
            } else {
                setError('Не удалось подключиться к серверу.');
            }
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-5 text-center">Создать аккаунт</h2>
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <InputField label="Полное имя" id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <InputField label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <InputField label="Пароль" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                {/* Отображение ошибки, если она есть */}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Зарегистрироваться
                    </button>
                </div>
            </form>
        </div>
    );
};