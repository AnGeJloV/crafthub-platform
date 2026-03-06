import {useEffect, useState} from 'react';
import {useCartStore} from '../store/cartStore';
import {useNavigate} from 'react-router-dom';
import apiClient from '../api';
import {Minus, Plus, Trash2, Save} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Корзина покупок: управление количеством, расчет суммы и форма "Безопасной сделки"
 * */

export const CartPage = () => {
    const {items, totalAmount, clearCartLocal, updateQuantity, removeItem, clearCartServer} = useCartStore();
    const navigate = useNavigate();

    const [address, setAddress] = useState({city: '', street: '', house: '', index: ''});
    const [saveAddress, setSaveAddress] = useState(false);
    const [hasSavedAddress, setHasSavedAddress] = useState(false);


    const [isConfirming, setIsConfirming] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfileAddress = async () => {
            try {
                const res = await apiClient.get('/users/me');
                if (res.data.city && res.data.street) {
                    setAddress({
                        city: res.data.city,
                        street: res.data.street,
                        house: res.data.house || '',
                        index: res.data.zipCode || ''
                    });
                    setHasSavedAddress(true);
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                console.error("Не удалось загрузить адрес из профиля");
            }
        };
        void fetchProfileAddress();
    }, []);

    const fullShippingAddress = `${address.index}, г. ${address.city}, ул. ${address.street}, д. ${address.house}`;

    const handleForgetAddress = async () => {
        try {
            await apiClient.patch('/users/me', {
                fullName: (await apiClient.get('/users/me')).data.fullName, // Нам нужно передать обязательные поля
                phoneNumber: (await apiClient.get('/users/me')).data.phoneNumber,
                city: null,
                street: null,
                house: null,
                zipCode: null
            });
            setAddress({city: '', street: '', house: '', index: ''});
            setHasSavedAddress(false);
            setSaveAddress(false);
            toast.success('Адрес удален');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            toast.error('Не удалось удалить адрес');
        }
    };

    const confirmPurchase = async () => {
        setIsProcessing(true);
        try {
            if (saveAddress) {
                const profile = (await apiClient.get('/users/me')).data;
                await apiClient.patch('/users/me', {
                    fullName: profile.fullName,
                    phoneNumber: profile.phoneNumber,
                    bio: profile.bio,
                    city: address.city,
                    street: address.street,
                    house: address.house,
                    zipCode: address.index
                });
            }

            const orderItems = items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }));

            await apiClient.post('/orders', {
                shippingAddress: fullShippingAddress,
                items: orderItems
            });

            clearCartLocal();
            toast.success('Заказ успешно оформлен!');
            navigate('/orders');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            toast.error('Ошибка при оформлении заказа');
        } finally {
            setIsProcessing(false);
            setIsConfirming(false);
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCartServer();
            toast.success('Корзина очищена');
            setIsClearModalOpen(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            toast.error('Не удалось очистить корзину');
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
                    onClick={() => setIsClearModalOpen(true)}
                    className="bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100 active:scale-95"
                >
                    Очистить всё
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.productId}
                             className="flex items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group">
                            <img src={`http://localhost:8080/uploads/${item.imageUrl}`}
                                 className="w-24 h-24 object-cover rounded-xl" alt=""/>

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
                                        <Minus size={14} strokeWidth={3}/>
                                    </button>
                                    <span className="font-black text-slate-700 w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl border-2 border-gray-100 text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-all"
                                    >
                                        <Plus size={14} strokeWidth={3}/>
                                    </button>
                                </div>
                            </div>

                            <div className="text-right flex flex-col justify-between h-24 ml-4">
                                <button
                                    onClick={() => removeItem(item.productId)}
                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all self-end border border-red-100"
                                    title="Удалить"
                                >
                                    <Trash2 size={18}/>
                                </button>
                                <p className="font-black text-xl text-slate-900">
                                    {(item.price * item.quantity).toFixed(2)} <span
                                    className="text-[10px] text-gray-400">BYN</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Форма оформления */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border h-fit sticky top-4">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Адрес доставки</h3>
                    <div className="space-y-3 mb-6 text-sm">
                        <input placeholder="Город"
                               className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                               value={address.city} onChange={e => setAddress({...address, city: e.target.value})}/>
                        <input placeholder="Улица"
                               className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                               value={address.street} onChange={e => setAddress({...address, street: e.target.value})}/>
                        <div className="grid grid-cols-2 gap-2">
                            <input placeholder="Дом / Кв"
                                   className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                   value={address.house}
                                   onChange={e => setAddress({...address, house: e.target.value})}/>
                            <input placeholder="Индекс"
                                   className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                   value={address.index}
                                   onChange={e => setAddress({...address, index: e.target.value})}/>
                        </div>
                    </div>

                    {hasSavedAddress && (
                        <label className="flex items-center space-x-1 mb-4 cursor-pointer group">
                            <div className="relative flex items-center">
                                <button
                                    onClick={handleForgetAddress}
                                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                            <span className="text-xs font-bold text-red-400 group-hover:text-red-500 transition-colors">Забыть сохраненный адрес</span>
                        </label>
                    )}

                    {!hasSavedAddress && (
                        <label className="flex items-center space-x-1 mb-4 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-200 transition-all checked:border-indigo-600 checked:bg-indigo-600"
                                    checked={saveAddress}
                                    onChange={(e) => setSaveAddress(e.target.checked)}
                                />
                                <Save size={12}
                                      className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity"/>
                            </div>
                            <span
                                className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">Запомнить этот адрес</span>
                        </label>
                    )}

                    <div className="border-t pt-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 font-medium">К оплате:</span>
                            <span className="text-2xl font-black text-indigo-600">{totalAmount.toFixed(2)} BYN</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (!address.city || !address.street) return toast.error('Пожалуйста, укажите город и улицу');
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
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Безопасная сделка</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            Вы подтверждаете покупку? Средства будут заблокированы системой и переведены мастеру только
                            после получения вами товара.
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
                                className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isClearModalOpen && (
                <div
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl relative animate-in zoom-in duration-300">
                        <div
                            className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <Trash2 size={32}/>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 text-center">Очистить корзину?</h3>
                        <p className="text-slate-400 text-sm mb-8 font-medium text-center leading-relaxed">
                            Все выбранные товары будут удалены из вашего списка покупок.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleClearCart}
                                className="flex-1 bg-red-50 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white border border-red-100 transition-all active:scale-95"
                            >
                                Удалить всё
                            </button>
                            <button
                                onClick={() => setIsClearModalOpen(false)}
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