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
        if (syncInProgress.current) {
            console.log('[AUTH] Sync already in progress, skipping');
            return;
        }

        // Use a timestamp to prevent syncs from happening too close together (within 2 seconds)
        const lastSync = sessionStorage.getItem('last_auth_sync');
        const now = Date.now();
        if (lastSync && now - parseInt(lastSync) < 2000) {
            console.log('[AUTH] Sync happened too recently, skipping');
            return;
        }

        syncInProgress.current = true;
        sessionStorage.setItem('last_auth_sync', now.toString());

        try {
            console.group('[AUTH] Sync Process');
            console.log('[AUTH] Current User:', { userId, roles });
            console.log('[AUTH] Path:', window.location.pathname);

            const response = await api.post('/auth/sync', { role: pendingRole });
            const user = response.data;
            console.log('[AUTH] Sync response:', user);

            if (pendingRole) localStorage.removeItem('pending_role');

            const newRoles = user.roles || [];
            if (JSON.stringify(newRoles) !== JSON.stringify(roles)) {
                console.log('[AUTH] Roles changed, updating state:', newRoles);
                setRoles(newRoles);
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

            setInitialized(true);

            const currentPath = window.location.pathname;
            let targetPath: string | null = null;

            if (user.requiresOnboarding && currentPath !== '/onboarding') {
                targetPath = '/onboarding';
            } else if (!user.requiresOnboarding && currentPath === '/onboarding') {
                targetPath = '/dashboard';
            } else if (currentPath === '/login' || currentPath === '/register') {
                const latestRole = user.roles?.find((r: string) => r === 'ADMIN' || r === 'CLIENT' || r === 'FREELANCER') || 'FREELANCER';
                if (latestRole === 'ADMIN') {
                    targetPath = '/admin';
                } else if (latestRole === 'CLIENT') {
                    targetPath = '/client/dashboard';
                } else {
                    targetPath = '/dashboard';
                }
            }

            if (targetPath && targetPath !== currentPath) {
                console.log(`[AUTH] Redirecting: ${currentPath} -> ${targetPath}`);
                console.groupEnd();
                window.location.href = targetPath;
            } else {
                console.log('[AUTH] No redirect needed');
                console.groupEnd();
            }
        } catch (error) {
            console.error('[AUTH] Backend sync failed:', error);
            console.groupEnd();
            setInitialized(true);
            if (window.location.pathname === '/login' || window.location.pathname === '/register') {
                window.location.href = '/dashboard';
            }
        } finally {
            syncInProgress.current = false;
        }
    };

    useEffect(() => {
        console.log('[AUTH] KeycloakProvider mounted');
        if (initRef.current) {
            console.log('[AUTH] Already initialized (initRef), skipping');
            return;
        }
        initRef.current = true;

        if (typeof window !== 'undefined' && keycloak) {
            console.log('[AUTH] Keycloak Config from Env:', {
                url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
                realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
                clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
            });
            console.log('[AUTH] Initializing Keycloak instance:', keycloak);
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
                    // Clear stale tokens to prevent persistent errors
                    localStorage.removeItem('kc_token');
                    localStorage.removeItem('kc_refreshToken');
                    setAuthenticated(false);
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
