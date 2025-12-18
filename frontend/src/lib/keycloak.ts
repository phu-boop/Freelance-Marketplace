import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'freelance-marketplace',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'freelance-client',
};

const keycloak = typeof window !== 'undefined' ? new Keycloak(keycloakConfig) : null;

export default keycloak;
