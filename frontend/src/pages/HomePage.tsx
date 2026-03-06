import {useEffect, useState} from 'react';
import apiClient from '../api';
import {ProductCard} from '../components/ProductCard';
import {Check, LayoutGrid, X} from "lucide-react";

/**
 * Главная страница: поиск, фильтрация по категориям и общий каталог товаров
 */

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryDisplayName: string;
    sellerName: string;
    sellerEmail: string;
    averageRating: number;
    reviewsCount: number;
    images: { imageUrl: string; isMain: boolean }[];
}

interface Category {
    id: number;
    name: string;
    displayName: string;
}

export const HomePage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    apiClient.get('/products'),
                    apiClient.get('/categories')
                ]);
                setProducts(prodRes.data);
                setCategories(catRes.data);
            } catch (err) {
                console.error('Ошибка загрузки данных', err);
            } finally {
                setLoading(false);
            }
        };
        void fetchData();
    }, []);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || product.categoryDisplayName === categories.find(c => c.name === selectedCategory)?.displayName;
        return matchesSearch && matchesCategory;
    });

    const mainCategories = categories.slice(0, 4);

    const isOtherSelected = selectedCategory !== 'ALL' && !mainCategories.some(c => c.name === selectedCategory);

    if (loading) return <div className="text-center mt-20 animate-pulse text-gray-400">Загрузка каталога
        товаров...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 mb-4">Найдите уникальные вещи</h1>
                <p className="text-gray-500 max-w-xl mx-auto mb-8">
                    Маркетплейс локальных производителей: от керамики ручной работы до дизайнерской мебели.
                </p>

                <div className="max-w-2xl mx-auto relative">
                    <input
                        type="text"
                        placeholder="Поиск по названию товара..."
                        className="w-full px-6 py-4 rounded-2xl border-none shadow-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-lg transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
                <button
                    onClick={() => setSelectedCategory('ALL')}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${
                        selectedCategory === 'ALL'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                    }`}
                >
                    Все товары
                </button>
                {mainCategories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                            selectedCategory === category.name
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white text-slate-500 border border-slate-100 hover:border-indigo-200'
                        }`}
                    >
                        {category.displayName}
                    </button>
                ))}

                {/* Кнопка "Другие" */}
                <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center ${
                        isOtherSelected
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'bg-white text-slate-500 border border-slate-100 hover:border-indigo-200'
                    }`}
                >
                    <LayoutGrid size={16} className="mr-2"/>
                    {isOtherSelected ? categories.find(c => c.name === selectedCategory)?.displayName : 'Другие'}
                </button>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 text-xl font-medium">Ничего не найдено по вашему запросу</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product}/>
                    ))}
                </div>
            )}

            {isCategoryModalOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl relative animate-in zoom-in duration-300 max-h-[80vh] flex flex-col">
                        <button
                            onClick={() => setIsCategoryModalOpen(false)}
                            className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
                        >
                            <X size={28}/>
                        </button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Все
                                категории</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                            {categories.map((category) => {
                                const isSelected = selectedCategory === category.name;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setSelectedCategory(category.name);
                                            setIsCategoryModalOpen(false);
                                        }}
                                        className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all active:scale-[0.98] ${
                                            isSelected
                                                ? 'border-indigo-600 bg-indigo-50/50'
                                                : 'border-slate-50 bg-slate-50/30 hover:border-indigo-200 hover:bg-white'
                                        }`}
                                    >
                                        <span
                                            className={`font-black text-sm uppercase tracking-wider ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`}>
                                            {category.displayName}
                                        </span>
                                        {isSelected && <Check size={18} className="text-indigo-600"/>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};