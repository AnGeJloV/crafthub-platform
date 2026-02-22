import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { ShoppingCart, User, Tag, Package, Youtube, ChevronLeft } from 'lucide-react';
import axios from 'axios';

interface ProductImage {
    imageUrl: string;
    isMain: boolean;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    youtubeVideoId: string | null;
    categoryDisplayName: string;
    sellerName: string;
    sellerEmail: string;
    images: ProductImage[];
}

export const ProductDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [activeImage, setActiveImage] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const user = useAuthStore((state) => state.user);
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await apiClient.get(`/products/${id}`);
                const data: Product = response.data;
                setProduct(data);
                const mainImg = data.images.find(img => img.isMain)?.imageUrl || data.images[0]?.imageUrl;
                setActiveImage(mainImg || '');
            } catch (err) {
                console.error('Ошибка загрузки товара:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            await addItem(product.id);
            navigate('/cart');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.message || 'Ошибка добавления');
            }
        }
    };

    if (loading) return <div className="text-center mt-20 animate-pulse text-slate-400">Загрузка информации о товаре...</div>;
    if (!product) return <div className="text-center mt-20 text-red-500 font-bold">Товар не найден</div>;

    return (
        <div className="container mx-auto px-4 py-8 pb-20">
            {/* Кнопка назад */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors font-semibold text-sm"
            >
                <ChevronLeft size={20} /> Назад к покупкам
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Галерея */}
                <div className="space-y-4">
                    <div className="aspect-square w-full rounded-[2.5rem] overflow-hidden bg-white shadow-xl border border-slate-100">
                        <img
                            src={`http://localhost:8080/uploads/${activeImage}`}
                            className="w-full h-full object-cover"
                            alt={product.name}
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800?text=Нет+фото'; }}
                        />
                    </div>

                    {/* Миниатюры */}
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {product.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img.imageUrl)}
                                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === img.imageUrl ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            >
                                <img src={`http://localhost:8080/uploads/${img.imageUrl}`} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Инфо */}
                <div className="flex flex-col">
                    <div className="mb-6">
            <span className="bg-indigo-50 text-indigo-600 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-indigo-100">
              {product.categoryDisplayName}
            </span>
                        <h1 className="text-4xl font-black text-slate-900 mt-4 mb-2">{product.name}</h1>
                        <p className="text-slate-400 flex items-center text-sm">
                            <User size={14} className="mr-1" /> Автор: <span className="font-bold text-slate-600 ml-1">{product.sellerName}</span>
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 mb-8">
                        <div className="flex items-baseline mb-6">
                            <span className="text-4xl font-black text-slate-900">{product.price}</span>
                            <span className="text-xl font-bold text-slate-400 ml-2">BYN</span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center text-slate-600">
                                <Package size={18} className="mr-3 text-indigo-500" />
                                <span className="text-sm font-medium">В наличии: <span className="font-bold">{product.stockQuantity} шт.</span></span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <Tag size={18} className="mr-3 text-indigo-500" />
                                <span className="text-sm font-medium">Безопасная сделка: <span className="font-bold text-green-600">Поддерживается</span></span>
                            </div>
                        </div>

                        {user?.email !== product.sellerEmail ? (
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-[0.97] flex items-center justify-center"
                            >
                                <ShoppingCart className="mr-2" /> В КОРЗИНУ
                            </button>
                        ) : (
                            <div className="text-center py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase text-xs tracking-widest">
                                Это ваше изделие
                            </div>
                        )}
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-wider">Описание изделия</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {product.description || 'Мастер пока не добавил описание для этого товара.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Блок видео (если есть) */}
            {product.youtubeVideoId && (
                <div className="mt-20">
                    <div className="flex items-center mb-8">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mr-4">
                            <Youtube size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">Видеообзор изделия</h2>
                    </div>
                    <div className="aspect-video w-full max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${product.youtubeVideoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};