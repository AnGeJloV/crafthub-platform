import React, { useState } from 'react';
import apiClient from '../api';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import toast from 'react-hot-toast';
import { Camera, CheckCircle2, X, Briefcase, User, PenTool, Building } from 'lucide-react';

/**
 * Форма подачи заявки на получение статуса продавца (с динамическими полями и мультизагрузкой)
 */

// Типы продавцов и их конфигурация
type SellerType = 'IP' | 'SELF_EMPLOYED' | 'ARTISAN' | 'COMPANY';

const SELLER_TYPES = [
    { id: 'IP', name: 'Индивидуальный предприниматель', icon: Briefcase, desc: 'Для зарегистрированных ИП' },
    { id: 'SELF_EMPLOYED', name: 'Самозанятый', icon: User, desc: 'Плательщики НПД' },
    { id: 'ARTISAN', name: 'Ремесленник', icon: PenTool, desc: 'Плательщики ремесленного сбора' },
    { id: 'COMPANY', name: 'Юридическое лицо', icon: Building, desc: 'ООО, ЧУП и другие организации' },
];

export const VerificationPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Состояния формы
    const [sellerType, setSellerType] = useState<SellerType | ''>('');
    const [formData, setFormData] = useState<Record<string, string>>({});

    // Состояния файлов (как в AddProductPage)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    // Обработчик изменения текстовых полей
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Обработчик выбора файлов
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);

            // Ограничение на 5 файлов (как в товарах)
            if (selectedFiles.length + filesArray.length > 5) {
                toast.error("Можно загрузить не более 5 фотографий");
                return;
            }

            setSelectedFiles(prev => [...prev, ...filesArray]);
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    // Удаление выбранного файла
    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Отправка формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!sellerType) return toast.error('Выберите тип деятельности');
        if (selectedFiles.length === 0) return toast.error('Загрузите требуемые документы');

        setLoading(true);
        const submitData = new FormData();

        // Формируем красивый JSON для БД
        const legalInfoObj = {
            "Тип_деятельности": SELLER_TYPES.find(t => t.id === sellerType)?.name,
            ...formData
        };

        // Добавляем JSON строку
        submitData.append('legalInfo', JSON.stringify(legalInfoObj, null, 2));

        // Добавляем файлы
        selectedFiles.forEach(file => {
            submitData.append('files', file);
        });

        try {
            await apiClient.post('/verification/apply', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Заявка отправлена на модерацию!');
            navigate('/');
        } catch (err) {
            console.error('Ошибка при подаче заявки:', err);
            if (axios.isAxiosError(err) && err.response) {
                toast.error(err.response.data.message || 'Ошибка при подаче заявки');
            } else {
                toast.error('Не удалось подключиться к серверу');
            }
        } finally {
            setLoading(false);
        }
    };

    // Рендер полей в зависимости от выбранного типа
    const renderDynamicFields = () => {
        if (!sellerType) return null;

        const commonInputClass = "w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold";
        const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";

        switch (sellerType) {
            case 'IP':
                return (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div>
                            <label className={labelClass}>ФИО полностью</label>
                            <input required className={commonInputClass} placeholder="Иванов Иван Иванович" onChange={(e) => handleInputChange("ФИО", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>УНП (9 цифр)</label>
                                <input required maxLength={9} pattern="\d{9}" className={commonInputClass} placeholder="123456789" onChange={(e) => handleInputChange("УНП", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Дата регистрации</label>
                                <input required type="date" className={commonInputClass} onChange={(e) => handleInputChange("Дата_регистрации", e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Юридический адрес</label>
                            <input required className={commonInputClass} placeholder="г. Минск, ул. Ленина, д. 1, кв. 1" onChange={(e) => handleInputChange("Юридический_адрес", e.target.value)} />
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mt-4">
                            <p className="text-xs font-bold text-indigo-800">📸 Требуемые документы:</p>
                            <ul className="text-[10px] text-indigo-600 mt-1 list-disc list-inside">
                                <li>Свидетельство о регистрации ИП</li>
                                <li>Фото паспорта (разворот с фото + прописка)</li>
                            </ul>
                        </div>
                    </div>
                );
            case 'SELF_EMPLOYED':
                return (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div>
                            <label className={labelClass}>ФИО полностью</label>
                            <input required className={commonInputClass} placeholder="Иванов Иван Иванович" onChange={(e) => handleInputChange("ФИО", e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Личный номер паспорта</label>
                            <input required maxLength={14} className={commonInputClass} placeholder="1234567A123PB4" onChange={(e) => handleInputChange("Личный_номер", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Вид деятельности</label>
                                <input required className={commonInputClass} placeholder="Изготовление свечей" onChange={(e) => handleInputChange("Вид_деятельности", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Область / город</label>
                                <input required className={commonInputClass} placeholder="Минская область" onChange={(e) => handleInputChange("Регион", e.target.value)} />
                            </div>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mt-4">
                            <p className="text-xs font-bold text-indigo-800">📸 Требуемые документы:</p>
                            <ul className="text-[10px] text-indigo-600 mt-1 list-disc list-inside">
                                <li>Фото паспорта (разворот с фото)</li>
                            </ul>
                        </div>
                    </div>
                );
            case 'ARTISAN':
                return (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div>
                            <label className={labelClass}>ФИО полностью</label>
                            <input required className={commonInputClass} placeholder="Иванов Иван Иванович" onChange={(e) => handleInputChange("ФИО", e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Личный номер паспорта</label>
                            <input required maxLength={14} className={commonInputClass} placeholder="1234567A123PB4" onChange={(e) => handleInputChange("Личный_номер", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Вид ремесла</label>
                                <input required className={commonInputClass} placeholder="Гончарное дело" onChange={(e) => handleInputChange("Вид_ремесла", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Область / город</label>
                                <input required className={commonInputClass} placeholder="г. Гродно" onChange={(e) => handleInputChange("Регион", e.target.value)} />
                            </div>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mt-4">
                            <p className="text-xs font-bold text-indigo-800">📸 Требуемые документы:</p>
                            <ul className="text-[10px] text-indigo-600 mt-1 list-disc list-inside">
                                <li>Квитанция об уплате ремесленного сбора</li>
                                <li>Фото паспорта (разворот с фото)</li>
                            </ul>
                        </div>
                    </div>
                );
            case 'COMPANY':
                return (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div>
                            <label className={labelClass}>Название организации</label>
                            <input required className={commonInputClass} placeholder="ООО «Крафт Хаб»" onChange={(e) => handleInputChange("Организация", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>УНП (9 цифр)</label>
                                <input required maxLength={9} pattern="\d{9}" className={commonInputClass} placeholder="123456789" onChange={(e) => handleInputChange("УНП", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Должность подписанта</label>
                                <input required className={commonInputClass} placeholder="Директор" onChange={(e) => handleInputChange("Должность", e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>ФИО руководителя</label>
                            <input required className={commonInputClass} placeholder="Иванов Иван Иванович" onChange={(e) => handleInputChange("ФИО_руководителя", e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Юридический адрес</label>
                            <input required className={commonInputClass} placeholder="г. Минск, ул. Ленина, д. 1" onChange={(e) => handleInputChange("Юридический_адрес", e.target.value)} />
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mt-4">
                            <p className="text-xs font-bold text-indigo-800">📸 Требуемые документы:</p>
                            <ul className="text-[10px] text-indigo-600 mt-1 list-disc list-inside">
                                <li>Свидетельство о регистрации юрлица</li>
                                <li>Устав (первая страница)</li>
                                <li>Фото паспорта руководителя</li>
                            </ul>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto mt-10 px-4 max-w-5xl pb-20">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 mb-4">Стать мастером</h1>
                <p className="text-slate-500 max-w-2xl mx-auto font-medium">
                    Заполните юридическую информацию и загрузите документы для прохождения верификации.
                    Мы гарантируем полную безопасность: <span className="text-indigo-600 font-bold">ваши документы будут безвозвратно удалены</span> с серверов сразу после проверки администратором.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-10">

                {/* Левая колонка: Форма данных */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">

                        {/* Выбор типа */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Ваш статус</label>
                            <div className="grid grid-cols-2 gap-3">
                                {SELLER_TYPES.map(type => {
                                    const Icon = type.icon;
                                    const isActive = sellerType === type.id;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => { setSellerType(type.id as SellerType); setFormData({}); }}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all group ${isActive ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-200'}`}
                                        >
                                            <Icon size={24} className={`mb-2 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                                            <h3 className={`font-black text-sm mb-1 ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>{type.name}</h3>
                                            <p className="text-[10px] text-slate-400 font-medium leading-tight">{type.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Динамические поля */}
                        {renderDynamicFields()}
                    </div>
                </div>

                {/* Правая колонка: Загрузка фото */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm sticky top-24">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center">
                            <CheckCircle2 size={18} className="mr-2 text-green-500"/> Загрузка документов
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {previews.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-4 border-slate-50 group">
                                    <img src={url} className="w-full h-full object-cover" alt="Document preview" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}

                            {selectedFiles.length < 5 && (
                                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all text-slate-400 hover:text-indigo-500">
                                    <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                                    <Camera size={24} />
                                    <span className="text-[10px] font-bold mt-2 uppercase text-center px-2">Добавить скан/фото</span>
                                </label>
                            )}
                        </div>

                        <p className="text-[10px] text-slate-400 leading-tight mb-6">
                            * Убедитесь, что текст на фото хорошо читается.<br/>
                            * Можно загрузить до 5 файлов.
                        </p>

                        <button
                            type="submit"
                            disabled={loading || !sellerType || selectedFiles.length === 0}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-[0.97] disabled:bg-slate-200 disabled:shadow-none disabled:text-slate-400"
                        >
                            {loading ? 'ОТПРАВКА...' : 'ПОДАТЬ ЗАЯВКУ'}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};