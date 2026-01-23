'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useKeycloak } from '@/components/KeycloakProvider';
import { FreelancerSidebar } from './FreelancerSidebar';
import { ClientSidebar } from './ClientSidebar';
import { AdminSidebar } from './AdminSidebar';
import { AgencySidebar } from './AgencySidebar';

export function Sidebar() {
    const pathname = usePathname();
    const { roles, authenticated } = useKeycloak();

    // Sticky mode logic using sessionStorage
    const [activeMode, setActiveMode] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedMode = sessionStorage.getItem('dashboard_mode');

        // Update mode based on explicit route markers
        if (pathname.startsWith('/admin')) {
            sessionStorage.setItem('dashboard_mode', 'admin');
            setActiveMode('admin');
        } else if (pathname.startsWith('/client')) {
            sessionStorage.setItem('dashboard_mode', 'client');
            setActiveMode('client');
        } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/proposals') || pathname.startsWith('/contracts') || pathname.startsWith('/marketplace')) {
            // Note: /marketplace browse is freelancer-only in current design
            sessionStorage.setItem('dashboard_mode', 'freelancer');
            setActiveMode('freelancer');
        } else if (savedMode) {
            setActiveMode(savedMode);
        } else {
            // Default based on roles if no saved mode
            const defaultMode = roles.includes('CLIENT') ? 'client' : 'freelancer';
            setActiveMode(defaultMode);
        }
    }, [pathname, roles]);

    if (!authenticated) return null;

    // 1. Admin Mode
    if (activeMode === 'admin' && (roles.includes('ADMIN') || roles.includes('realm:ADMIN'))) {
        return <AdminSidebar />;
    }

    // 2. Agency Context (Special Case)
    if (pathname.startsWith('/agency/') && pathname.split('/').length > 2) {
        return <AgencySidebar />;
    }

    // 3. Client Mode
    if (activeMode === 'client') {
        return <ClientSidebar />;
    }

    // 4. Default / Freelancer Mode
    return <FreelancerSidebar />;
}

