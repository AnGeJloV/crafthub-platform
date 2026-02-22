import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        description: string;
        price: number;
        stockQuantity: number;
        categoryDisplayName: string;
        sellerName: string;
        sellerEmail: string;
        images: { imageUrl: string; isMain: boolean }[];
    };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const user = useAuthStore((state) => state.user);
    const addItem = useCartStore((state) => state.addItem);
    const [showToast, setShowToast] = useState(false);
    const isOutOfStock = product.stockQuantity <= 0;

    const mainImage = product.images.find(img => img.isMain)?.imageUrl || product.images[0]?.imageUrl;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await addItem(product.id);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.message || 'Ошибка при добавлении');
            }
        }
    };

    return (
        <Link
            to={`/product/${product.id}`}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative cursor-pointer"
        >

            {showToast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-green-600 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-lg animate-bounce">
                    ✓ В корзине
                </div>
            )}

            <div className="relative h-52 overflow-hidden bg-slate-50">
                <img
                    src={`http://localhost:8080/uploads/${mainImage}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Нет+фото'; }}
                />
                <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-indigo-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-sm">
            {product.categoryDisplayName}
          </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                </h3>
                <p className="text-slate-500 text-xs line-clamp-2 mb-6 flex-grow leading-relaxed">
                    {product.description}
                </p>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Цена</span>
                        <span className="text-2xl font-black text-slate-900">{product.price} <span className="text-xs">BYN</span></span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Мастер</p>
                        <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{product.sellerName}</p>
                    </div>
                </div>

                {user && user.email !== product.sellerEmail ? (
                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`w-full py-3 text-white text-sm font-bold rounded-2xl transition-all active:scale-[0.97] ${
                            isOutOfStock
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-slate-900 hover:bg-indigo-600 shadow-lg shadow-slate-200'
                        }`}
                    >
                        {isOutOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
                    </button>
                ) : !user ? (
                    <p className="text-[10px] text-center text-slate-400 font-medium">Авторизуйтесь для покупки</p>
                ) : (
                    <div className="text-center py-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Ваш товар</span>
                    </div>
                )}
            </div>
        </Link>
    );
};