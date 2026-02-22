import { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

export const NotificationBell = () => {
    const { notifications, unreadCount, fetchNotifications, markAsRead, clearAll } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Опрашиваем раз в 10 сек
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleOpen} className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-slate-900">
            {unreadCount}
          </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Уведомления</span>
                        {notifications.length > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); clearAll(); }}
                                className="text-[10px] flex items-center font-bold text-red-400 hover:text-red-600 transition-colors uppercase"
                            >
                                <Trash2 size={12} className="mr-1" /> Очистить
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <CheckCheck size={32} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-slate-400 text-xs font-medium">Нет новых уведомлений</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className={`p-4 border-b border-slate-50 last:border-0 transition-colors ${!n.isRead ? 'bg-indigo-50/20' : ''}`}>
                                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                                    <span className="text-[9px] text-slate-300 mt-2 block font-bold">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};