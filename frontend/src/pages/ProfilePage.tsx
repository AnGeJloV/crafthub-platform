import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useAuthStore } from '../store/authStore';
import { ProductCard } from '../components/ProductCard';
import { Mail, Phone, Edit3, Camera, Save, ArrowLeft, Star, User as UserIcon, X, Calendar, ShoppingBag, ShieldCheck, Lock, PackageOpen } from 'lucide-react';

interface ProductImage {
    imageUrl: string;
    isMain: boolean;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryDisplayName: string;
    sellerName: string;
    sellerEmail: string;
    averageRating: number;
    reviewsCount: number;
    images: ProductImage[];
}

interface UserProfile {
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    avatarUrl: string | null;
    bio: string | null;
    averageRating: number;
    reviewsCount: number;
    createdAt: string;
    totalOrders: number;
    products: Product[];
}

export const ProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);

    const [editForm, setEditForm] = useState({ fullName: '', phoneNumber: '', bio: '' });
    const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '' });

    const isMyProfile = !id || (profile && currentUser && profile.email === currentUser.email);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = id ? `/users/${id}` : '/users/me';
            const res = await apiClient.get<UserProfile>(endpoint);
            setProfile(res.data);
            setEditForm({
                fullName: res.data.fullName,
                phoneNumber: res.data.phoneNumber,
                bio: res.data.bio || ''
            });
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        void fetchProfile();
    }, [fetchProfile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.patch('/users/me', editForm);
            alert('Профиль обновлен');
            setIsEditing(false);
            void fetchProfile();
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            alert('Ошибка при обновлении данных');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await apiClient.post('/users/me/password', passForm);
            alert('Пароль успешно изменен');
            setIsPassModalOpen(false);
            setPassForm({ oldPassword: '', newPassword: '' });
        } catch (error) {
            console.error('Ошибка смены пароля:', error);
            alert('Не удалось сменить пароль. Проверьте старый пароль.');
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const formData = new FormData();
            formData.append('file', e.target.files[0]);
            try {
                await apiClient.post('/users/me/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                void fetchProfile();
            } catch (error) {
                console.error('Ошибка загрузки аватара:', error);
                alert('Ошибка загрузки фото');
            }
        }
    };

    if (loading) return <div className="text-center mt-20 text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Загрузка профиля...</div>;
    if (!profile) return null;

    const isSeller = profile.role === 'ROLE_SELLER';

    return (
        <div className="container mx-auto px-4 py-8 pb-20 max-w-6xl">
            {id && (
                <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-indigo-600 mb-8 font-bold text-xs uppercase tracking-widest transition-colors group">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Назад
                </button>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* ЛЕВАЯ КОЛОНКА */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-8 flex flex-col items-center relative">

                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-4xl overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                                <img
                                    src={profile.avatarUrl ? `http://localhost:8080/uploads/${profile.avatarUrl}` : `https://ui-avatars.com/api/?name=${profile.fullName}&background=6366f1&color=fff&size=128`}
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                            </div>
                            {isMyProfile && (
                                <label className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2.5 rounded-2xl cursor-pointer hover:bg-indigo-600 transition-all border-4 border-white">
                                    <Camera size={18} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="w-full space-y-3">
                                <input className="w-full border-2 border-slate-50 bg-slate-50 p-3 rounded-xl text-center font-bold outline-none focus:border-indigo-500 transition-all" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} placeholder="ФИО" />
                                <input className="w-full border-2 border-slate-50 bg-slate-50 p-3 rounded-xl text-center font-bold outline-none focus:border-indigo-500 transition-all" value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} placeholder="Телефон" />
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-slate-800 leading-tight">{profile.fullName}</h2>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">{profile.role.replace('ROLE_', '')}</span>
                                    <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                                        <Calendar size={12} className="mr-1" /> с {new Date(profile.createdAt).getFullYear()} года
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* СТАТИСТИКА: Адаптивная сетка в зависимости от роли */}
                        <div className={`grid ${isSeller ? 'grid-cols-2' : 'grid-cols-1'} gap-4 w-full mt-8`}>
                            <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
                                <div className="text-indigo-600 mb-1 flex justify-center"><ShoppingBag size={20} /></div>
                                <div className="text-lg font-black text-slate-800">{profile.totalOrders}</div>
                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{isSeller ? 'Продаж' : 'Покупок'}</div>
                            </div>

                            {/* Рейтинг только для продавцов */}
                            {isSeller && (
                                <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
                                    <div className="text-yellow-500 mb-1 flex justify-center"><Star size={20} className="fill-yellow-500" /></div>
                                    <div className="text-lg font-black text-slate-800">{(profile.averageRating || 0).toFixed(1)}</div>
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Рейтинг</div>
                                </div>
                            )}
                        </div>

                        <div className="w-full border-t border-slate-50 mt-8 pt-8 space-y-4">
                            <div className="flex items-center text-slate-500 text-sm font-medium"><Mail size={16} className="mr-4 text-indigo-400" /> {profile.email}</div>
                            {!isEditing && <div className="flex items-center text-slate-500 text-sm font-medium"><Phone size={16} className="mr-4 text-indigo-400" /> {profile.phoneNumber}</div>}
                        </div>

                        {isMyProfile && (
                            <div className="w-full mt-8 space-y-2">
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button onClick={handleUpdateProfile} className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center"><Save size={16} className="mr-2" /> Сохранить</button>
                                        <button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-400 p-3 rounded-2xl hover:bg-slate-200 transition-all"><X size={20} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-center py-3 border-2 border-slate-50 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                                            <Edit3 size={16} className="mr-2" /> Редактировать
                                        </button>
                                        <button onClick={() => setIsPassModalOpen(true)} className="w-full flex items-center justify-center py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all">
                                            <ShieldCheck size={14} className="mr-2" /> Безопасность
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Биография</h3>
                        {isEditing ? (
                            <textarea className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 transition-all font-medium" rows={4} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} placeholder="Расскажите о себе..." />
                        ) : (
                            <p className="text-slate-600 text-sm leading-relaxed italic">{profile.bio || "Участник маркетплейса CraftHub."}</p>
                        )}
                    </div>
                </div>

                {/* ПРАВАЯ КОЛОНКА */}
                <div className="lg:col-span-2">
                    {isSeller ? (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Витрина мастера</h3>
                                <span className="bg-white px-3 py-1 rounded-full border border-slate-100 text-slate-400 font-bold text-xs">{profile.products.length} изделий</span>
                            </div>
                            {profile.products.length === 0 ? (
                                <div className="text-center py-24 bg-white rounded-4xl border-2 border-dashed border-slate-100">
                                    <PackageOpen size={64} className="mx-auto text-slate-100 mb-4" />
                                    <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Товары отсутствуют</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {profile.products.map(p => <ProductCard key={p.id} product={p} />)}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-white rounded-4xl border border-slate-100 p-12 text-center shadow-sm min-h-[400px]">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner shadow-indigo-100/50">
                                <UserIcon size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Покупатель</h3>
                            <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
                                Этот пользователь пока не является мастером, но активно поддерживает локальных производителей.
                            </p>
                            {isMyProfile && (
                                <button
                                    onClick={() => navigate('/become-seller')}
                                    className="mt-8 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                >
                                    Хочу стать мастером
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* МОДАЛКА ПАРОЛЯ */}
            {isPassModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                    <form onSubmit={handlePasswordChange} className="bg-white rounded-4xl p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6"><Lock size={32} /></div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Смена пароля</h3>
                        <p className="text-slate-400 text-sm mb-8 font-medium">Обновите ваши данные для защиты аккаунта.</p>
                        <div className="space-y-4 mb-8">
                            <input type="password" placeholder="Текущий пароль" required className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold" value={passForm.oldPassword} onChange={e => setPassForm({...passForm, oldPassword: e.target.value})} />
                            <input type="password" placeholder="Новый пароль" required className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Обновить</button>
                            <button type="button" onClick={() => setIsPassModalOpen(false)} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Отмена</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};