import {useEffect, useState, useCallback} from 'react';
import apiClient from '../api';
import {Truck, CheckCircle, MapPin, Info, ChevronRight, MessageSquare, Star, X} from 'lucide-react';
import {useAuthStore} from '../store/authStore';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Управление заказами: история покупок для юзеров и управление продажами для мастеров
 */

interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
    isReviewed: boolean;
}

interface Order {
    id: number;
    buyerId: number;
    buyerName: string;
    sellerId: number;
    sellerName: string;
    totalAmount: number;
    status: 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
    shippingAddress: string;
    cancellationReason?: string;
    createdAt: string;
    items: OrderItem[];
}

export const OrdersPage = () => {
    const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore(state => state.user);
    const navigate = useNavigate();

    const [reviewModal, setReviewModal] = useState<{
        isOpen: boolean,
        productId: number | null,
        orderId: number | null,
        productName: string
    }>({
        isOpen: false, productId: null, orderId: null, productName: ''
    });
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const [decisionModal, setDecisionModal] = useState<{
        isOpen: boolean;
        type: 'cancel' | 'dispute' | 'delivered' | 'shipped';
        id: number | null;
        title: string;
        confirmText: string;
        showInput: boolean;
    }>({
        isOpen: false,
        type: 'cancel',
        id: null,
        title: '',
        confirmText: '',
        showInput: false
    });
    const [reason, setReason] = useState('');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'purchases' ? '/orders/my-purchases' : '/orders/my-sales';
            const res = await apiClient.get<Order[]>(endpoint);
            setOrders(res.data);
        } catch (error) {
            console.error('Ошибка загрузки истории заказов:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        void fetchOrders();
    }, [fetchOrders]);

    const handleConfirmDecision = async () => {
        const { id, type, showInput } = decisionModal;
        if (!id) return;

        if (showInput && !reason.trim()) {
            toast.error('Укажите причину');
            return;
        }

        try {
            if (type === 'cancel') {
                await apiClient.post(`/orders/${id}/cancel`, reason, { headers: {'Content-Type': 'text/plain'} });
                toast.success('Заказ отменен');
            } else if (type === 'dispute') {
                await apiClient.post(`/orders/${id}/dispute`);
                toast.success('Спор открыт');
            } else if (type === 'shipped') {
                await apiClient.patch(`/orders/${id}/status?status=SHIPPED`);
                toast.success('Статус: В пути');
            } else if (type === 'delivered') {
                await apiClient.patch(`/orders/${id}/status?status=DELIVERED`);
                toast.success('Заказ успешно завершен!');
            }

            closeModal();
            void fetchOrders();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error('Не удалось выполнить действие');
        }
    };

    const openModal = (config: typeof decisionModal) => {
        setDecisionModal({ ...config, isOpen: true });
        setReason('');
    };

    const closeModal = () => {
        setDecisionModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleOpenChat = async (order: Order) => {
        const productId = order.items[0].productId;

        const recipientId = activeTab === 'sales' ? order.buyerId : order.sellerId;
        const recipientName = activeTab === 'sales' ? order.buyerName : order.sellerName;

        try {
            const queryUrl = `/chat/find?productId=${productId}&recipientId=${recipientId}`;
            const res = await apiClient.get(queryUrl);
            const existingId = res.data;

            if (existingId) {
                navigate(`/chat?dialogue=${existingId}`);
            } else {
                navigate(`/chat?product=${productId}&recipient=${recipientId}&name=${encodeURIComponent(recipientName)}`);
            }
        } catch (e) {
            console.error(e);
            toast.error('Ошибка при открытии чата');
        }
    };

    const submitReview = async () => {
        setIsSubmittingReview(true);
        try {
            await apiClient.post('/reviews', {
                rating,
                comment: comment.trim() || null,
                productId: reviewModal.productId,
                orderId: reviewModal.orderId
            });
            toast.success('Отзыв опубликован!');
            setReviewModal({isOpen: false, productId: null, orderId: null, productName: ''});
            setRating(5);
            setComment('');
            void fetchOrders();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Ошибка при публикации отзыва');
            } else {
                toast.error('Произошла ошибка');
            }
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PAID':
                return {label: 'Оплачено', style: 'bg-blue-50 text-blue-600 border-blue-100'};
            case 'SHIPPED':
                return {label: 'В пути', style: 'bg-amber-50 text-amber-600 border-amber-100'};
            case 'COMPLETED':
                return {label: 'Завершен', style: 'bg-green-50 text-green-600 border-green-100'};
            case 'CANCELLED':
                return {label: 'Отменен', style: 'bg-red-50 text-red-600 border-red-100'};
            case 'DISPUTED':
                return {label: 'Спор', style: 'bg-purple-50 text-purple-600 border-purple-100'};
            default:
                return {label: status, style: 'bg-gray-50 text-gray-400 border-gray-100'};
        }
    };

    if (loading) return <div className="text-center mt-20 text-slate-400 font-bold animate-pulse font-mono">Loading orders...</div>;

    return (
        <div className="container mx-auto mt-8 px-4 max-w-5xl pb-20">
            <h1 className="text-4xl font-black mb-8 text-slate-900 tracking-tight">Мои заказы</h1>

            <div className="flex space-x-3 mb-10 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
                <button onClick={() => setActiveTab('purchases')}
                        className={`px-8 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'purchases' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                    Мои покупки
                </button>
                {user?.role === 'ROLE_SELLER' && (
                    <button onClick={() => setActiveTab('sales')}
                            className={`px-8 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'sales' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                        Мои продажи
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium italic text-lg">Заказов пока нет</p>
                    </div>
                ) : (
                    orders.map((order) => {
                        const status = getStatusInfo(order.status);
                        return (
                            <div key={order.id}
                                 className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-3">
                                            <h2 className="text-2xl font-black text-slate-800">№ {order.id}</h2>
                                            <span
                                                className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${status.style}`}>{status.label}</span>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                                {activeTab === 'purchases' ? 'Продавец: ' : 'Покупатель: '}
                                                <Link
                                                    to={`/profile/${activeTab === 'purchases' ? order.sellerId : order.buyerId}`}
                                                    className="text-indigo-600 hover:underline">
                                                    {activeTab === 'purchases' ? order.sellerName : order.buyerName}
                                                </Link>
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-indigo-600">{order.totalAmount.toFixed(2)} BYN</p>
                                    </div>
                                </div>

                                <div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-y border-slate-50 py-8">
                                    <div className="flex items-start text-slate-600">
                                        <MapPin size={22} className="text-indigo-500 mr-4 mt-1"/>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Адрес
                                                доставки</p>
                                            <p className="text-sm font-bold leading-relaxed">{order.shippingAddress}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center">
                                            <Info size={14} className="mr-2"/> Состав посылки</p>
                                        <div className="space-y-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <div
                                                        className="flex items-center text-slate-600 font-semibold overflow-hidden">
                                                        <ChevronRight size={14}
                                                                      className="text-indigo-300 mr-1 shrink-0"/>
                                                        <span className="truncate">{item.productName}</span>
                                                        <span
                                                            className="text-slate-300 ml-2 font-normal">x{item.quantity}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 ml-4 shrink-0">
                                                        <span
                                                            className="font-black text-slate-800">{item.priceAtPurchase} BYN</span>

                                                        {activeTab === 'purchases' && order.status === 'COMPLETED' && !item.isReviewed && (
                                                            <button
                                                                onClick={() => setReviewModal({
                                                                    isOpen: true,
                                                                    productId: item.productId,
                                                                    orderId: order.id,
                                                                    productName: item.productName
                                                                })}
                                                                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center"
                                                            >
                                                                <Star size={12} className="mr-1 fill-white"/> Оценить
                                                            </button>
                                                        )}
                                                        {item.isReviewed && (
                                                            <div
                                                                className="flex items-center text-green-500 text-[9px] font-black uppercase tracking-tighter">
                                                                <CheckCircle size={12} className="mr-1"/> Оценено
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-4 mt-6">
                                    <button
                                        onClick={() => handleOpenChat(order)}
                                        className="bg-white text-indigo-600 border-2 border-indigo-100 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-95"
                                    >
                                        <MessageSquare size={16} className="mr-2"/> Написать в чат
                                    </button>

                                    {activeTab === 'sales' && order.status === 'PAID' && (
                                        <>
                                            <button onClick={() => openModal({ isOpen: true, type: 'cancel', id: order.id, title: 'Причина отмены заказа:', confirmText: 'Отменить заказ', showInput: true })} className="px-6 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100 active:scale-95">Отменить заказ</button>
                                            <button onClick={() => openModal({ isOpen: true, type: 'shipped', id: order.id, title: 'Отметить заказ как отправленный?', confirmText: 'Да, отправлено', showInput: false })} className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center hover:bg-green-700 transition-all shadow-xl active:scale-95">
                                                <Truck size={16} className="mr-2 inline"/> Отметить отправку
                                            </button>
                                        </>
                                    )}

                                    {activeTab === 'purchases' && order.status === 'SHIPPED' && (
                                        <>
                                            <button onClick={() => openModal({ isOpen: true, type: 'dispute', id: order.id, title: 'Открыть спор по заказу?', confirmText: 'Открыть спор', showInput: false })} className="px-6 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100 active:scale-95">Товар не получен?</button>
                                            <button onClick={() => openModal({ isOpen: true, type: 'delivered', id: order.id, title: 'Вы подтверждаете получение товара?', confirmText: 'Подтверждаю', showInput: false })} className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center hover:bg-green-700 transition-all shadow-xl active:scale-95">
                                                <CheckCircle size={16} className="mr-2 inline"/> Подтвердить получение
                                            </button>
                                        </>
                                    )}

                                    {activeTab === 'sales' && order.status === 'DISPUTED' && (
                                        <button onClick={() => openModal({ isOpen: true, type: 'cancel', id: order.id, title: 'Вернуть средства покупателю?', confirmText: 'Вернуть деньги', showInput: true })} className="bg-red-50 text-red-500 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white border border-red-100 transition-all active:scale-95">Вернуть средства</button>
                                    )}
                                    {activeTab === 'purchases' && order.status === 'DISPUTED' && (
                                        <button onClick={() => openModal({ isOpen: true, type: 'delivered', id: order.id, title: 'Спор решен? Нажмите для завершения.', confirmText: 'Спор решен', showInput: false })} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-xl transition-all active:scale-95">Спор решен (Завершить)</button>
                                    )}

                                    {order.status === 'COMPLETED' && (
                                        <div
                                            className="flex items-center text-green-600 bg-green-50 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-green-100">
                                            <CheckCircle size={18} className="mr-3"/> Сделка закрыта
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {reviewModal.isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                    <div
                        className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Ваша оценка</h3>
                        <p className="text-slate-400 text-sm mb-6 font-medium leading-tight">Поделитесь впечатлением об
                            изделии <span className="text-indigo-600 font-bold">"{reviewModal.productName}"</span></p>
                        <div className="flex justify-center space-x-2 mb-8">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setRating(star)}
                                        className="transform transition-transform active:scale-90">
                                    <Star size={36}
                                          className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-100'} transition-all`}/>
                                </button>
                            ))}
                        </div>
                        <textarea placeholder="Ваш отзыв (необязательно)..."
                                  className="w-full border-2 border-slate-50 bg-slate-50 p-5 rounded-3xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm mb-8 resize-none font-medium"
                                  rows={4} value={comment} onChange={(e) => setComment(e.target.value)}/>
                        <div className="flex space-x-4">
                            <button
                                disabled={isSubmittingReview}
                                onClick={submitReview}
                                className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 active:scale-95 transition-all shadow-lg"
                            >
                                {isSubmittingReview ? 'Публикация...' : 'Опубликовать'}
                            </button>
                            <button disabled={isSubmittingReview} onClick={() => {
                                setReviewModal({isOpen: false, productId: null, orderId: null, productName: ''});
                                setRating(5);
                                setComment('');
                            }}
                                    className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {decisionModal.isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative animate-in zoom-in duration-300">
                        <button onClick={closeModal} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors">
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-black text-slate-800 mb-2">{decisionModal.title}</h3>
                        <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed">
                            Подтвердите ваше действие.
                        </p>

                        {decisionModal.showInput && (
                            <textarea
                                autoFocus
                                className="w-full border-2 border-slate-50 bg-slate-50 p-5 rounded-3xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm mb-8 resize-none font-medium"
                                rows={4}
                                placeholder="Укажите причину..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={handleConfirmDecision}
                                className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                                    decisionModal.type === 'cancel' || decisionModal.type === 'dispute'
                                        ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                {decisionModal.confirmText}
                            </button>
                            <button
                                onClick={closeModal}
                                className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};