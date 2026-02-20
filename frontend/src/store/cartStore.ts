import { create } from 'zustand';
import apiClient from '../api';

interface CartItem {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    imageUrl: string;
    stockQuantity: number;
}

interface CartState {
    items: CartItem[];
    totalAmount: number;
    fetchCart: () => Promise<void>;
    addItem: (productId: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    removeItem: (productId: number) => Promise<void>;
    clearCartServer: () => Promise<void>;
    clearCartLocal: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    totalAmount: 0,

    fetchCart: async () => {
        const response = await apiClient.get('/cart');
        set({ items: response.data.items, totalAmount: response.data.totalAmount });
    },

    addItem: async (productId: number) => {
        await apiClient.post('/cart/add', { productId, quantity: 1 });
        get().fetchCart();
    },

    updateQuantity: async (productId: number, quantity: number) => {
        await apiClient.patch(`/cart/items/${productId}?quantity=${quantity}`);
        get().fetchCart();
    },

    removeItem: async (productId: number) => {
        await apiClient.delete(`/cart/items/${productId}`);
        get().fetchCart();
    },

    clearCartServer: async () => {
        await apiClient.delete('/cart');
        set({ items: [], totalAmount: 0 });
    },

    clearCartLocal: () => set({ items: [], totalAmount: 0 }),
}));