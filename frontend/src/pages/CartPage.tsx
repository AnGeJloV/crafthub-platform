import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { Minus, Plus, Trash2 } from 'lucide-react';

export const CartPage = () => {
    const { items, totalAmount, clearCartLocal, updateQuantity, removeItem, clearCartServer } = useCartStore();
    const navigate = useNavigate();

    const [address, setAddress] = useState({ city: '', street: '', house: '', index: '' });
    const [isConfirming, setIsConfirming] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const fullShippingAddress = `${address.index}, г. ${address.city}, ул. ${address.street}, д. ${address.house}`;

    const confirmPurchase = async () => {
        setIsProcessing(true);
        try {
            const orderItems = items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }));

            await apiClient.post('/orders', {
                shippingAddress: fullShippingAddress,
                items: orderItems
            });

            clearCartLocal();
            alert('Заказ успешно оформлен!');
            navigate('/orders');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            alert('Ошибка при оформлении заказа');
        } finally {
            setIsProcessing(false);
            setIsConfirming(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="text-center mt-20">
                <h2 className="text-2xl font-bold text-gray-300">Ваша корзина пуста</h2>
                <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 font-bold">К покупкам</button>
            </div>
        );
    }

    return (
        <div className="container mx-auto mt-10 px-4 max-w-5xl">
            <div className="flex justify-between items-end mb-8">
                <h1 className="text-4xl font-black">Корзина</h1>
                <button
                    onClick={() => confirm('Очистить корзину?') && clearCartServer()}
                    className="text-red-500 text-sm font-semibold hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                >
                    Очистить всё
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.productId} className="flex items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group">
                            <img src={`http://localhost:8080/uploads/${item.imageUrl}`} className="w-24 h-24 object-cover rounded-xl" alt="" />

                            <div className="ml-6 flex-grow">
                                <h4 className="font-bold text-lg text-gray-800">{item.productName}</h4>
                                <p className="text-indigo-600 font-black">{item.price} BYN</p>

                                {/* Регулятор количества */}
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl border-2 border-gray-100 text-gray-400 hover:border-indigo-500 hover:text-indigo-500 disabled:opacity-20 disabled:hover:border-gray-100 transition-all"
                                    >
                                        <Minus size={14} strokeWidth={3} />
                                    </button>
                                    <span className="font-black text-slate-700 w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl border-2 border-gray-100 text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-all"
                                    >
                                        <Plus size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>

                            <div className="text-right flex flex-col justify-between h-24 ml-4">
                                <button
                                    onClick={() => removeItem(item.productId)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-end"
                                    title="Удалить"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <p className="font-black text-xl text-slate-900">
                                    {(item.price * item.quantity).toFixed(2)} <span className="text-[10px] text-gray-400">BYN</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Форма оформления */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border h-fit sticky top-4">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Адрес доставки</h3>
                    <div className="space-y-3 mb-6 text-sm">
                        <input placeholder="Город" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                        <input placeholder="Улица" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            <input placeholder="Дом / Кв" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={address.house} onChange={e => setAddress({...address, house: e.target.value})} />
                            <input placeholder="Индекс" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={address.index} onChange={e => setAddress({...address, index: e.target.value})} />
                        </div>
                    </div>

                    <div className="border-t pt-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 font-medium">К оплате:</span>
                            <span className="text-2xl font-black text-indigo-600">{totalAmount.toFixed(2)} BYN</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if(!address.city || !address.street) return alert('Введите адрес');
                            setIsConfirming(true);
                        }}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98]"
                    >
                        Подтвердить и оплатить
                    </button>
                </div>
            </div>

            {/* Модальное окно подтверждения */}
            {isConfirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Безопасная сделка</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            Вы подтверждаете покупку? Средства будут заблокированы системой и переведены мастеру только после получения вами товара.
                        </p>
                        <div className="bg-indigo-50 p-4 rounded-xl mb-6 text-xs text-indigo-800">
                            <span className="font-bold uppercase block mb-1 opacity-60 text-[10px]">Адрес:</span>
                            {fullShippingAddress}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                disabled={isProcessing}
                                onClick={confirmPurchase}
                                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                            >
                                {isProcessing ? 'Оплата...' : 'Да, оплатить'}
                            </button>
                            <button
                                disabled={isProcessing}
                                onClick={() => setIsConfirming(false)}
                                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
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