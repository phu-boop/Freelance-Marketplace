'use client';

import React, { useEffect } from 'react';
import { useKeycloak } from './KeycloakProvider';
import { usePathname, useRouter } from 'next/navigation';
import { AccessDenied } from './AccessDenied';
import { isSharedPath, Role } from '@/lib/auth-config';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: Role[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { authenticated, roles, initialized } = useKeycloak();
    const pathname = usePathname();
    const router = useRouter();

    const hasRequiredRole = roles.some(role => allowedRoles.includes(role as Role));
    const isAdmin = roles.includes('ADMIN');

    if (!initialized) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    // Admins bypass all role checks
    if (authenticated && (hasRequiredRole || isAdmin)) {
        return <>{children}</>;
    }

    // Shared paths are accessible to any authenticated user
    if (authenticated && isSharedPath(pathname)) {
        return <>{children}</>;
    }

    // If authenticated but no role match, show Access Denied
    if (authenticated && !hasRequiredRole) {
        return <AccessDenied requiredRole={allowedRoles.join(' or ')} />;
    }

    // Fallback or unauthenticated state (handled by Keycloak login redirection usually, 
    // but here we just return null or children if path is public)
    return <>{children}</>;
};
