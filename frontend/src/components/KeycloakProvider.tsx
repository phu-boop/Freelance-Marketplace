'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
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
    const initRef = useRef(false);
    const syncInProgress = useRef(false);

    const performSync = async (pendingRole?: string) => {
        if (syncInProgress.current) return;
        syncInProgress.current = true;

        try {
            console.log('[AUTH] Starting sync...');
            const response = await api.post('/auth/sync', { role: pendingRole });
            const user = response.data;

            if (pendingRole) localStorage.removeItem('pending_role');

            // Only update roles if they actually changed to prevent re-renders
            const newRoles = user.roles || [];
            if (JSON.stringify(newRoles) !== JSON.stringify(roles)) {
                setRoles(newRoles);
                // Only force-refresh if roles changed
                try {
                    await keycloak?.updateToken(-1);
                    if (keycloak?.token) {
                        setToken(keycloak.token);
                        localStorage.setItem('kc_token', keycloak.token);
                    }
                } catch (e) {
                    console.warn('Failed to refresh token after sync:', e);
                }
            }

            // Set initialized before redirecting to avoid flickering or loops
            setInitialized(true);

            const currentPath = window.location.pathname;
            let targetPath: string | null = null;

            if (user.requiresOnboarding && currentPath !== '/onboarding') {
                targetPath = '/onboarding';
            } else if (!user.requiresOnboarding && currentPath === '/onboarding') {
                targetPath = '/dashboard';
            } else if (currentPath === '/login' || currentPath === '/register') {
                const latestRole = user.roles?.[0] || 'FREELANCER';
                if (latestRole === 'ADMIN' || user.roles?.includes('ADMIN')) {
                    targetPath = '/admin';
                } else if (latestRole === 'CLIENT' || user.roles?.includes('CLIENT')) {
                    targetPath = '/client/dashboard';
                } else {
                    targetPath = '/dashboard';
                }
            }

            // Only redirect if necessary and target is different from current
            if (targetPath && targetPath !== currentPath) {
                console.log(`[AUTH] Redirecting to ${targetPath}`);
                window.location.href = targetPath;
            }
        } catch (error) {
            console.error('Backend sync failed:', error);
            setInitialized(true);
            if (window.location.pathname === '/login' || window.location.pathname === '/register') {
                window.location.href = '/dashboard';
            }
        } finally {
            syncInProgress.current = false;
        }
    };

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        if (typeof window !== 'undefined' && keycloak) {
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
                        if (keycloak.realmAccess?.roles) {
                            setRoles(keycloak.realmAccess.roles);
                        }

                        if (keycloak.token) localStorage.setItem('kc_token', keycloak.token);
                        if (keycloak.refreshToken) localStorage.setItem('kc_refreshToken', keycloak.refreshToken);

                        const pendingRole = localStorage.getItem('pending_role') || undefined;
                        await performSync(pendingRole);
                    } else {
                        setInitialized(true);
                    }
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
        if (keycloak) {
            try {
                localStorage.setItem('kc_token', tokens.access_token);
                localStorage.setItem('kc_refreshToken', tokens.refresh_token);

                keycloak.token = tokens.access_token;
                keycloak.refreshToken = tokens.refresh_token;

                const payload = JSON.parse(atob(tokens.access_token.split('.')[1]));
                setToken(tokens.access_token);
                setAuthenticated(true);
                setUserId(payload.sub);
                setUsername(payload.preferred_username || payload.email);

                const pendingRole = localStorage.getItem('pending_role') || undefined;
                await performSync(pendingRole);
            } catch (err) {
                console.error('Failed to parse injected tokens', err);
                setInitialized(true);
                window.location.href = '/dashboard';
            }
        }
    };

    const updateToken = (minValidity: number = 30) => {
        const kc = keycloak;
        if (kc) {
            return kc.updateToken(minValidity).then((refreshed) => {
                if (refreshed && kc.token) {
                    setToken(kc.token);
                    localStorage.setItem('kc_token', kc.token);
                }
                return refreshed;
            });
        }
        return Promise.resolve(false);
    };

    const value = useMemo(() => ({
        authenticated,
        token,
        username,
        userId,
        roles,
        initialized,
        login,
        logout,
        register,
        setTokens,
        updateToken
    }), [authenticated, token, username, userId, roles, initialized]);

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
        <KeycloakContext.Provider value={value}>
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
