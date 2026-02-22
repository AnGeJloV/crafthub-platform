import { create } from 'zustand';
import apiClient from '../api';

interface Notification {
    id: number;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    fetchNotifications: () => Promise<void>;
    markAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,

    fetchNotifications: async () => {
        try {
            const response = await apiClient.get('/notifications');
            const data: Notification[] = response.data;
            set({
                notifications: data,
                unreadCount: data.filter(n => !n.isRead).length
            });
        } catch (error) {
            console.error('Ошибка загрузки уведомлений', error);
        }
    },

    markAsRead: async () => {
        try {
            await apiClient.post('/notifications/mark-as-read');
            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Ошибка при прочтении уведомлений', error);
        }
    }
}));