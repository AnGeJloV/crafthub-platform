import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import apiClient from '../api';
import {InputField} from '../components/InputField';
import axios from "axios";

/**
 * Страница регистрации нового пользователя с валидацией полей
 */

export const RegisterPage = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!email || !password || !fullName || !phoneNumber) {
            setError('Пожалуйста, заполните все поля.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Введите корректный email (например: example@mail.com)');
            return;
        }
        const phoneRegex = /^(\+375|375|\+7|8|7)[0-9]{9,11}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError('Введите корректный номер (напр. +375291234567 или 80291234567)');
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
                phoneNumber,
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
        <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Создать аккаунт</h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <InputField
                    label="Полное имя"
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
                <InputField
                    label="Email"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <InputField
                    label="Номер телефона"
                    id="phoneNumber"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                />
                <InputField
                    label="Пароль"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-indigo-100 text-xs font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all active:scale-[0.98]"
                    >
                        Зарегистрироваться
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
                Уже есть аккаунт?{' '}
                <button
                    onClick={() => navigate('/login')}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                    Войти
                </button>
            </div>
        </div>
    );
};