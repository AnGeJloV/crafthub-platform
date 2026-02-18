import { useEffect, useState } from 'react';
import apiClient from '../api';
import { ProductCard } from '../components/ProductCard';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    categoryDisplayName: string;
    imageUrl: string;
    sellerName: string;
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

    // Состояния для фильтров
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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
        fetchData();
    }, []);

    // Логика фильтрации (выполняется на клиенте для мгновенного отклика)
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || product.categoryDisplayName === categories.find(c => c.name === selectedCategory)?.displayName;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div className="text-center mt-20 animate-pulse text-gray-400">Загрузка каталога товаров...</div>;

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
                {categories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`px-6 py-2 rounded-full font-semibold transition-all ${
                            selectedCategory === category.name
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                        }`}
                    >
                        {category.displayName}
                    </button>
                ))}
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 text-xl font-medium">Ничего не найдено по вашему запросу</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};