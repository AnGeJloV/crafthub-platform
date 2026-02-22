import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

export const NotificationBell = () => {
    const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        // Обновляем уведомления каждые 30 секунд
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        if (!isOpen && unreadCount > 0) {
            markAsRead();
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggle} className="relative p-2 text-gray-300 hover:text-white transition-colors">
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-gray-800">
            {unreadCount}
          </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-black text-slate-800">Уведомления</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm italic">У вас пока нет уведомлений</div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className={`p-4 border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                                    <p className="text-sm text-slate-700 leading-snug">{n.message}</p>
                                    <span className="text-[10px] text-slate-400 mt-2 block uppercase font-bold">
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