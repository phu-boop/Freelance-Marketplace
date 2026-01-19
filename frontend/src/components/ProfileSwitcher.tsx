import React from 'react';
import { User, Briefcase, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpecializedProfile {
    id: string;
    headline: string;
    isDefault: boolean;
}

interface ProfileSwitcherProps {
    profiles: SpecializedProfile[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ profiles, selectedId, onSelect }) => {
    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={() => onSelect(null)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedId === null
                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-bold">General Profile</span>
                </div>
                {selectedId === null && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
            </button>

            {profiles.map((profile) => (
                <button
                    key={profile.id}
                    onClick={() => onSelect(profile.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedId === profile.id
                            ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm font-medium truncate max-w-[150px]">{profile.headline}</span>
                    </div>
                    {selectedId === profile.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>
            ))}

            <button
                onClick={() => window.location.href = '/profile/edit'}
                className="flex items-center gap-2 p-3 text-xs font-bold text-slate-500 hover:text-blue-400 transition-colors"
            >
                Manage Specialized Profiles <ChevronRight className="w-3 h-3" />
            </button>
        </div>
    );
};
