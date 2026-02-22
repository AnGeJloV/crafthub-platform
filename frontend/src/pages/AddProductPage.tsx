import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { Youtube, Camera, CheckCircle2, X } from 'lucide-react';

interface Category {
    id: number;
    displayName: string;
}

export const AddProductPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        categoryId: '',
        youtubeUrl: ''
    });

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);

    useEffect(() => {
        apiClient.get('/categories').then(res => setCategories(res.data));
    }, []);

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);

            if (selectedFiles.length + filesArray.length > 5) {
                alert("Можно загрузить не более 5 фотографий");
                return;
            }

            setSelectedFiles(prev => [...prev, ...filesArray]);

            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index]);

        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        setSelectedFiles(newFiles);
        setPreviews(newPreviews);

        if (mainImageIndex === index) {
            setMainImageIndex(0);
        } else if (mainImageIndex > index) {
            setMainImageIndex(mainImageIndex - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return alert('Добавьте хотя бы одно фото товара');

        const videoId = form.youtubeUrl ? extractYoutubeId(form.youtubeUrl) : null;
        if (form.youtubeUrl && !videoId) {
            return alert('Некорректная ссылка на YouTube видео');
        }

        setLoading(true);
        const formData = new FormData();

        const productData = {
            name: form.name,
            description: form.description,
            price: parseFloat(form.price),
            stockQuantity: parseInt(form.stockQuantity),
            categoryId: parseInt(form.categoryId),
            youtubeVideoId: videoId,
            mainImageIndex: mainImageIndex
        };

        const blob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
        formData.append('product', blob);

        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            await apiClient.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Товар успешно создан и отправлен на модерацию!');
            navigate('/my-products');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            alert('Ошибка при создании товара. Проверьте данные.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto mt-10 px-4 max-w-5xl pb-20">
            <h1 className="text-3xl font-black mb-8 text-slate-900 text-center md:text-left">Добавление изделия</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-10">

                {/* Основная инфо - 3 колонки */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-5">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Название товара</label>
                            <input
                                className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold"
                                required
                                placeholder="Напр: Глиняный кувшин «Осень»"
                                onChange={e => setForm({...form, name: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Цена (BYN)</label>
                                <input
                                    type="number" step="0.01"
                                    className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold"
                                    required
                                    onChange={e => setForm({...form, price: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Количество</label>
                                <input
                                    type="number"
                                    className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold"
                                    required
                                    onChange={e => setForm({...form, stockQuantity: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Категория</label>
                            <select
                                className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold appearance-none"
                                required
                                onChange={e => setForm({...form, categoryId: e.target.value})}
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                                <Youtube size={14} className="mr-1 text-red-500" /> Ссылка на видео YouTube
                            </label>
                            <input
                                className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                                placeholder="https://www.youtube.com/watch?v=..."
                                onChange={e => setForm({...form, youtubeUrl: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Описание</label>
                            <textarea
                                className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                                rows={4}
                                placeholder="Опишите процесс создания или материалы..."
                                onChange={e => setForm({...form, description: e.target.value})}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Загрузка фото - 2 колонки */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Фотографии товара</h3>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {previews.map((url, index) => (
                                <div
                                    key={index}
                                    className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all group ${mainImageIndex === index ? 'border-indigo-500' : 'border-slate-50'}`}
                                >
                                    <img src={url} className="w-full h-full object-cover" alt="" />

                                    {/* Кнопка выбора главного фото */}
                                    <button
                                        type="button"
                                        onClick={() => setMainImageIndex(index)}
                                        className={`absolute top-2 left-2 p-1 rounded-full transition-all ${mainImageIndex === index ? 'bg-indigo-500 text-white' : 'bg-white/80 text-slate-400 hover:text-indigo-500'}`}
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>

                                    {/* Кнопка удаления */}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X size={16} />
                                    </button>

                                    {mainImageIndex === index && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 text-white text-[8px] font-black text-center py-1 uppercase tracking-widest">
                                            Главное фото
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Кнопка добавить еще */}
                            {selectedFiles.length < 5 && (
                                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all text-slate-400 hover:text-indigo-500">
                                    <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                                    <Camera size={24} />
                                    <span className="text-[10px] font-bold mt-2 uppercase">Добавить</span>
                                </label>
                            )}
                        </div>

                        <p className="text-[10px] text-slate-400 leading-tight mb-6">
                            * Кликните на иконку галочки, чтобы выбрать фото для обложки. <br/>
                            * Рекомендуется загружать квадратные изображения.
                        </p>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-[0.97] disabled:bg-slate-200 disabled:shadow-none"
                        >
                            {loading ? 'СОХРАНЕНИЕ...' : 'ОПУБЛИКОВАТЬ'}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};