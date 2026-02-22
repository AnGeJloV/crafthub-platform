import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerificationPage } from './pages/VerificationPage';
import { AdminPage } from './pages/AdminPage';
import { MyProductsPage } from './pages/MyProductsPage';
import { AddProductPage } from './pages/AddProductPage';
import { CartPage } from './pages/CartPage';
import { NotificationBell } from './components/NotificationBell';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

const Header = () => {
    const { user, logout } = useAuthStore();
    const { items, fetchCart, clearCartLocal } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchCart();
        }
    }, [user, fetchCart]);

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
                    <Link to="/" className="hover:text-indigo-300 text-sm font-bold uppercase tracking-widest">Каталог</Link>

                    {user ? (
                        <>
                            {user.role === 'ROLE_USER' && (
                                <Link to="/become-seller" className="bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all text-xs font-black uppercase tracking-widest">
                                    Стать мастером
                                </Link>
                            )}

                            {user.role === 'ROLE_SELLER' && (
                                <Link to="/my-products" className="bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all text-xs font-black uppercase tracking-widest">
                                    Мои товары
                                </Link>
                            )}

                            {user.role === 'ROLE_ADMIN' && (
                                <Link to="/admin" className="text-amber-400 hover:text-amber-300 text-xs font-black uppercase tracking-widest">
                                    Админ-панель
                                </Link>
                            )}

                            <div className="flex items-center space-x-3 border-l border-slate-700 pl-5">
                                <NotificationBell />

                                <Link to="/cart" className="relative p-2 text-slate-300 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {items.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-slate-900">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                                    )}
                                </Link>

                                <div className="hidden md:flex flex-col items-end mr-2">
                                    <span className="text-[9px] text-slate-500 font-black uppercase leading-none mb-1">{user.role.replace('ROLE_', '')}</span>
                                    <span className="text-xs text-slate-200 font-bold">{user.fullName}</span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-400 p-2 rounded-xl border border-slate-700 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="container mx-auto p-4 pt-10">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/become-seller" element={<VerificationPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/my-products" element={<MyProductsPage />} />
                        <Route path="/add-product" element={<AddProductPage />} />
                        <Route path="/cart" element={<CartPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;