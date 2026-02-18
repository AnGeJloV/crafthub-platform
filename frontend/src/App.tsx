import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function App() {
    return (
        <BrowserRouter>
            <header className="bg-gray-800 text-white p-4">
                <nav className="container mx-auto flex justify-between">
                    <Link to="/" className="hover:text-gray-300">CraftHub</Link>
                    <div className="space-x-4">
                        <Link to="/login" className="hover:text-gray-300">Войти</Link>
                        <Link to="/register" className="hover:text-gray-300">Регистрация</Link>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto p-4">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;