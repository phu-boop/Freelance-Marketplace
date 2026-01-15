
import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileCompletenessProps {
    user: any;
}

export const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({ user }) => {
    const calculateCompleteness = () => {
        const criteria = [
            { id: 'avatar', label: 'Profile Photo', weight: 10, completed: !!user.avatarUrl && user.avatarUrl !== 'default-avatar.png' },
            { id: 'title', label: 'Professional Title', weight: 10, completed: !!user.title },
            { id: 'overview', label: 'Overview', weight: 15, completed: !!user.overview && user.overview.length > 50 },
            { id: 'skills', label: 'Skills', weight: 10, completed: user.skills && user.skills.length > 0 },
            { id: 'languages', label: 'Languages', weight: 5, completed: user.languages && user.languages.length > 0 },
            { id: 'portfolio', label: 'Portfolio Items', weight: 15, completed: user.portfolio && user.portfolio.length > 0 },
            { id: 'education', label: 'Education', weight: 10, completed: user.education && user.education.length > 0 },
            { id: 'experience', label: 'Experience', weight: 10, completed: user.experience && user.experience.length > 0 },
            { id: 'certifications', label: 'Certifications', weight: 5, completed: user.certifications && user.certifications.length > 0 },
            { id: 'social', label: 'Social Links', weight: 5, completed: !!(user.githubUsername || user.linkedinUsername || user.website || user.twitterUsername) },
            { id: 'location', label: 'Location Info', weight: 5, completed: !!(user.country || user.address) },
            { id: 'category', label: 'Primary Category', weight: 5, completed: !!user.primaryCategoryId },
            { id: 'verified', label: 'Identity Verified', weight: 5, completed: user.kycStatus === 'VERIFIED' },
        ];

        const totalWeight = criteria.reduce((acc, item) => acc + item.weight, 0);
        const currentScore = criteria.reduce((acc, item) => item.completed ? acc + item.weight : acc, 0);
        const percentage = Math.round((currentScore / totalWeight) * 100);

        const nextSteps = criteria.filter(c => !c.completed).sort((a, b) => b.weight - a.weight).slice(0, 3);

        return { percentage, nextSteps };
    };

    const { percentage, nextSteps } = calculateCompleteness();

    if (percentage === 100) return null; // Hides when fully complete

    return (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="font-semibold text-white">Profile Strength</h3>
                    <p className="text-sm text-slate-400 mt-1">Complete your profile to attract more clients.</p>
                </div>
                <div className="text-2xl font-bold text-blue-500">{percentage}%</div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                />
            </div>

            {/* Next Steps */}
            <div className="space-y-3 pt-2">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Suggested Actions</p>
                {nextSteps.map((step) => (
                    <div key={step.id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-800/50 p-2 rounded-lg transition-all border border-transparent hover:border-slate-800">
                        <div className="flex items-center gap-3">
                            <Circle className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{step.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-500">+{step.weight}%</span>
                            <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
