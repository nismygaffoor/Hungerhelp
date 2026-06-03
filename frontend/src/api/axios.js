import axios from 'axios';
import i18n from '../i18n';
import { translateApiMessage } from '../utils/translateApiError';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

const localizeResponse = (data) => {
    if (!data || typeof data !== 'object') return;
    const t = i18n.t.bind(i18n);
    if (typeof data.error === 'string') {
        data.error = translateApiMessage(data.error, t);
    }
    if (typeof data.message === 'string') {
        data.message = translateApiMessage(data.message, t);
    }
};

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        localizeResponse(response.data);
        return response;
    },
    (error) => {
        if (error.response?.data) {
            localizeResponse(error.response.data);
        } else if (!error.response) {
            error.message = i18n.t('api.networkError');
        }
        return Promise.reject(error);
    }
);

export default api;
