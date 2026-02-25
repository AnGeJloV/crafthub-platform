import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useAuthStore } from '../store/authStore';
import { ProductCard } from '../components/ProductCard';
import { Mail, Phone, Edit3, Camera, Save, ArrowLeft, Package, Star, User as UserIcon, X } from 'lucide-react';

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
    images: { imageUrl: string; isMain: boolean }[];
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
    products: Product[];
}

export const ProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [editForm, setEditForm] = useState({ fullName: '', phoneNumber: '', bio: '' });

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
            // ИСПРАВЛЕНО: путь '/users/me', так как '/api' уже в базовом URL
            await apiClient.patch('/users/me', editForm);
            alert('Данные успешно обновлены');
            setIsEditing(false);
            void fetchProfile();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert('Ошибка при обновлении данных');
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
                void fetchProfile(); // Обновляем профиль, чтобы увидеть новую аватарку
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                alert('Ошибка загрузки фото');
            }
        }
    };

    if (loading) return <div className="text-center mt-20 text-slate-400 font-bold animate-pulse uppercase tracking-widest">Загрузка...</div>;
    if (!profile) return null;

    return (
        <div className="container mx-auto px-4 py-8 pb-20 max-w-6xl">
            {id && (
                <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-indigo-600 mb-8 transition-colors font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft size={16} className="mr-2" /> Назад
                </button>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* ЛЕВАЯ КОЛОНКА */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center relative">

                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                                <img
                                    src={profile.avatarUrl ? `http://localhost:8080/uploads/${profile.avatarUrl}` : `https://ui-avatars.com/api/?name=${profile.fullName}&background=6366f1&color=fff&size=128`}
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                            </div>
                            {isMyProfile && (
                                <label className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2.5 rounded-2xl cursor-pointer hover:bg-indigo-600 transition-all shadow-lg border-4 border-white">
                                    <Camera size={18} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="w-full space-y-3">
                                <input
                                    className="w-full border-2 border-slate-50 bg-slate-50 p-3 rounded-xl text-center font-bold outline-none focus:border-indigo-500 transition-all"
                                    value={editForm.fullName}
                                    onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                                    placeholder="Ваше имя"
                                />
                                <input
                                    className="w-full border-2 border-slate-50 bg-slate-50 p-3 rounded-xl text-center font-bold outline-none focus:border-indigo-500 transition-all"
                                    value={editForm.phoneNumber}
                                    onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})}
                                    placeholder="Номер телефона"
                                />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-black text-slate-800">{profile.fullName}</h2>
                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mt-2">
                    {profile.role.replace('ROLE_', '')}
                </span>
                            </>
                        )}

                        {profile.role === 'ROLE_SELLER' && profile.reviewsCount > 0 && (
                            <div className="flex items-center mt-4 bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100">
                                <Star size={16} className="text-yellow-500 fill-yellow-500 mr-2" />
                                <span className="font-black text-yellow-700">{profile.averageRating.toFixed(1)}</span>
                                <span className="text-yellow-200 mx-2">|</span>
                                <span className="text-xs font-bold text-yellow-600">{profile.reviewsCount} отзывов</span>
                            </div>
                        )}

                        {!isEditing && (
                            <div className="w-full border-t border-slate-50 mt-8 pt-8 space-y-4 text-left">
                                <div className="flex items-center text-slate-500 text-sm font-medium">
                                    <Mail size={16} className="mr-3 text-indigo-400" /> {profile.email}
                                </div>
                                <div className="flex items-center text-slate-500 text-sm font-medium">
                                    <Phone size={16} className="mr-3 text-indigo-400" /> {profile.phoneNumber}
                                </div>
                            </div>
                        )}

                        {isMyProfile && (
                            <div className="w-full mt-8 flex gap-2">
                                {isEditing ? (
                                    <>
                                        <button onClick={handleUpdateProfile} className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center">
                                            <Save size={16} className="mr-2" /> Сохранить
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-400 p-3 rounded-2xl hover:bg-slate-200 transition-all">
                                            <X size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-center py-3 border-2 border-slate-50 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                                        <Edit3 size={16} className="mr-2" /> Редактировать
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">О себе</h3>
                        {isEditing ? (
                            <textarea
                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                                rows={5}
                                value={editForm.bio}
                                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                placeholder="Расскажите о себе или своих работах..."
                            />
                        ) : (
                            <p className="text-slate-600 text-sm leading-relaxed italic">
                                {profile.bio || "Участник CraftHub, который ценит ручную работу."}
                            </p>
                        )}
                    </div>
                </div>

                {/* ПРАВАЯ КОЛОНКА */}
                <div className="lg:col-span-2">
                    {profile.role === 'ROLE_SELLER' ? (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center uppercase tracking-tighter">
                                    <Package size={24} className="mr-3 text-indigo-500" /> Изделия мастера
                                </h3>
                                <span className="bg-white px-3 py-1 rounded-full border border-slate-100 text-slate-400 font-bold text-xs">{profile.products.length} товаров</span>
                            </div>

                            {profile.products.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <PackageOpen className="mx-auto text-slate-100 mb-4" size={64} />
                                    <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Товары на модерации или отсутствуют</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {profile.products.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 p-12 text-center shadow-sm">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-6">
                                <UserIcon size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Покупатель</h3>
                            <p className="text-slate-400 max-w-sm leading-relaxed font-medium">
                                Этот пользователь пока только присматривается к уникальным изделиям наших мастеров.
                            </p>
                            {isMyProfile && profile.role === 'ROLE_USER' && (
                                <button
                                    onClick={() => navigate('/become-seller')}
                                    className="mt-8 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                >
                                    Стать мастером
                                </button>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

// Вспомогательный компонент для пустой коробки
const PackageOpen = ({ size, className }: { size: number, className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m8 3 4 8 5-5-5 15-2-10z"/></svg>
);