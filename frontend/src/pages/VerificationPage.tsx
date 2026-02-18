import React, { useState } from 'react';
import apiClient from '../api';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export const VerificationPage = () => {
    const [legalInfo, setLegalInfo] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !legalInfo) {
            setMessage('Заполните все поля и выберите файл');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('legalInfo', legalInfo);
        formData.append('file', file);

        try {
            await apiClient.post('/verification/apply', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage('Заявка успешно подана! Перенаправление...');
            setTimeout(() => navigate('/'), 2000);

        } catch (err) {
            console.error('Ошибка при подаче заявки:', err);
            if (axios.isAxiosError(err) && err.response) {
                setMessage(err.response.data.message || 'Ошибка при подаче заявки');
            } else {
                setMessage('Не удалось подключиться к серверу');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Стать продавцом</h2>
            <p className="text-gray-600 mb-8">
                Для получения статуса продавца, пожалуйста, укажите вашу юридическую информацию
                (УНП/ИНН или данные паспорта для самозанятых) и загрузите подтверждающий документ.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Юридическая информация</label>
                    <textarea
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        rows={3}
                        placeholder="Напр: ИП Иванов И.И., УНП 123456789"
                        value={legalInfo}
                        onChange={(e) => setLegalInfo(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Скан/Фото документа</label>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded ${message.includes('успешно') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                >
                    {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>
            </form>
        </div>
    );
};