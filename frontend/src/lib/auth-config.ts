/**
 * Centralized authentication and authorization configuration.
 */

export const SHARED_PATHS = [
    '/messages',
    '/notifications',
    '/profile',
    '/settings',
    '/wallet',
    '/payments',
    '/account',
    '/categories',
    '/pricing',
    '/help',
    '/support'
];

export const CLIENT_PATHS = [
    '/client/dashboard',
    '/client/jobs',
    '/client/proposals',
    '/client/contracts',
    '/marketplace/create'
];

export const FREELANCER_PATHS = [
    '/dashboard',
    '/jobs',
    '/my-jobs',
    '/proposals',
    '/contracts',
    '/earnings'
];

export const ADMIN_PATHS = [
    '/admin'
];

export type Role = 'FREELANCER' | 'CLIENT' | 'ADMIN';

export const isSharedPath = (pathname: string) => {
    return SHARED_PATHS.some(path => pathname.startsWith(path));
};
