import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import apiClient from '../api';

interface Category {
    id: number;
    displayName: string;
}

export const AddProductPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        categoryId: ''
    });
    const [image, setImage] = useState<File | null>(null);

    useEffect(() => {
        apiClient.get('/categories').then(res => setCategories(res.data));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) return alert('Выберите фото товара');

        const formData = new FormData();
        const blob = new Blob([JSON.stringify({
            name: form.name,
            description: form.description,
            price: parseFloat(form.price),
            stockQuantity: parseInt(form.stockQuantity),
            categoryId: parseInt(form.categoryId)
        })], {type: 'application/json'});

        formData.append('product', blob);
        formData.append('image', image);

        try {
            await apiClient.post('/products', formData, {
                headers: {'Content-Type': 'multipart/form-data'}
            });
            navigate('/my-products');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            alert('Ошибка при сохранении товара');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border">
            <h2 className="text-2xl font-bold mb-6">Новый товар</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Название</label>
                    <input
                        className="w-full border p-2 rounded-md"
                        required
                        onChange={e => setForm({...form, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Категория</label>
                    <select
                        className="w-full border p-2 rounded-md"
                        required
                        onChange={e => setForm({...form, categoryId: e.target.value})}
                    >
                        <option value="">Выберите категорию</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Цена (BYN)</label>
                        <input
                            type="number" step="0.01"
                            className="w-full border p-2 rounded-md"
                            required
                            onChange={e => setForm({...form, price: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Кол-во на складе</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded-md"
                            required
                            onChange={e => setForm({...form, stockQuantity: e.target.value})}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Описание</label>
                    <textarea
                        className="w-full border p-2 rounded-md"
                        rows={4}
                        onChange={e => setForm({...form, description: e.target.value})}
                    ></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Фото товара</label>
                    <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={e => setImage(e.target.files?.[0] || null)}
                    />
                </div>
                <button type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">
                    Опубликовать товар
                </button>
            </form>
        </div>
    );
};