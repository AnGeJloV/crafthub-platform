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
    clearAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,

    fetchNotifications: async () => {
        try {
            const res = await apiClient.get('/notifications');
            const data = res.data;
            set({
                notifications: data,
                unreadCount: data.filter((n: Notification) => !n.isRead).length
            });
        } catch (e) { console.error(e); }
    },

    markAsRead: async () => {
        if (get().unreadCount === 0) return;
        try {
            await apiClient.post('/notifications/mark-as-read');
            set(state => ({
                unreadCount: 0,
                notifications: state.notifications.map(n => ({ ...n, isRead: true }))
            }));
        } catch (e) { console.error(e); }
    },

    clearAll: async () => {
        try {
            await apiClient.delete('/notifications/clear');
            set({ notifications: [], unreadCount: 0 });
        } catch (e) { console.error(e); }
    }
}));