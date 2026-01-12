'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '@/lib/keycloak';
import api from '@/lib/api';

interface KeycloakContextType {
    authenticated: boolean;
    token: string | null;
    username: string | null;
    userId: string | null;
    roles: string[];
    initialized: boolean;
    login: (options?: any) => void;
    logout: () => void;
    register: (options?: any) => void;
    setTokens: (tokens: { access_token: string; refresh_token: string }) => void;
    updateToken: (minValidity?: number) => Promise<boolean>;
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
                .then(async (auth) => {
                    setAuthenticated(auth);
                    if (auth && keycloak) {
                        setToken(keycloak.token || null);
                        setUsername(keycloak.tokenParsed?.preferred_username || null);
                        setUserId(keycloak.subject || null);
                        setRoles(keycloak.realmAccess?.roles || []);

                        // Persist tokens for session recovery on refresh
                        if (keycloak.token) localStorage.setItem('kc_token', keycloak.token);
                        if (keycloak.refreshToken) localStorage.setItem('kc_refreshToken', keycloak.refreshToken);

                        // 🚀 Sync user with backend immediately after authentication
                        const pendingRole = localStorage.getItem('pending_role') || undefined;
                        try {
                            const response = await api.post('/auth/sync', { role: pendingRole });
                            const user = response.data;

                            if (pendingRole) localStorage.removeItem('pending_role');

                            // Update roles in local state if they changed from sync
                            if (user.roles && user.roles.length > 0) {
                                setRoles(user.roles);
                                // Refresh token to get new roles in JWT from Keycloak
                                try {
                                    // Force refresh by using a negative number or 99999
                                    await keycloak.updateToken(-1);
                                    if (keycloak.token) {
                                        setToken(keycloak.token);
                                        localStorage.setItem('kc_token', keycloak.token);
                                    }
                                } catch (e) {
                                    console.warn('Failed to refresh token after sync:', e);
                                }
                            }

                            // Global check for onboarding requirement
                            if (user.requiresOnboarding && window.location.pathname !== '/onboarding') {
                                window.location.href = '/onboarding';
                                return;
                            }

                            // If we are ON onboarding but don't require it, redirect to dashboard
                            if (!user.requiresOnboarding && window.location.pathname === '/onboarding') {
                                window.location.href = '/dashboard';
                                return;
                            }

                            // Redirect if on login or register page
                            if (window.location.pathname === '/login' || window.location.pathname === '/register') {
                                const latestRole = user.roles?.[0] || 'FREELANCER';
                                if (latestRole === 'ADMIN' || user.roles?.includes('ADMIN')) {
                                    window.location.href = '/admin';
                                } else if (latestRole === 'CLIENT' || user.roles?.includes('CLIENT')) {
                                    window.location.href = '/client/dashboard';
                                } else {
                                    window.location.href = '/dashboard';
                                }
                            }
                        } catch (error) {
                            console.error('Backend sync failed:', error);
                            // Fallback to basic redirect if sync fails
                            if (window.location.pathname === '/login' || window.location.pathname === '/register') {
                                window.location.href = '/dashboard';
                            }
                        }
                    }
                    setInitialized(true);
                })
                .catch((err) => {
                    console.error('Keycloak init failed', err);
                    setInitialized(true);
                });
        }
    }, []);

    const login = (options?: any) => keycloak?.login(options);
    const logout = () => keycloak?.logout();
    const register = (options?: any) => keycloak?.register(options);

    const setTokens = async (tokens: { access_token: string; refresh_token: string }) => {
        setInitialized(false);
        if (keycloak) {
            try {
                // Store tokens
                localStorage.setItem('kc_token', tokens.access_token);
                localStorage.setItem('kc_refreshToken', tokens.refresh_token);

                // Update state
                const payload = JSON.parse(atob(tokens.access_token.split('.')[1]));
                setToken(tokens.access_token);
                setAuthenticated(true);
                setUserId(payload.sub);
                setUsername(payload.preferred_username || payload.email);

                // 🚀 Sync with backend
                const pendingRole = localStorage.getItem('pending_role') || undefined;
                try {
                    const response = await api.post('/auth/sync', { role: pendingRole });
                    const user = response.data;
                    if (pendingRole) localStorage.removeItem('pending_role');

                    const roles = user.roles || [];
                    setRoles(roles);

                    // Final state update
                    setInitialized(true);

                    if (user.requiresOnboarding) {
                        window.location.href = '/onboarding';
                    } else if (roles.includes('ADMIN')) {
                        window.location.href = '/admin';
                    } else if (roles.includes('CLIENT')) {
                        window.location.href = '/client/dashboard';
                    } else {
                        window.location.href = '/dashboard';
                    }
                } catch (e) {
                    console.error('Sync after injected tokens failed', e);
                    setInitialized(true);
                    window.location.href = '/dashboard';
                }
            } catch (err) {
                console.error('Failed to parse injected tokens', err);
                window.location.href = '/dashboard';
            }
        }
    };

    const updateToken = (minValidity: number = 30) => {
        if (keycloak) {
            return keycloak.updateToken(minValidity).then((refreshed) => {
                if (refreshed && keycloak.token) {
                    setToken(keycloak.token);
                    localStorage.setItem('kc_token', keycloak.token);
                }
                return refreshed;
            });
        }
        return Promise.resolve(false);
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
        <KeycloakContext.Provider value={{ authenticated, token, username, userId, roles, initialized, login, logout, register, setTokens, updateToken }}>
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
