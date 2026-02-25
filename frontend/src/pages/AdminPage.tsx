import React, {useEffect, useState, useCallback} from 'react';
import apiClient from '../api';
import {SecureImage} from '../components/SecureImage';
import {
    UserCheck,
    PackageSearch,
    PlaySquare,
    Users,
    ShieldAlert,
    ShieldCheck,
    Mail,
    Phone,
    Flag,
    Star, Trash2, Package, ExternalLink
} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useAuthStore} from "../store/authStore.ts";

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

interface UserManagementItem {
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    enabled: boolean;
    avatarUrl: string | null;
}

interface ReportedReview {
    id: number;
    rating: number;
    comment: string;
    authorName: string;
    authorId: number;
    createdAt: string;
    authorEmail: string;
    productId: number;
    productName: string;
}

export const AdminPage = () => {
    const [activeTab, setActiveTab] = useState<'sellers' | 'products' | 'users' | 'reports'>('sellers');
    const [sellerRequests, setSellerRequests] = useState<SellerRequest[]>([]);
    const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
    const [users, setUsers] = useState<UserManagementItem[]>([]);
    const [reportedReviews, setReportedReviews] = useState<ReportedReview[]>([]);

    const currentUser = useAuthStore(state => state.user);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [scale, setScale] = useState(1);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [sellers, products, allUsers, reports] = await Promise.all([
                apiClient.get('/verification/pending'),
                apiClient.get('/products/pending'),
                apiClient.get('/admin/users'),
                apiClient.get('/reviews/admin/reported')
            ]);
            setSellerRequests(sellers.data);
            setProductRequests(products.data);
            setUsers(allUsers.data);
            setReportedReviews(reports.data); // ВОТ ЭТА СТРОЧКА ИСПРАВИЛА БАГ
        } catch (err) {
            console.error('Ошибка загрузки данных админа:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const handleSellerDecision = async (id: number, status: 'approve' | 'reject') => {
        const reason = status === 'reject' ? prompt('Причина отказа:') : null;
        if (status === 'reject' && !reason) return;

        try {
            await apiClient.post(`/verification/${id}/${status}`, status === 'reject' ? {reason} : {});
            setSellerRequests(prev => prev.filter(r => r.id !== id));
            void fetchData();
        } catch (error) {
            console.error('Ошибка при решении по продавцу:', error);
        }
    };

    const handleProductDecision = async (id: number, status: 'approve' | 'reject') => {
        const reason = status === 'reject' ? prompt('Причина отказа:') : null;
        if (status === 'reject' && !reason) return;

        try {
            await apiClient.post(`/products/${id}/${status}`, reason, {
                headers: {'Content-Type': 'text/plain'}
            });
            setProductRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Ошибка при модерации товара:', error);
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await apiClient.patch(`/admin/users/${id}/status`);
            setUsers(prev => prev.map(u => u.id === id ? {...u, enabled: !u.enabled} : u));
        } catch (error) {
            console.error('Ошибка блокировки:', error);
            alert('Ошибка. Нельзя заблокировать самого себя.');
        }
    };

    const handleRoleChange = async (id: number, newRole: string) => {
        try {
            await apiClient.patch(`/admin/users/${id}/role?role=${newRole}`);
            setUsers(prev => prev.map(u => u.id === id ? {...u, role: newRole} : u));
        } catch (error) {
            console.error('Ошибка смены роли:', error);
        }
    };

    const handleWheel = (event: React.WheelEvent) => {
        const zoomStep = 0.2;
        if (event.deltaY < 0) setScale((prev) => Math.min(prev + zoomStep, 5));
        else setScale((prev) => Math.max(prev - zoomStep, 1));
    };

    const handleIgnoreReport = async (id: number) => {
        try {
            await apiClient.patch(`/reviews/admin/${id}/ignore`);
            setReportedReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Ошибка отклонения жалобы:', error);
        }
    };

    const handleDeleteReview = async (id: number) => {
        if (!window.confirm('Удалить этот отзыв навсегда?')) return;
        try {
            await apiClient.delete(`/reviews/admin/${id}`);
            setReportedReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Ошибка удаления отзыва:', error);
        }
    };

    if (loading) return <div className="text-center mt-20 text-slate-400 animate-pulse font-bold">ЗАГРУЗКА
        ПАНЕЛИ...</div>;

    return (
        <div className="container mx-auto mt-8 px-4 pb-20">
            <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Панель администратора</h1>

            <div className="flex flex-wrap gap-4 mb-10 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
                <button
                    onClick={() => setActiveTab('sellers')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'sellers' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <UserCheck size={20} className="mr-2"/>
                    Заявки ({sellerRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <PackageSearch size={20} className="mr-2"/>
                    Модерация ({productRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Users size={20} className="mr-2"/>
                    Пользователи
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'reports' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Flag size={18} className="mr-2"/> Жалобы ({reportedReviews.length})
                </button>
            </div>

            {activeTab === 'sellers' && (
                <div className="grid gap-6">
                    {sellerRequests.length === 0 ?
                        <p className="text-center text-slate-400 py-10 italic font-medium leading-relaxed">Новых заявок
                            нет</p> :
                        sellerRequests.map(req => (
                            <div key={req.id}
                                 className="bg-white rounded-4xl border border-slate-100 p-8 flex flex-col md:flex-row gap-8 shadow-sm transition-all hover:shadow-md">
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-800">{req.user.fullName}</h3>
                                    <p className="text-indigo-600 font-bold mb-4">{req.user.email}</p>
                                    <div
                                        className="bg-slate-50 p-5 rounded-3xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed">"{req.legalInfo}"
                                    </div>
                                    <div className="flex space-x-3 mt-8">
                                        <button onClick={() => void handleSellerDecision(req.id, 'approve')}
                                                className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100">Одобрить
                                        </button>
                                        <button onClick={() => void handleSellerDecision(req.id, 'reject')}
                                                className="flex-1 bg-white border-2 border-red-50 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all">Отклонить
                                        </button>
                                    </div>
                                </div>
                                <div
                                    className="flex-1 bg-slate-50 rounded-4xl flex items-center justify-center cursor-zoom-in overflow-hidden h-72 border border-slate-100 group"
                                    onClick={() => {
                                        setSelectedImage(req.documentUrl);
                                        setScale(1);
                                    }}>
                                    <SecureImage src={req.documentUrl}
                                                 className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500"/>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {activeTab === 'products' && (
                <div className="grid gap-6">
                    {productRequests.length === 0 ?
                        <p className="text-center text-slate-400 py-10 italic font-medium leading-relaxed">Все товары
                            проверены</p> :
                        productRequests.map(prod => (
                            <div key={prod.id}
                                 className="bg-white rounded-4xl border border-slate-100 p-8 flex flex-col lg:flex-row gap-10 shadow-sm transition-all hover:shadow-md">
                                <div
                                    className="lg:w-1/3 h-72 rounded-4xl overflow-hidden bg-slate-50 border border-slate-100">
                                    <img
                                        src={`http://localhost:8080/uploads/${prod.images.find(img => img.isMain)?.imageUrl || prod.images[0]?.imageUrl}`}
                                        className="w-full h-full object-cover" alt=""/>
                                </div>
                                <div className="lg:w-2/3 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{prod.name}</h3>
                                            <span
                                                className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100">{prod.categoryDisplayName}</span>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{prod.description}</p>
                                        <div className="flex items-center space-x-8">
                                            <p className="font-black text-3xl text-slate-900">{prod.price} <span
                                                className="text-sm">BYN</span></p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Продавец: <span
                                                className="text-indigo-600">{prod.sellerName}</span></p>
                                            {prod.youtubeVideoId && (
                                                <a href={`https://youtube.com/watch?v=${prod.youtubeVideoId}`}
                                                   target="_blank" rel="noreferrer"
                                                   className="flex items-center text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                                                    <PlaySquare size={16} className="mr-1.5"/> Видео
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex space-x-4 mt-10">
                                        <button onClick={() => void handleProductDecision(prod.id, 'approve')}
                                                className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100">ОДОБРИТЬ
                                        </button>
                                        <button onClick={() => void handleProductDecision(prod.id, 'reject')}
                                                className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all border-2 border-red-100">ОТКЛОНИТЬ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead
                                className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            <tr>
                                <th className="p-8">Пользователь</th>
                                <th className="p-8">Контакты</th>
                                <th className="p-8">Роль</th>
                                <th className="p-8 text-right">Действие</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {users.map(u => {
                                const isMe = u.email === currentUser?.email;
                                return (
                                    <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="p-8">
                                            <Link to={`/profile/${u.id}`} className="flex items-center group">
                                                <div
                                                    className="w-12 h-12 rounded-2xl overflow-hidden mr-5 bg-slate-100 shrink-0 border-2 border-white shadow-sm group-hover:shadow-md transition-all">
                                                    <img
                                                        src={u.avatarUrl ? `http://localhost:8080/uploads/${u.avatarUrl}` : `https://ui-avatars.com/api/?name=${u.fullName}&background=6366f1&color=fff`}
                                                        className="w-full h-full object-cover" alt=""/>
                                                </div>
                                                <div>
                                                    <span
                                                        className="font-black text-slate-800 block text-sm leading-none mb-1 group-hover:text-indigo-600 transition-colors">{u.fullName}</span>
                                                    {u.enabled ? (
                                                        <span
                                                            className="text-[9px] font-black text-green-500 uppercase flex items-center tracking-tighter"><ShieldCheck
                                                            size={10} className="mr-1"/> Активен</span>
                                                    ) : (
                                                        <span
                                                            className="text-[9px] font-black text-red-400 uppercase flex items-center tracking-tighter"><ShieldAlert
                                                            size={10} className="mr-1"/> Заблокирован</span>
                                                    )}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center text-xs text-slate-500 font-bold">
                                                    <Mail size={14} className="mr-2.5 text-slate-300"/> {u.email}</div>
                                                <div className="flex items-center text-xs text-slate-500 font-bold">
                                                    <Phone size={14} className="mr-2.5 text-slate-300"/> {u.phoneNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <select
                                                value={u.role}
                                                disabled={isMe}
                                                onChange={(event) => void handleRoleChange(u.id, event.target.value)}
                                                className={`text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none transition-all ${isMe ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 cursor-pointer focus:ring-2 focus:ring-indigo-500'}`}
                                            >
                                                <option value="ROLE_USER">BUYER</option>
                                                <option value="ROLE_SELLER">SELLER</option>
                                                <option value="ROLE_ADMIN">ADMIN</option>
                                            </select>
                                        </td>
                                        <td className="p-8 text-right">
                                            <button
                                                disabled={isMe}
                                                onClick={() => void handleToggleStatus(u.id)}
                                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isMe ? 'bg-slate-50 text-slate-200 cursor-not-allowed' : u.enabled ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                                            >
                                                {isMe ? 'Это вы' : (u.enabled ? 'Забанить' : 'Разбанить')}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="grid gap-6">
                    {reportedReviews.length === 0 ? <p className="text-center text-slate-400 py-20 italic bg-white rounded-4xl border-2 border-dashed border-slate-100 font-medium">Жалоб на отзывы нет</p> :
                        reportedReviews.map(review => (
                            <div key={review.id} className="bg-white p-8 rounded-4xl border border-red-100 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-400" />
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="font-black text-slate-800 text-lg">{review.authorName}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-100">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className={`${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6 flex items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 w-fit group">
                                    <Package size={14} className="text-indigo-400 mr-2" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase mr-2">Товар:</span>
                                    <Link to={`/product/${review.productId}`} className="text-xs font-bold text-indigo-600 hover:underline flex items-center">
                                        {review.productName}
                                        <ExternalLink size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100 italic text-slate-600 leading-relaxed">
                                    {review.comment || "Без текстового комментария"}
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button onClick={() => void handleIgnoreReport(review.id)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Отклонить жалобу</button>
                                    <button onClick={() => void handleDeleteReview(review.id)} className="px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center">
                                        <Trash2 size={16} className="mr-2" /> Удалить отзыв
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {selectedImage && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-hidden"
                    onClick={() => {
                        setSelectedImage(null);
                        setScale(1);
                    }} onWheel={handleWheel}>
                    <button
                        className="absolute top-8 right-10 text-white text-5xl hover:text-slate-300 transition-colors">&times;</button>
                    <div className="relative transition-transform duration-200 ease-out"
                         style={{transform: `scale(${scale})`}} onClick={(event) => event.stopPropagation()}>
                        <SecureImage src={selectedImage}
                                     className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl rounded-4xl pointer-events-none"/>
                    </div>
                </div>
            )}
        </div>
    );
};