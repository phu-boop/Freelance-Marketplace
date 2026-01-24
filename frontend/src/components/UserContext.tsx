'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useKeycloak } from './KeycloakProvider';
import api from '@/lib/api';

interface UserContextType {
    user: any | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { userId, authenticated } = useKeycloak();
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        if (!userId || !authenticated) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await api.get(`/users/${userId}`);
            setUser(res.data);
        } catch (error) {
            console.error('[USER_CONTEXT] Failed to fetch user profile', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [userId, authenticated]);

    const value = useMemo(() => ({
        user,
        loading,
        refreshUser: fetchUser
    }), [user, loading]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
