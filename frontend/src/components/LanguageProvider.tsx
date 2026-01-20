'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi' | 'de' | 'es' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    dir: 'ltr' | 'rtl';
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        'nav.dashboard': 'Dashboard',
        'nav.jobs': 'Jobs',
        'nav.my_jobs': 'My Jobs',
        'nav.messages': 'Messages',
        'nav.reports': 'Reports',
        'role.freelancer': 'Freelancer',
        'role.client': 'Client',
        'action.post_job': 'Post a Job',
        'action.find_work': 'Find Work',
    },
    vi: {
        'nav.dashboard': 'Tổng quan',
        'nav.jobs': 'Việc làm',
        'nav.my_jobs': 'Việc của tôi',
        'nav.messages': 'Tin nhắn',
        'nav.reports': 'Báo cáo',
        'role.freelancer': 'Freelancer',
        'role.client': 'Khách hàng',
        'action.post_job': 'Đăng việc',
        'action.find_work': 'Tìm việc',
    },
    de: {
        'nav.dashboard': 'Übersicht',
        'nav.jobs': 'Stellen',
        'nav.my_jobs': 'Meine Jobs',
        'nav.messages': 'Nachrichten',
        'nav.reports': 'Berichte',
        'role.freelancer': 'Freiberufler',
        'role.client': 'Kunde',
        'action.post_job': 'Job posten',
        'action.find_work': 'Arbeit finden',
    },
    es: {
        'nav.dashboard': 'Panel',
        'nav.jobs': 'Trabajos',
        'nav.my_jobs': 'Mis Trabajos',
        'nav.messages': 'Mensajes',
        'nav.reports': 'Reportes',
        'role.freelancer': 'Freelancer',
        'role.client': 'Cliente',
        'action.post_job': 'Publicar trabajo',
        'action.find_work': 'Buscar trabajo',
    },
    fr: {
        'nav.dashboard': 'Tableau de bord',
        'nav.jobs': 'Emplois',
        'nav.my_jobs': 'Mes emplois',
        'nav.messages': 'Messages',
        'nav.reports': 'Rapports',
        'role.freelancer': 'Indépendant',
        'role.client': 'Client',
        'action.post_job': 'Publier une offre',
        'action.find_work': 'Trouver du travail',
    }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const stored = localStorage.getItem('app_language') as Language;
        if (stored && translations[stored]) {
            setLanguageState(stored);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_language', lang);
        document.documentElement.lang = lang;
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir: 'ltr' }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
