import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerificationPage } from './pages/VerificationPage';
import { AdminPage } from './pages/AdminPage';
import { MyProductsPage } from './pages/MyProductsPage';
import { AddProductPage } from './pages/AddProductPage';
import { useAuthStore } from './store/authStore';

// Компонент Хедера с динамическим меню
const Header = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-gray-800 text-white p-4 shadow-lg">
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

                            <div className="flex items-center space-x-4 border-l pl-6 border-gray-600">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-400 uppercase font-bold">{user.role.replace('ROLE_', '')}</span>
                                    <span className="text-sm text-gray-200">{user.fullName}</span>
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
            <div className="min-h-screen bg-gray-50 text-gray-900">
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
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;