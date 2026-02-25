import { useEffect, useState } from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import apiClient from '../api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { ShoppingCart, User, Tag, Package, PlaySquare, ChevronLeft, MessageSquare, Star, MessageCircle } from 'lucide-react';
import axios from 'axios';

interface ProductImage {
    imageUrl: string;
    isMain: boolean;
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    authorName: string;
    createdAt: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    youtubeVideoId: string | null;
    categoryDisplayName: string;
    sellerId: number;
    sellerName: string;
    sellerEmail: string;
    averageRating: number;
    reviewsCount: number;
    images: ProductImage[];
}

export const ProductDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeImage, setActiveImage] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const user = useAuthStore((state) => state.user);
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const [prodRes, reviewsRes] = await Promise.all([
                    apiClient.get(`/products/${id}`),
                    apiClient.get(`/reviews/product/${id}`)
                ]);

                const data: Product = prodRes.data;
                setProduct(data);
                setReviews(reviewsRes.data);

                const mainImg = data.images.find(img => img.isMain)?.imageUrl || data.images[0]?.imageUrl;
                setActiveImage(mainImg || '');
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            } finally {
                setLoading(false);
            }
        };
        void fetchProductData();
    }, [id]);

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            await addItem(product.id);
            navigate('/cart');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Ошибка добавления');
            }
        }
    };

    const handleContactSeller = async () => {
        if (!user) return navigate('/login');
        if (!product) return;
        try {
            const res = await apiClient.get(`/chat/find?productId=${product.id}`);
            const existingId = res.data;
            if (existingId) navigate(`/chat?dialogue=${existingId}`);
            else navigate(`/chat?product=${product.id}&recipient=${product.sellerId}&name=${encodeURIComponent(product.sellerName)}`);
        } catch (err) {
            console.error(err);
            alert('Ошибка при проверке диалога');
        }
    };

    if (loading) return <div className="text-center mt-20 animate-pulse text-slate-400 font-bold tracking-widest">ЗАГРУЗКА...</div>;
    if (!product) return <div className="text-center mt-20 text-red-500 font-bold">Товар не найден</div>;

    return (
        <div className="container mx-auto px-4 py-8 pb-20">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors font-semibold text-sm"
            >
                <ChevronLeft size={20}/> Назад к покупкам
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                <div className="space-y-4">
                    <div className="aspect-square w-full rounded-4xl overflow-hidden bg-white shadow-xl border border-slate-100">
                        <img
                            src={`http://localhost:8080/uploads/${activeImage}`}
                            className="w-full h-full object-cover"
                            alt={product.name}
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800?text=Нет+фото'; }}
                        />
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {product.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img.imageUrl)}
                                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${activeImage === img.imageUrl ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            >
                                <img src={`http://localhost:8080/uploads/${img.imageUrl}`} className="w-full h-full object-cover" alt=""/>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-indigo-50 text-indigo-600 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-indigo-100">
                                {product.categoryDisplayName}
                            </span>
                        </div>

                        <h1 className="text-4xl font-black text-slate-900 mb-2">{product.name}</h1>
                        <p className="text-slate-400 flex items-center text-sm">
                            <User size={14} className="mr-1"/> Автор:
                            <Link to={`/profile/${product.sellerId}`} className="font-bold text-indigo-600 ml-1 hover:underline">
                                {product.sellerName}
                            </Link>
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-50 mb-8">
                        <div className="flex items-baseline mb-6">
                            <span className="text-4xl font-black text-slate-900">{product.price}</span>
                            <span className="text-xl font-bold text-slate-400 ml-2">BYN</span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center text-slate-600">
                                <Package size={18} className="mr-3 text-indigo-500"/>
                                <span className="text-sm font-medium">В наличии: <span className="font-bold">{product.stockQuantity} шт.</span></span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <Tag size={18} className="mr-3 text-indigo-500"/>
                                <span className="text-sm font-medium">Безопасная сделка: <span className="font-bold text-green-600">Доступна</span></span>
                            </div>
                        </div>

                        {user?.email !== product.sellerEmail ? (
                            <>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stockQuantity <= 0}
                                    className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all flex items-center justify-center mb-3 ${product.stockQuantity <= 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.97]'}`}
                                >
                                    <ShoppingCart className="mr-2"/> {product.stockQuantity <= 0 ? 'НЕТ В НАЛИЧИИ' : 'В КОРЗИНУ'}
                                </button>
                                <button
                                    onClick={handleContactSeller}
                                    className="w-full bg-white text-indigo-600 border-2 border-indigo-100 py-4 rounded-2xl font-bold text-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center active:scale-[0.97]"
                                >
                                    <MessageSquare size={18} className="mr-2"/> СВЯЗАТЬСЯ С МАСТЕРОМ
                                </button>
                            </>
                        ) : (
                            <div className="text-center py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase text-xs tracking-widest">
                                Это ваше изделие
                            </div>
                        )}
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-wider">Описание изделия</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {product.description || 'Мастер пока не добавил описание.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ВИДЕО */}
            {product.youtubeVideoId && (
                <div className="mt-20 mb-20">
                    <div className="flex items-center mb-8">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mr-4">
                            <PlaySquare size={28}/>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">Видеообзор изделия</h2>
                    </div>
                    <div className="aspect-video w-full max-w-4xl mx-auto rounded-4xl overflow-hidden shadow-2xl border-8 border-white bg-slate-900">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${product.youtubeVideoId}`}
                            title="YouTube video player"
                            style={{border: 0}}
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            {/* БЛОК ОТЗЫВОВ */}
            <div className="mt-20 border-t border-slate-100 pt-20">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">Отзывы покупателей</h2>
                        <p className="text-slate-400 font-medium">Мнения людей, которые уже приобрели это изделие</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black text-slate-900">{(product.averageRating || 0).toFixed(1)}</div>
                        <div className="flex justify-end my-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} className={`${i < Math.round(product.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                            ))}
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{product.reviewsCount} отзывов</p>
                    </div>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
                        <MessageCircle size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-medium italic">На это изделие пока нет отзывов. Станьте первым!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm transition-hover hover:shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{review.authorName}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex bg-yellow-50 px-2 py-1 rounded-lg">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} className={`${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-slate-600 text-sm leading-relaxed italic">
                                        "{review.comment}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};