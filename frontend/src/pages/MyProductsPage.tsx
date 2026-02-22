import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import apiClient from '../api';
import {Clock, CheckCircle, XCircle} from 'lucide-react';

interface ProductImage {
    imageUrl: string;
    isMain: boolean;
}

interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'DRAFT';
    categoryDisplayName: string;
    images: ProductImage[];
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span
                        className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-amber-100">
            <Clock size={12} className="mr-1"/> На проверке
          </span>
                );
            case 'ACTIVE':
                return (
                    <span
                        className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-green-100">
            <CheckCircle size={12} className="mr-1"/> Опубликован
          </span>
                );
            case 'REJECTED':
                return (
                    <span
                        className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-red-100">
            <XCircle size={12} className="mr-1"/> Отклонен
          </span>
                );
            default:
                return <span
                    className="text-gray-500 bg-gray-50 px-2 py-1 rounded-md text-[10px] font-bold">{status}</span>;
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар? Фотографии также будут удалены.')) {
            return;
        }

        try {
            await apiClient.delete(`/products/${id}`);

            setProducts(prev => prev.filter(p => p.id !== id));
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            alert('Ошибка при удалении товара');
        }
    };

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
                    <p className="text-slate-400 font-medium text-lg">У вас пока нет добавленных товаров.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(product => {
                        const mainImage = product.images.find(img => img.isMain)?.imageUrl || product.images[0]?.imageUrl;

                        return (
                            <div key={product.id}
                                 className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col group transition-all hover:shadow-xl hover:shadow-slate-200/50">
                                <div className="relative h-56 bg-slate-50 overflow-hidden">
                                    <img
                                        src={`http://localhost:8080/uploads/${mainImage}`}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://placehold.co/400x300?text=Ошибка+загрузки';
                                        }}
                                    />
                                    <div className="absolute top-4 left-4">
                                        {getStatusBadge(product.status)}
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col grow">
                                    <div
                                        className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{product.categoryDisplayName}</div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-4 line-clamp-1">{product.name}</h3>

                                    <div
                                        className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                                        <div>
                                            <span className="text-2xl font-black text-slate-900">{product.price}</span>
                                            <span className="text-xs font-bold text-slate-400 ml-1">BYN</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] block text-slate-400 font-bold uppercase">В наличии</span>
                                            <span
                                                className="text-sm font-bold text-slate-700">{product.stockQuantity} шт.</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-6">
                                        <Link
                                            to={`/edit-product/${product.id}`}
                                            className="py-2.5 px-4 bg-slate-50 text-slate-600 font-bold rounded-xl text-sm text-center hover:bg-slate-100 transition-colors"
                                        >
                                            Изменить
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="py-2.5 px-4 text-red-500 font-bold rounded-xl text-sm hover:bg-red-50 transition-colors"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};