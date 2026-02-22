import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api';
import { Camera, CheckCircle2, ArrowLeft } from 'lucide-react';

interface Category {
    id: number;
    displayName: string;
}

interface ProductImage {
    imageUrl: string;
    isMain: boolean;
}

interface ProductDetail {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    youtubeVideoId: string | null;
    categoryDisplayName: string;
    images: ProductImage[];
}

export const EditProductPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
        const loadData = async () => {
            try {
                const catRes = await apiClient.get('/categories');
                const fetchedCats: Category[] = catRes.data;
                setCategories(fetchedCats);

                const prodRes = await apiClient.get(`/products/${id}`);
                const p: ProductDetail = prodRes.data;

                const currentCatId = fetchedCats.find(c => c.displayName === p.categoryDisplayName)?.id.toString() || '';

                setForm({
                    name: p.name,
                    description: p.description,
                    price: p.price.toString(),
                    stockQuantity: p.stockQuantity.toString(),
                    categoryId: currentCatId,
                    youtubeUrl: p.youtubeVideoId ? `https://www.youtube.com/watch?v=${p.youtubeVideoId}` : ''
                });

                setPreviews(p.images.map((img) => `http://localhost:8080/uploads/${img.imageUrl}`));
                const mIdx = p.images.findIndex((img) => img.isMain);
                setMainImageIndex(mIdx >= 0 ? mIdx : 0);

            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                navigate('/my-products');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles(filesArray);
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
            setMainImageIndex(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const videoId = form.youtubeUrl ? extractYoutubeId(form.youtubeUrl) : null;
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

        formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

        if (selectedFiles.length > 0) {
            selectedFiles.forEach(file => formData.append('images', file));
        }

        try {
            await apiClient.put(`/products/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Изменения сохранены! Товар отправлен на повторную модерацию.');
            navigate('/my-products');
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            alert('Не удалось сохранить изменения');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-20 text-indigo-600 font-bold animate-pulse">ЗАГРУЗКА...</div>;

    return (
        <div className="container mx-auto mt-10 px-4 max-w-5xl pb-20">
            <button onClick={() => navigate('/my-products')} className="flex items-center text-slate-400 hover:text-indigo-600 mb-6 transition-colors font-bold text-sm uppercase">
                <ArrowLeft size={16} className="mr-2" /> Назад
            </button>

            <h1 className="text-3xl font-black mb-8 text-slate-900">Редактирование</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-5">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Название</label>
                            <input value={form.name} className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold" required onChange={e => setForm({...form, name: e.target.value})} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Цена (BYN)</label>
                                <input type="number" step="0.01" value={form.price} className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold" required onChange={e => setForm({...form, price: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Количество</label>
                                <input type="number" value={form.stockQuantity} className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold" required onChange={e => setForm({...form, stockQuantity: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Категория</label>
                            <select
                                value={form.categoryId} // ТЕПЕРЬ ТУТ ЯВНОЕ ИСПОЛЬЗОВАНИЕ
                                className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold"
                                required
                                onChange={e => setForm({...form, categoryId: e.target.value})}
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">YouTube URL</label>
                            <input value={form.youtubeUrl} className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-medium" onChange={e => setForm({...form, youtubeUrl: e.target.value})} />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Описание</label>
                            <textarea value={form.description} className="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-medium" rows={6} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black text-slate-800 uppercase mb-4">Фотографии</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {previews.map((url, index) => (
                                <div key={index} className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${mainImageIndex === index ? 'border-indigo-500' : 'border-slate-50'}`} onClick={() => setMainImageIndex(index)}>
                                    <img src={url} className="w-full h-full object-cover" alt="" />
                                    {mainImageIndex === index && <div className="absolute top-2 left-2 p-1 bg-indigo-500 text-white rounded-full"><CheckCircle2 size={16} /></div>}
                                </div>
                            ))}
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                                <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                                <Camera size={24} className="text-slate-400" />
                                <span className="text-[10px] font-bold mt-2 text-slate-400 uppercase">Заменить</span>
                            </label>
                        </div>
                        <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-600 transition-all disabled:bg-slate-200">
                            {saving ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};