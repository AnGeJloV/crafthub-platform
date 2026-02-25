import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerificationPage } from './pages/VerificationPage';
import { AdminPage } from './pages/AdminPage';
import { MyProductsPage } from './pages/MyProductsPage';
import { AddProductPage } from './pages/AddProductPage';
import { EditProductPage } from './pages/EditProductPage';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { ChatPage } from './pages/ChatPage';
import { NotificationBell } from './components/NotificationBell';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';
import { Package, UserCircle, LogOut, MessageCircle, ShoppingCart } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuthStore();
    const { items, fetchCart, clearCartLocal } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            void fetchCart();
        }
    },[user, fetchCart]);

    const handleLogout = () => {
        logout();
        clearCartLocal();
        navigate('/login');
    };

    return (
        <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
            <nav className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-black tracking-tighter hover:text-indigo-400 transition-colors">
                    CRAFT<span className="text-indigo-500">HUB</span>
                </Link>

                <div className="flex items-center space-x-5">
                    {user ? (
                        <>
                            {user.role === 'ROLE_USER' && (
                                <Link to="/become-seller" className="bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all text-xs font-black uppercase tracking-widest hidden md:block">
                                    Стать мастером
                                </Link>
                            )}

                            {user.role === 'ROLE_SELLER' && (
                                <Link to="/my-products" className="bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all text-xs font-black uppercase tracking-widest hidden md:block">
                                    Мои товары
                                </Link>
                            )}

                            {user.role === 'ROLE_ADMIN' && (
                                <Link to="/admin" className="text-amber-400 hover:text-amber-300 text-xs font-black uppercase tracking-widest hidden md:block">
                                    Админ-панель
                                </Link>
                            )}

                            {/* Блок иконок */}
                            <div className="flex items-center space-x-2 border-l border-slate-700 pl-5">
                                <NotificationBell />

                                <Link to="/chat" className="relative p-2 text-slate-300 hover:text-white transition-colors" title="Сообщения">
                                    <MessageCircle size={22} />
                                </Link>

                                {/* Иконка заказов вместо текста */}
                                <Link to="/orders" className="relative p-2 text-slate-300 hover:text-white transition-colors" title="Мои заказы">
                                    <Package size={22} />
                                </Link>

                                <Link to="/cart" className="relative p-2 text-slate-300 hover:text-white transition-colors" title="Корзина">
                                    <ShoppingCart size={22} />
                                    {items.length > 0 && (
                                        <span className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-slate-900">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                                    )}
                                </Link>
                            </div>

                            {/* Профиль и выход */}
                            <div className="flex items-center space-x-3 border-l border-slate-700 pl-5">
                                {/* Ссылка на будущий профиль */}
                                <Link to="/profile" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors group" title="Мой профиль">
                                    <UserCircle size={28} className="group-hover:text-indigo-400 transition-colors" />
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-[9px] text-slate-500 font-black uppercase leading-none mb-1">{user.role.replace('ROLE_', '')}</span>
                                        <span className="text-xs text-slate-200 font-bold group-hover:text-white transition-colors">{user.fullName}</span>
                                    </div>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    title="Выйти"
                                    className="bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-400 p-2 rounded-xl border border-slate-700 transition-all"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-sm font-bold uppercase tracking-widest hover:text-indigo-400">Войти</Link>
                            <Link to="/register" className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">
                                Регистрация
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
                <Header/>
                <main className="container mx-auto p-4 pt-10 flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/register" element={<RegisterPage/>}/>
                        <Route path="/become-seller" element={<VerificationPage/>}/>
                        <Route path="/admin" element={<AdminPage/>}/>
                        <Route path="/my-products" element={<MyProductsPage/>}/>
                        <Route path="/add-product" element={<AddProductPage/>}/>
                        <Route path="/edit-product/:id" element={<EditProductPage/>}/>
                        <Route path="/cart" element={<CartPage/>}/>
                        <Route path="/orders" element={<OrdersPage/>}/>
                        <Route path="/product/:id" element={<ProductDetailsPage/>}/>
                        <Route path="/chat" element={<ChatPage/>}/>
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;