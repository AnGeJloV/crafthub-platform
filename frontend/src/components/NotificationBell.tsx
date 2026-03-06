import { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, CheckCheck, ShieldCheck, Package, Tag, MessageCircle, Clock } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

/**
 * Колокольчик в шапке сайта с выпадающим списком уведомлений в реальном времени
 */

export const NotificationBell = () => {
    const { notifications, unreadCount, fetchNotifications, markAsRead, clearAll } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            markAsRead();
        }
    };

    // Вспомогательная функция для настройки стиля уведомления
    const getNotificationStyle = (type: string) => {
        switch (type) {
            case 'VERIFICATION':
                return {
                    icon: ShieldCheck,
                    color: 'text-indigo-600',
                    bg: 'bg-indigo-50',
                    label: 'Безопасность'
                };
            case 'ORDER':
                return {
                    icon: Package,
                    color: 'text-green-600',
                    bg: 'bg-green-50',
                    label: 'Заказ'
                };
            case 'PRODUCT':
                return {
                    icon: Tag,
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                    label: 'Товар'
                };
            case 'MESSAGE':
                return {
                    icon: MessageCircle,
                    color: 'text-blue-500',
                    bg: 'bg-blue-50',
                    label: 'Сообщение'
                };
            default:
                return {
                    icon: Bell,
                    color: 'text-slate-400',
                    bg: 'bg-slate-50',
                    label: 'Инфо'
                };
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleOpen} className="relative p-2.5 text-slate-400 hover:text-white transition-all active:scale-90">
                <Bell size={22} strokeWidth={2.5} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-slate-900 animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">

                    <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Уведомления</span>
                            <span className="text-xs font-bold text-slate-800">{unreadCount} новых</span>
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); clearAll(); }}
                                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-16 text-center">
                                <CheckCheck size={48} className="mx-auto text-slate-100 mb-4" />
                                <p className="text-slate-400 text-xs font-black tracking-widest leading-relaxed">Все уведомления<br/>прочитаны</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const style = getNotificationStyle(n.type);
                                const Icon = style.icon;

                                return (
                                    <div
                                        key={n.id}
                                        className={`p-5 border-b border-slate-50 last:border-0 transition-all flex gap-4 items-start ${!n.isRead ? 'bg-indigo-50/10' : 'hover:bg-slate-50/50'}`}
                                    >

                                        <div className={`shrink-0 w-10 h-10 ${style.bg} ${style.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                                            <Icon size={20} />
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${style.color}`}>{style.label}</span>
                                                <span className="text-[9px] text-slate-300 font-bold flex items-center tracking-tighter">
                                                    <Clock size={10} className="mr-1" />
                                                    {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-bold leading-relaxed">{n.message}</p>
                                        </div>

                                        {!n.isRead && (
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-2 shadow-sm shadow-indigo-200"></div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};