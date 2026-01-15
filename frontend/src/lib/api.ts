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
        const url = config.url || '';
        const isPublic = PUBLIC_ENDPOINTS.some(path => url.endsWith(path) || url.includes(path));

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
        const url = error.config?.url || '';
        const status = error.response?.status;
        const isAuthRequest = url.includes('/auth/');
        const isPublic = PUBLIC_ENDPOINTS.some(path => url.includes(path));

        if (status === 401) {
            console.warn(`[API] 401 Error at ${url}. isAuthRequest: ${isAuthRequest}, isPublic: ${isPublic}`);

            // Do NOT redirect if:
            // 1. It's an Auth request (login/register)
            // 2. It's a Public endpoint
            // 3. We are ALREADY on the login page (to prevent loops)
            if (!isAuthRequest && !isPublic && typeof window !== 'undefined') {
                if (window.location.pathname !== '/login') {
                    console.info('[API] Redirecting to login due to unauthorized protected request');
                    keycloak?.login();
                } else {
                    console.info('[API] Suppressing redirect because we are already on /login');
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
