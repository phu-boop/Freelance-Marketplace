import React, { useEffect, useState } from 'react';
import { ShieldCheck, Star, Zap, Award } from 'lucide-react';
import api from '@/lib/api';

interface BackendBadge {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
    metadata?: any;
}

interface BadgeStyle {
    label: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
}

const BADGE_MAP: Record<string, BadgeStyle> = {
    TOP_RATED: {
        label: 'Top Rated',
        icon: Star,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
    },
    RISING_TALENT: {
        label: 'Rising Talent',
        icon: Award,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
    },
    IDENTITY_VERIFIED: {
        label: 'Identity Verified',
        icon: ShieldCheck,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
    },
    PAYMENT_VERIFIED: {
        label: 'Payment Verified',
        icon: Zap,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
    },
    SKILL_VERIFIED: {
        label: 'Skill Verified',
        icon: Award,
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
    },
};

interface BadgeListProps {
    userId: string;
}

export const BadgeList: React.FC<BadgeListProps> = ({ userId }) => {
    const [badges, setBadges] = useState<BackendBadge[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBadges = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/users/${userId}/badges`);
                setBadges(res.data);
            } catch (err) {
                console.error('Failed to fetch badges', err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchBadges();
    }, [userId]);

    if (loading) return null;
    if (badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-4">
            {badges.map((badge) => {
                const style = BADGE_MAP[badge.name];
                if (!style) return null;

                return (
                    <div
                        key={badge.id}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-default group relative ${style.bg} ${style.color} ${style.border}`}
                    >
                        <style.icon className="w-3.5 h-3.5" />
                        {style.label}
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
                            {style.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
