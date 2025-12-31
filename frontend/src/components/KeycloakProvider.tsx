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
    const [initialized, setInitialized] = useState(false);
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
                    token: localStorage.getItem('kc_token') || undefined,
                    refreshToken: localStorage.getItem('kc_refreshToken') || undefined,
                })
                .then((auth) => {
                    setAuthenticated(auth);
                    if (auth && keycloak) {
                        setToken(keycloak.token || null);
                        setUsername(keycloak.tokenParsed?.preferred_username || null);
                        setUserId(keycloak.subject || null);
                        setRoles(keycloak.realmAccess?.roles || []);

                        // Persist tokens for session recovery on refresh
                        if (keycloak.token) localStorage.setItem('kc_token', keycloak.token);
                        if (keycloak.refreshToken) localStorage.setItem('kc_refreshToken', keycloak.refreshToken);

                        // Redirect if on login page and authenticated
                        if (window.location.pathname === '/login') {
                            const userRoles = keycloak.realmAccess?.roles || [];
                            if (userRoles.includes('ADMIN')) {
                                window.location.href = '/admin';
                            } else if (userRoles.includes('CLIENT')) {
                                window.location.href = '/client/dashboard';
                            } else {
                                window.location.href = '/dashboard';
                            }
                        }
                    }
                    setInitialized(true);
                })
                .catch((err) => {
                    console.error('Keycloak init failed', err);
                    setInitialized(true); // Still set initialized to true so app can recover/show error
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
                console.log('DEBUG: User Roles:', payload.realm_access?.roles);

                // Store for persistence
                localStorage.setItem('kc_token', tokens.access_token);
                localStorage.setItem('kc_refreshToken', tokens.refresh_token);

                // Role-based redirection logic
                const roles = payload.realm_access?.roles || [];
                if (roles.includes('ADMIN')) {
                    window.location.href = '/admin';
                } else if (roles.includes('CLIENT')) {
                    window.location.href = '/client/dashboard';
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

    if (!initialized) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium">Loading session...</p>
                </div>
            </div>
        );
    }

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
