import axios from 'axios';
import keycloak from './keycloak';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/login/2fa'];

api.interceptors.request.use(
    async (config) => {
        console.log('DEBUG: API Interceptor called for', config.url);

        // Skip token attachment for public endpoints
        const isPublic = config.url && PUBLIC_ENDPOINTS.some(path => config.url?.includes(path));
        if (isPublic) {
            console.log('DEBUG: Public endpoint detected, skipping token.');
            return config;
        }

        if (keycloak) {
            console.log('DEBUG: Keycloak instance exists. Token present:', !!keycloak.token);
            if (keycloak.token) {
                try {
                    // Update token if it expires in less than 30 seconds
                    await keycloak.updateToken(30);
                    config.headers.Authorization = `Bearer ${keycloak.token}`;
                    console.log(`DEBUG: Token attached to header for: ${config.url}. Token prefix: ${keycloak.token.substring(0, 20)}...`);
                } catch (error) {
                    console.error('DEBUG: Failed to update token', error);
                    // Redirect to login if token is invalid/expired
                    keycloak.login();
                }
            } else {
                console.warn(`DEBUG: Keycloak token is missing for protected route: ${config.url}`);
                // Only trigger login if we're not already on a login/auth page
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    keycloak.login();
                }
            }
        } else {
            console.error('DEBUG: Keycloak instance is missing in interceptor!');
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
