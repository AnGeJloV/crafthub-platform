import {useEffect, useState, useCallback} from 'react';
import apiClient from '../api';
import {Truck, CheckCircle, MapPin, AlertCircle, XCircle, Info, ChevronRight, Package} from 'lucide-react';
import {useAuthStore} from '../store/authStore';

interface OrderItem {
    productName: string;
    quantity: number;
    priceAtPurchase: number;
}

interface Order {
    id: number;
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
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await apiClient.patch(`/orders/${id}/status?status=${status}`);
            await fetchOrders();
            alert('Статус успешно изменен');
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            alert('Не удалось изменить статус');
        }
    };

    const handleCancel = async (id: number) => {
        const reason = prompt('Укажите причину отмены заказа:');
        if (!reason || reason.trim() === '') return;

        try {
            await apiClient.post(`/orders/${id}/cancel`, reason, {
                headers: {'Content-Type': 'text/plain'}
            });
            await fetchOrders();
            alert('Заказ отменен, товары возвращены на склад');
        } catch (error) {
            console.error('Ошибка при отмене:', error);
            alert('Не удалось отменить заказ');
        }
    };

    const handleDispute = async (id: number) => {
        if (!window.confirm('Открыть спор? Это уведомит мастера и администратора о проблеме.')) return;

        try {
            await apiClient.post(`/orders/${id}/dispute`);
            await fetchOrders();
            alert('Спор открыт. Ожидайте связи с мастером.');
        } catch (error) {
            console.error('Ошибка при открытии спора:', error);
            alert('Не удалось открыть спор');
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

    if (loading) return <div className="text-center mt-20 text-slate-400 font-bold animate-pulse">Загрузка истории
        заказов...</div>;

    return (
        <div className="container mx-auto mt-8 px-4 max-w-5xl pb-20">
            <h1 className="text-4xl font-black mb-8 text-slate-900 tracking-tight">Мои заказы</h1>

            {/* Переключатель вкладок */}
            <div
                className="flex space-x-3 mb-10 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200 shadow-sm">
                <button
                    onClick={() => setActiveTab('purchases')}
                    className={`px-8 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'purchases' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Мои покупки
                </button>
                {user?.role === 'ROLE_SELLER' && (
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`px-8 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'sales' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Мои продажи
                    </button>
                )}
            </div>

            {/* Список заказов */}
            <div className="space-y-6">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                        <Package size={48} className="mx-auto text-slate-200 mb-4"/>
                        <p className="text-slate-400 font-medium italic text-lg">В этой категории пока нет заказов</p>
                    </div>
                ) : (
                    orders.map((order) => {
                        const status = getStatusInfo(order.status);
                        return (
                            <div key={order.id}
                                 className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all">

                                {/* Шапка карточки */}
                                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-3">
                                            <h2 className="text-2xl font-black text-slate-800">№ {order.id}</h2>
                                            <span
                                                className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${status.style}`}>
                        {status.label}
                      </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                            Создан: {new Date(order.createdAt).toLocaleString('ru-RU')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-indigo-600">{order.totalAmount.toFixed(2)}
                                            <span className="text-xs">BYN</span></p>
                                    </div>
                                </div>

                                {/* Блок при отмене */}
                                {order.status === 'CANCELLED' && order.cancellationReason && (
                                    <div
                                        className="mb-8 p-5 bg-red-50 rounded-2xl border border-red-100 flex items-start">
                                        <XCircle size={20} className="text-red-500 mr-3 shrink-0 mt-0.5"/>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-red-400 leading-none mb-1 tracking-wider">Причина
                                                отмены</p>
                                            <p className="text-sm text-red-700 italic">"{order.cancellationReason}"</p>
                                        </div>
                                    </div>
                                )}

                                {/* Детали заказа */}
                                <div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-y border-slate-50 py-8">
                                    <div className="flex items-start">
                                        <div
                                            className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mr-4 shrink-0 shadow-inner">
                                            <MapPin size={22}/>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1 tracking-widest">Адрес
                                                доставки</p>
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed">{order.shippingAddress}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center">
                                            <Info size={14} className="mr-2"/> Состав посылки
                                        </p>
                                        <div className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center text-slate-600 font-semibold">
                                                        <ChevronRight size={14} className="text-indigo-300 mr-1"/>
                                                        {item.productName}
                                                        <span
                                                            className="text-slate-300 ml-2 font-normal">x{item.quantity}</span>
                                                    </div>
                                                    <span
                                                        className="font-black text-slate-800">{item.priceAtPurchase} BYN</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Подвал с кнопками */}
                                <div className="flex flex-wrap items-center justify-end gap-4">
                                    {/* Кнопки для Продавца */}
                                    {activeTab === 'sales' && order.status === 'PAID' && (
                                        <>
                                            <button
                                                onClick={() => handleCancel(order.id)}
                                                className="px-6 py-4 text-red-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-600 transition-colors"
                                            >
                                                Отменить заказ
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                                                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                                            >
                                                <Truck size={18} className="mr-2"/> Отметить отправку
                                            </button>
                                        </>
                                    )}

                                    {/* Кнопки для Покупателя */}
                                    {activeTab === 'purchases' && order.status === 'SHIPPED' && (
                                        <>
                                            <button
                                                onClick={() => handleDispute(order.id)}
                                                className="px-6 py-4 text-amber-500 font-bold text-[10px] uppercase tracking-widest hover:text-amber-700 transition-colors"
                                            >
                                                Товар не получен?
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                                                className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center hover:bg-green-700 transition-all shadow-xl active:scale-95"
                                            >
                                                <CheckCircle size={18} className="mr-2"/> Подтвердить получение
                                            </button>
                                        </>
                                    )}

                                    {/* Статусы завершения */}
                                    {order.status === 'COMPLETED' && (
                                        <div
                                            className="flex items-center text-green-600 bg-green-50 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-green-100">
                                            <CheckCircle size={18} className="mr-3"/> Сделка закрыта
                                        </div>
                                    )}
                                    {order.status === 'CANCELLED' && (
                                        <div
                                            className="flex items-center text-red-400 bg-red-50 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-red-100">
                                            <AlertCircle size={18} className="mr-3"/> Заказ аннулирован
                                        </div>
                                    )}
                                    {order.status === 'DISPUTED' && (
                                        <div
                                            className="flex items-center text-purple-600 bg-purple-50 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-purple-100 animate-pulse">
                                            <AlertCircle size={18} className="mr-3"/> Открыт спор
                                        </div>
                                    )}
                                </div>

                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};