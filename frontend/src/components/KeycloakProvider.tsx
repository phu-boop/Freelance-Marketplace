'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '@/lib/keycloak';

interface KeycloakContextType {
    authenticated: boolean;
    token: string | null;
    username: string | null;
    userId: string | null;
    roles: string[];
    login: (options?: any) => void;
    logout: () => void;
    register: (options?: any) => void;
    setTokens: (tokens: { access_token: string; refresh_token: string }) => void;
}

const KeycloakContext = createContext<KeycloakContextType | null>(null);

export const KeycloakProvider = ({ children }: { children: React.ReactNode }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [roles, setRoles] = useState<string[]>([]);

    useEffect(() => {
        if (keycloak) {
            keycloak
                .init({
                    onLoad: 'check-sso',
                    checkLoginIframe: false,
                    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                    pkceMethod: 'S256',
                })
                .then((auth) => {
                    setAuthenticated(auth);
                    if (auth && keycloak) {
                        setToken(keycloak.token || null);
                        setUsername(keycloak.tokenParsed?.preferred_username || null);
                        setUserId(keycloak.subject || null);
                        setRoles(keycloak.realmAccess?.roles || []);
                    }
                })
                .catch((err) => {
                    console.error('Keycloak init failed', err);
                });
        }
    }, []);

    const login = (options?: any) => keycloak?.login(options);
    const logout = () => keycloak?.logout();
    const register = (options?: any) => keycloak?.register(options);

    const setTokens = (tokens: { access_token: string; refresh_token: string }) => {
        if (keycloak) {
            try {
                // Decode token manually to update state immediately
                const payload = JSON.parse(atob(tokens.access_token.split('.')[1]));
                setToken(tokens.access_token);
                setAuthenticated(true);
                setUserId(payload.sub);
                setUsername(payload.preferred_username || payload.email);
                setRoles(payload.realm_access?.roles || []);

                // Store for persistence
                localStorage.setItem('kc_token', tokens.access_token);
                localStorage.setItem('kc_refreshToken', tokens.refresh_token);

                // Role-based redirection logic
                const roles = payload.realm_access?.roles || [];
                if (roles.includes('ADMIN')) {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            } catch (err) {
                console.error('Failed to parse injected tokens', err);
                // Fallback redirect
                window.location.href = '/dashboard';
            }
        }
    };

    return (
        <KeycloakContext.Provider value={{ authenticated, token, username, userId, roles, login, logout, register, setTokens }}>
            {children}
        </KeycloakContext.Provider>
    );
};

export const useKeycloak = () => {
    const context = useContext(KeycloakContext);
    if (!context) {
        throw new Error('useKeycloak must be used within a KeycloakProvider');
    }
    return context;
};
