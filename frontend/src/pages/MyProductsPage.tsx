import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';

interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    imageUrl: string;
    categoryDisplayName: string;
}

export const MyProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/products/my')
            .then(res => setProducts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center mt-10">Загрузка...</div>;

    return (
        <div className="container mx-auto mt-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Мои товары</h1>
                <Link
                    to="/add-product"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    + Добавить товар
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
                    <p className="text-gray-500">У вас пока нет активных товаров.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="h-48 bg-gray-100 flex items-center justify-center">
                                <img
                                    src={`http://localhost:8080/uploads/${product.imageUrl}`}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image'; }}
                                />
                            </div>
                            <div className="p-4">
                                <div className="text-xs font-bold text-indigo-600 uppercase mb-1">{product.categoryDisplayName}</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-black text-gray-900">{product.price} BYN</span>
                                    <span className="text-sm text-gray-500">Склад: {product.stockQuantity} шт.</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};