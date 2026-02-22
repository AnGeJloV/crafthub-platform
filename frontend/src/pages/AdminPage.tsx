import React, { useEffect, useState } from 'react';
import apiClient from '../api';
import { SecureImage } from '../components/SecureImage';
import { UserCheck, PackageSearch, Check, X, Youtube } from 'lucide-react';

interface UserInfo {
    fullName: string;
    email: string;
}

interface ProductImage {
    imageUrl: string;
    isMain: boolean;
}

interface SellerRequest {
    id: number;
    legalInfo: string;
    documentUrl: string;
    user: UserInfo;
}

interface ProductRequest {
    id: number;
    name: string;
    description: string;
    price: number;
    categoryDisplayName: string;
    sellerName: string;
    youtubeVideoId?: string;
    images: ProductImage[];
}

export const AdminPage = () => {
    const [activeTab, setActiveTab] = useState<'sellers' | 'products'>('sellers');
    const [sellerRequests, setSellerRequests] = useState<SellerRequest[]>([]);
    const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [scale, setScale] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sellers, products] = await Promise.all([
                apiClient.get('/verification/pending'),
                apiClient.get('/products/pending')
            ]);
            setSellerRequests(sellers.data);
            setProductRequests(products.data);
        } catch (err) {
            console.error('Ошибка загрузки данных админа:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSellerDecision = async (id: number, status: 'approve' | 'reject') => {
        const reason = status === 'reject' ? prompt('Причина отказа:') : null;
        if (status === 'reject' && !reason) return;

        try {
            await apiClient.post(`/verification/${id}/${status}`, status === 'reject' ? { reason } : {});
            setSellerRequests(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            console.error('Ошибка при решении по продавцу:', e);
        }
    };

    const handleProductDecision = async (id: number, status: 'approve' | 'reject') => {
        const reason = status === 'reject' ? prompt('Причина отказа:') : null;
        if (status === 'reject' && !reason) return;

        try {
            await apiClient.post(`/products/${id}/${status}`, reason, {
                headers: { 'Content-Type': 'text/plain' }
            });
            setProductRequests(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            console.error('Ошибка при модерации товара:', e);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        const zoomStep = 0.2;
        if (e.deltaY < 0) {
            setScale((prev) => Math.min(prev + zoomStep, 5));
        } else {
            setScale((prev) => Math.max(prev - zoomStep, 1));
        }
    };

    if (loading) return <div className="text-center mt-20 text-slate-400 animate-pulse font-bold">Загрузка...</div>;

    return (
        <div className="container mx-auto mt-8 px-4 pb-20">
            <h1 className="text-4xl font-black text-slate-900 mb-8">Панель администратора</h1>

            {/* Вкладки */}
            <div className="flex space-x-4 mb-10 bg-slate-100 p-1.5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('sellers')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'sellers' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <UserCheck size={20} className="mr-2" />
                    Верификация ({sellerRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <PackageSearch size={20} className="mr-2" />
                    Товары ({productRequests.length})
                </button>
            </div>

            {/* Список продавцов */}
            {activeTab === 'sellers' && (
                <div className="grid gap-6">
                    {sellerRequests.map(req => (
                        <div key={req.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row gap-8 shadow-sm">
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-slate-800">{req.user.fullName}</h3>
                                <p className="text-indigo-600 font-bold mb-4">{req.user.email}</p>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 italic text-sm text-slate-600">"{req.legalInfo}"</div>
                                <div className="flex space-x-3 mt-6">
                                    <button onClick={() => handleSellerDecision(req.id, 'approve')} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all">Одобрить</button>
                                    <button onClick={() => handleSellerDecision(req.id, 'reject')} className="flex-1 bg-white border-2 border-red-100 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50 transition-all">Отклонить</button>
                                </div>
                            </div>
                            <div
                                className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center cursor-zoom-in overflow-hidden h-64 border border-slate-100"
                                onClick={() => { setSelectedImage(req.documentUrl); setScale(1); }}
                            >
                                <SecureImage src={req.documentUrl} className="max-h-full object-contain" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Список товаров */}
            {activeTab === 'products' && (
                <div className="grid gap-6">
                    {productRequests.map(prod => (
                        <div key={prod.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col lg:flex-row gap-8 shadow-sm">
                            <div className="lg:w-1/3 h-64 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                                <img
                                    src={`http://localhost:8080/uploads/${prod.images.find(img => img.isMain)?.imageUrl || prod.images[0]?.imageUrl}`}
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                            </div>
                            <div className="lg:w-2/3 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-2xl font-black text-slate-800">{prod.name}</h3>
                                        <span className="bg-indigo-50 text-indigo-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">{prod.categoryDisplayName}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-3">{prod.description}</p>
                                    <div className="flex items-center space-x-6">
                                        <p className="font-black text-2xl text-slate-900">{prod.price} BYN</p>
                                        {prod.youtubeVideoId && (
                                            <a href={`https://youtube.com/watch?v=${prod.youtubeVideoId}`} target="_blank" rel="noreferrer" className="flex items-center text-red-500 text-xs font-bold hover:underline">
                                                <Youtube size={16} className="mr-1" /> Видео
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex space-x-4 mt-8">
                                    <button onClick={() => handleProductDecision(prod.id, 'approve')} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center hover:bg-green-700 transition-all">
                                        <Check size={20} className="mr-2" /> ОДОБРИТЬ
                                    </button>
                                    <button onClick={() => handleProductDecision(prod.id, 'reject')} className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl font-black flex items-center justify-center hover:bg-red-100 transition-all border-2 border-red-100">
                                        <X size={20} className="mr-2" /> ОТКЛОНИТЬ
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-hidden"
                    onClick={() => {setSelectedImage(null); setScale(1)}}
                    onWheel={handleWheel}
                >
                    <button className="absolute top-6 right-10 text-white text-5xl hover:text-slate-300 transition-colors">&times;</button>

                    <div
                        className="relative transition-transform duration-200 ease-out"
                        style={{ transform: `scale(${scale})` }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SecureImage src={selectedImage} className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl rounded-lg pointer-events-none" />
                    </div>

                </div>
            )}
        </div>
    );
};