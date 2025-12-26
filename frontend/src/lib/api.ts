import axios from 'axios';
import keycloak from './keycloak';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        if (keycloak && keycloak.token) {
            try {
                // Update token if it expires in less than 30 seconds
                await keycloak.updateToken(30);
                config.headers.Authorization = `Bearer ${keycloak.token}`;
            } catch (error) {
                console.error('Failed to refresh token', error);
                keycloak.login();
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
