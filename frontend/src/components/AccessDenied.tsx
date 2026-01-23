'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';
import { useKeycloak } from './KeycloakProvider';
import Link from 'next/link';

interface AccessDeniedProps {
    requiredRole?: string;
}

export const AccessDenied = ({ requiredRole }: AccessDeniedProps) => {
    const { logout, roles } = useKeycloak();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/10">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>

                    <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Access Restricted</h1>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        It looks like you don't have the necessary permissions to access this area.
                        {requiredRole && (
                            <span className="block mt-2 font-bold text-red-400/80 text-sm uppercase tracking-widest">
                                Required Role: {requiredRole}
                            </span>
                        )}
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-lg"
                        >
                            <Home className="w-4 h-4" />
                            Return Home
                        </Link>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => window.history.back()}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all border border-slate-700"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Go Back
                            </button>
                            <button
                                onClick={logout}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-2xl font-bold hover:bg-red-500/20 transition-all border border-red-500/20"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-800/50">
                        <p className="text-xs text-slate-500 font-medium">
                            If you believe this is an error, please contact your workspace administrator.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
