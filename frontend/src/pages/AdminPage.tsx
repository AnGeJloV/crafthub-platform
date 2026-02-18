import { useEffect, useState } from 'react';
import apiClient from '../api';
import axios from 'axios';
import { SecureImage } from '../components/SecureImage';

/**
 * Интерфейс заявки, приходящей с бэкенда
 */
interface VerificationRequest {
    id: number;
    legalInfo: string;
    documentUrl: string;
    status: string;
    user: {
        fullName: string;
        email: string;
    };
}

/**
 * Страница администратора для управления верификацией продавцов.
 */
export const AdminPage = () => {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Состояния для модального окна
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [scale, setScale] = useState(1);

    /**
     * Загрузка списка ожидающих заявок
     */
    const fetchRequests = async () => {
        try {
            const response = await apiClient.get('/verification/pending');
            setRequests(response.data);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.status === 403
                    ? 'Доступ запрещен. Нужны права администратора.'
                    : 'Ошибка при загрузке заявок');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Функция обработки прокрутки колесика
    const handleWheel = (e: React.WheelEvent) => {
        const zoomStep = 0.2;
        const minScale = 1;
        const maxScale = 5;

        if (e.deltaY < 0) {
            setScale((prev) => Math.min(prev + zoomStep, maxScale));
        } else {
            setScale((prev) => Math.max(prev - zoomStep, minScale));
        }
    };

    /**
     * Обработка решения админа (Одобрить/Отклонить)
     */
    const handleDecision = async (id: number, status: 'approve' | 'reject') => {
        let reason = '';
        if (status === 'reject') {
            const input = prompt('Укажите причину отказа (обязательно):');
            if (input === null) return; // Нажал "Отмена"
            if (input.trim() === '') {
                alert('Причина отказа не может быть пустой');
                return;
            }
            reason = input;
        }

        try {
            await apiClient.post(`/verification/${id}/${status}`, status === 'reject' ? { reason } : {});
            // Удаляем заявку из локального списка после успешного действия
            setRequests(prev => prev.filter(req => req.id !== id));
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            alert('Не удалось выполнить действие на сервере');
        }
    };

    const closePortal = () => {
        setSelectedImage(null);
        setScale(1);
    };

    if (loading) return <div className="text-center mt-20 text-gray-500 animate-pulse">Загрузка очереди заявок...</div>;
    if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

    return (
        <div className="container mx-auto mt-8 px-4 pb-20">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900">Верификация продавцов</h1>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
          Ожидают проверки: {requests.length}
        </span>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 text-lg">Новых заявок пока нет. Все пользователи проверены!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col lg:flex-row transition-hover hover:shadow-md">

                            {/* Левая часть: Данные пользователя */}
                            <div className="p-6 lg:w-2/5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100">
                                <div>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">ID Заявки: {req.id}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">{req.user.fullName}</h3>
                                    <p className="text-indigo-600 text-sm mb-6">{req.user.email}</p>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Предоставленные данные</h4>
                                        <p className="text-slate-700 text-sm italic leading-relaxed">"{req.legalInfo}"</p>
                                    </div>
                                </div>

                                <div className="flex space-x-3 mt-8">
                                    <button
                                        onClick={() => handleDecision(req.id, 'approve')}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm active:scale-95"
                                    >
                                        Одобрить
                                    </button>
                                    <button
                                        onClick={() => handleDecision(req.id, 'reject')}
                                        className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded-xl transition-all active:scale-95"
                                    >
                                        Отклонить
                                    </button>
                                </div>
                            </div>

                            {/* Правая часть: Превью документа */}
                            <div
                                className="bg-gray-50 lg:w-3/5 p-6 flex flex-col items-center justify-center cursor-zoom-in group relative"
                                onClick={() => setSelectedImage(req.documentUrl)}
                            >
                                <div className="relative w-full h-64 lg:h-80 flex items-center justify-center overflow-hidden rounded-lg bg-white shadow-inner border border-gray-200">
                                    <SecureImage
                                        src={req.documentUrl}
                                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                        alt="Документ для проверки"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-hidden"
                    onClick={closePortal}
                    onWheel={handleWheel}
                >
                    <button className="absolute top-6 right-6 text-white text-5xl z-[110]">&times;</button>

                    <div
                        className="relative transition-transform duration-200 ease-out"
                        style={{ transform: `scale(${scale})` }}
                        onClick={(e) => e.stopPropagation()} // Чтобы клик по фото не закрывал окно
                    >
                        <SecureImage
                            src={selectedImage}
                            className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl rounded-lg pointer-events-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};