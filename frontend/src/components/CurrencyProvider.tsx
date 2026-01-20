'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useKeycloak } from './KeycloakProvider';
import api from '@/lib/api';

interface CurrencyContextType {
    currency: string;
    rates: Record<string, number>;
    setCurrency: (currency: string) => void;
    formatAmount: (amount: number, from?: string) => string;
    convertAmount: (amount: number, from?: string) => number;
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const { authenticated, token, initialized, roles } = useKeycloak();
    const [currency, setCurrencyState] = useState('USD');
    const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRates();
        // Only fetch wallet if initialized, authenticated, and has a valid role
        // This avoids 403 errors for users who are new (no roles yet)
        const hasRole = roles.includes('FREELANCER') || roles.includes('CLIENT');
        if (initialized && authenticated && token && hasRole) {
            fetchUserPreference();
        }
    }, [initialized, authenticated, token, roles]);

    const fetchRates = async () => {
        try {
            // Using a mock fallback if API fails or for dev
            const mockRates = {
                USD: 1,
                EUR: 0.92,
                GBP: 0.79,
                VND: 24500,
                JPY: 148,
                CAD: 1.35,
                AUD: 1.52
            };

            try {
                const res = await api.get('/payments/exchange-rates');
                if (res.data) {
                    setRates({ ...mockRates, ...res.data });
                    return;
                }
            } catch (ignore) {
                // API might fail in dev, that's fine
            }
            setRates(mockRates);
        } catch (err) {
            console.error('Failed to set exchange rates', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPreference = async () => {
        try {
            const res = await api.get('/payments/wallet');
            if (res.data?.preferredCurrency) {
                setCurrencyState(res.data.preferredCurrency);
            }
        } catch (err: any) {
            if (err.response?.status !== 403) {
                console.error('Failed to fetch user currency preference', err);
            }
        }
    };

    const setCurrency = async (newCurrency: string) => {
        setCurrencyState(newCurrency);
        if (authenticated && token) {
            try {
                await api.patch('/payments/wallet/currency', { currency: newCurrency });
            } catch (err) {
                console.error('Failed to save currency preference', err);
            }
        }
    };

    const convertAmount = (amount: number, from: string = 'USD'): number => {
        if (from === currency) return amount;
        const fromRate = rates[from] || 1;
        const toRate = rates[currency] || 1;
        return (amount / fromRate) * toRate;
    };

    const formatAmount = (amount: number, from: string = 'USD'): string => {
        const converted = convertAmount(amount, from);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, rates, setCurrency, formatAmount, convertAmount, loading }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
