import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import axios from 'axios';

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        description: string;
        price: number;
        categoryDisplayName: string;
        imageUrl: string;
        sellerName: string;
        sellerEmail: string;
    };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const user = useAuthStore((state) => state.user);
    const addItem = useCartStore((state) => state.addItem);
    const [showToast, setShowToast] = useState(false);

    const handleAddToCart = async () => {
        try {
            await addItem(product.id);
            setShowToast(true);

            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.message || 'Ошибка при добавлении в корзину');
            }
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative">

            {/* Всплывающее уведомление */}
            {showToast && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                    ✓ Добавлено в корзину
                </div>
            )}

            {/* Изображение */}
            <div className="relative h-48 overflow-hidden bg-gray-50">
                <img
                    src={`http://localhost:8080/uploads/${product.imageUrl}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Нет+фото'; }}
                />
                <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-md text-indigo-700 text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">
            {product.categoryDisplayName}
          </span>
                </div>
            </div>

            {/* Описание */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-md font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-grow">{product.description}</p>

                <div className="flex justify-between items-end mb-4">
                    <div>
                        <span className="text-xl font-black text-gray-900">{product.price}</span>
                        <span className="text-xs font-bold text-gray-400 ml-1">BYN</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Мастер</p>
                        <p className="text-xs font-semibold text-gray-600">{product.sellerName}</p>
                    </div>
                </div>

                {user && user.email !== product.sellerEmail ? (
                    <button
                        onClick={handleAddToCart}
                        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors active:scale-95"
                    >
                        В корзину
                    </button>
                ) : !user ? (
                    <p className="text-[10px] text-center text-gray-400 italic">Войдите, чтобы купить</p>
                ) : (
                    <p className="text-[10px] text-center text-indigo-400 font-medium">Это ваш товар</p>
                )}
            </div>
        </div>
    );
};