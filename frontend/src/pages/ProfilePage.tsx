import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useAuthStore } from '../store/authStore';
import { ProductCard } from '../components/ProductCard';
import { Mail, Phone, Edit3, Camera, Save, ArrowLeft, Package, Star } from 'lucide-react';

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
    const { id } = useParams<{ id: string }>(); // Если ID есть - это чужой профиль
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Состояния для формы редактирования
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
            alert('Пользователь не найден');
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
            await apiClient.patch('/api/users/me', editForm);
            alert('Профиль обновлен');
            setIsEditing(false);
            void fetchProfile();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert('Ошибка при обновлении профиля');
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                alert('Ошибка загрузки аватара');
            }
        }
    };

    if (loading) return <div className="text-center mt-20 animate-pulse text-slate-400 font-bold uppercase tracking-widest">Загрузка профиля...</div>;
    if (!profile) return null;

    return (
        <div className="container mx-auto px-4 py-8 pb-20 max-w-6xl">
            {/* Шапка с кнопкой назад (только если профиль чужой) */}
            {id && (
                <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-indigo-600 mb-8 transition-colors font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft size={16} className="mr-2" /> Назад
                </button>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* ЛЕВАЯ КОЛОНКА: Инфо о пользователе */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
                        {/* Аватарка */}
                        <div className="relative group mb-6">
                            <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-slate-100 border-4 border-white shadow-md">
                                <img
                                    src={profile.avatarUrl ? `http://localhost:8080/uploads/${profile.avatarUrl}` : `https://ui-avatars.com/api/?name=${profile.fullName}&background=6366f1&color=fff&size=128`}
                                    className="w-full h-full object-cover"
                                    alt={profile.fullName}
                                />
                            </div>
                            {isMyProfile && (
                                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-xl cursor-pointer hover:bg-indigo-700 transition-all shadow-lg">
                                    <Camera size={18} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            )}
                        </div>

                        <h2 className="text-2xl font-black text-slate-800">{profile.fullName}</h2>
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter mt-2">
                {profile.role.replace('ROLE_', '')}
            </span>

                        {/* Рейтинг мастера (если есть) */}
                        {profile.reviewsCount > 0 && (
                            <div className="flex items-center mt-4 bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100">
                                <Star size={16} className="text-yellow-500 fill-yellow-500 mr-2" />
                                <span className="font-black text-yellow-700">{profile.averageRating.toFixed(1)}</span>
                                <span className="text-yellow-600/50 mx-2">|</span>
                                <span className="text-xs font-bold text-yellow-600">{profile.reviewsCount} отзывов</span>
                            </div>
                        )}

                        <div className="w-full border-t border-slate-50 mt-8 pt-8 space-y-4 text-left">
                            <div className="flex items-center text-slate-500 text-sm">
                                <Mail size={16} className="mr-3 text-indigo-500" /> {profile.email}
                            </div>
                            <div className="flex items-center text-slate-500 text-sm">
                                <Phone size={16} className="mr-3 text-indigo-500" /> {profile.phoneNumber}
                            </div>
                        </div>

                        {isMyProfile && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full mt-8 flex items-center justify-center py-3 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                            >
                                <Edit3 size={16} className="mr-2" /> Редактировать профиль
                            </button>
                        )}
                    </div>

                    {/* Блок BIO */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">О себе</h3>
                        {isEditing ? (
                            <textarea
                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 transition-all"
                                rows={5}
                                value={editForm.bio}
                                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                            />
                        ) : (
                            <p className="text-slate-600 text-sm leading-relaxed italic">
                                {profile.bio || "Пользователь еще не добавил описание."}
                            </p>
                        )}
                    </div>

                    {isEditing && (
                        <button
                            onClick={handleUpdateProfile}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
                        >
                            <Save size={20} className="mr-2" /> СОХРАНИТЬ ИЗМЕНЕНИЯ
                        </button>
                    )}
                </div>

                {/* ПРАВАЯ КОЛОНКА: Товары мастера */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center">
                            <Package size={24} className="mr-3 text-indigo-500" />
                            {isMyProfile ? 'Мои активные товары' : `Изделия мастера`}
                        </h3>
                        <span className="text-slate-400 font-bold text-sm">{profile.products.length} шт.</span>
                    </div>

                    {profile.products.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium">Товары отсутствуют</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile.products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};