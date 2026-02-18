import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Перехватчик запросов
apiClient.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem('authToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Перехватчик ответов, на случай если токен протух
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('Сессия истекла или доступ запрещен');
            localStorage.removeItem('authToken');
        }
        return Promise.reject(error);
    }
);

export default apiClient;