import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerificationPage } from './pages/VerificationPage';
import { AdminPage } from './pages/AdminPage';
import { MyProductsPage } from './pages/MyProductsPage';
import { AddProductPage } from './pages/AddProductPage';
import { CartPage } from './pages/CartPage'; // Не забудь импорт
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
        <header className="bg-gray-800 text-white p-4 shadow-lg sticky top-0 z-50">
            <nav className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold hover:text-indigo-400 transition-colors">
                    CraftHub
                </Link>

                <div className="flex items-center space-x-6">
                    <Link to="/" className="hover:text-indigo-300 text-sm font-medium">Главная</Link>

                    {user ? (
                        <>
                            {user.role === 'ROLE_USER' && (
                                <Link to="/become-seller" className="bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium">
                                    Стать продавцом
                                </Link>
                            )}

                            {user.role === 'ROLE_SELLER' && (
                                <Link to="/my-products" className="bg-green-600 px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                                    Мои товары
                                </Link>
                            )}

                            {user.role === 'ROLE_ADMIN' && (
                                <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 font-bold text-sm">
                                    Панель Админа
                                </Link>
                            )}

                            <Link to="/cart" className="relative p-2 text-gray-300 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {items.length > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-gray-800">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                                )}
                            </Link>

                            <div className="flex items-center space-x-4 border-l pl-6 border-gray-600">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-gray-400 uppercase font-black leading-none">{user.role.replace('ROLE_', '')}</span>
                                    <span className="text-sm text-gray-200 font-semibold">{user.fullName}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-1.5 rounded border border-red-500/50 transition-all"
                                >
                                    Выйти
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-indigo-300 text-sm font-medium">Войти</Link>
                            <Link to="/register" className="border border-indigo-500 px-4 py-1.5 rounded-md hover:bg-indigo-500 transition-all text-sm font-medium">
                                Регистрация
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <Header />
                <main className="container mx-auto p-4">
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