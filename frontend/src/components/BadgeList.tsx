
import React from 'react';
import { ShieldCheck, Star, Zap, Award } from 'lucide-react';

interface BadgeListProps {
    user: any;
}

export const BadgeList: React.FC<BadgeListProps> = ({ user }) => {
    const badges = [
        {
            id: 'identity_verified',
            label: 'Identity Verified',
            icon: ShieldCheck,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            condition: user.isIdentityVerified || user.kycStatus === 'VERIFIED'
        },
        {
            id: 'payment_verified',
            label: 'Payment Verified',
            icon: Zap,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            condition: user.isPaymentVerified
        },
        {
            id: 'top_rated',
            label: 'Top Rated',
            icon: Star,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
            condition: user.jobSuccessScore >= 90 && user.reviewCount > 5
        },
        {
            id: 'rising_talent',
            label: 'Rising Talent',
            icon: Award,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            condition: user.jobSuccessScore > 80 && user.reviewCount <= 5 && user.reviewCount > 0
        }
    ].filter(badge => badge.condition);

    if (badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-4">
            {badges.map((badge) => (
                <div
                    key={badge.id}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-default group relative ${badge.bg} ${badge.color} ${badge.border}`}
                >
                    <badge.icon className="w-3.5 h-3.5" />
                    {badge.label}

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
                        {badge.label}
                    </div>
                </div>
            ))}
        </div>
    );
};
