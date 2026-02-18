import React from 'react';

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        description: string;
        price: number;
        categoryDisplayName: string;
        imageUrl: string;
        sellerName: string;
    };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
            <div className="relative h-56 overflow-hidden bg-gray-100">
                <img
                    src={`http://localhost:8080/uploads/${product.imageUrl}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Нет+фото'; }}
                />
                <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-md text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm border border-indigo-50">
            {product.categoryDisplayName}
          </span>
                </div>
            </div>

            {/* Инфо о товаре */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                    </h3>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                    {product.description || "Описание отсутствует"}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                    <div>
                        <span className="text-2xl font-black text-gray-900">{product.price}</span>
                        <span className="text-sm font-bold text-gray-900 ml-1">BYN</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Мастер</p>
                        <p className="text-xs font-semibold text-gray-700">{product.sellerName}</p>
                    </div>
                </div>
            </div>

            <button className="w-full py-3 bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-600 hover:text-white transition-colors duration-300">
                Просмотреть детали
            </button>
        </div>
    );
};