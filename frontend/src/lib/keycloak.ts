import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'freelance-marketplace',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'freelance-frontend',
};

const keycloak = typeof window !== 'undefined' ? new Keycloak(keycloakConfig) : null;

if (keycloak) {
    keycloak.onAuthSuccess = () => {
        if (keycloak.token) localStorage.setItem('kc_token', keycloak.token);
        if (keycloak.refreshToken) localStorage.setItem('kc_refreshToken', keycloak.refreshToken);
    };

    keycloak.onAuthRefreshSuccess = () => {
        if (keycloak.token) localStorage.setItem('kc_token', keycloak.token);
        if (keycloak.refreshToken) localStorage.setItem('kc_refreshToken', keycloak.refreshToken);
    };

    keycloak.onAuthLogout = () => {
        localStorage.removeItem('kc_token');
        localStorage.removeItem('kc_refreshToken');
    };
}

export default keycloak;
