import axios from 'axios';
import keycloak from './keycloak';

const analyticsApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ANALYTICS_SERVICE_URL || 'http://localhost:3014',
    headers: {
        'Content-Type': 'application/json',
    },
});

analyticsApi.interceptors.request.use(
    async (config) => {
        if (keycloak && keycloak.token) {
            try {
                // Update token if it expires in less than 30 seconds
                await keycloak.updateToken(30);
                config.headers.Authorization = `Bearer ${keycloak.token}`;
            } catch (error) {
                console.error('Failed to refresh token for analytics', error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default analyticsApi;
