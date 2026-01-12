import axios from 'axios';
import keycloak from './keycloak';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const PUBLIC_ENDPOINTS = [
    '/auth/login',
    '/auth/register',
    '/auth/login/2fa',
    '/jobs/categories',
    '/jobs/skills',
    '/search/jobs',
    '/payments/exchange-rates'
];

api.interceptors.request.use(
    async (config) => {
        // Skip token attachment for public endpoints if needed, 
        // but it's better to always attach if token exists
        const isPublic = config.url && PUBLIC_ENDPOINTS.some(path => config.url?.includes(path));

        if (keycloak && keycloak.token) {
            try {
                // Update token if it expires in less than 30 seconds
                await keycloak.updateToken(30);
                config.headers.Authorization = `Bearer ${keycloak.token}`;
            } catch (error) {
                console.error('Failed to refresh token', error);
                // If refreshing fails, clear tokens
                localStorage.removeItem('kc_token');
                localStorage.removeItem('kc_refreshToken');
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle session expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect to login if it's a 401 on a non-public route
            const isPublic = error.config.url && PUBLIC_ENDPOINTS.some(path => error.config.url.includes(path));
            if (!isPublic && typeof window !== 'undefined') {
                keycloak?.login();
            }
        }
        return Promise.reject(error);
    }
);

export default api;
