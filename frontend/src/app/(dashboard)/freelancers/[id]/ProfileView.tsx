
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { getPublicUrl } from '@/lib/utils';
import { useKeycloak } from '@/components/KeycloakProvider';
import Proposals from './Proposals';
import {
    User as UserIcon,
    Mail,
    Globe,
    Github,
    Twitter,
    Linkedin,
    MapPin,
    Calendar,
    ExternalLink,
    Star,
    Award,
    MessageSquare,
    Building2,
    Briefcase,
    Heart
} from 'lucide-react';
import { BadgeList } from '@/components/BadgeList';
import { HireModal } from '@/components/HireModal';

interface ProfileViewProps {
    user: any;
    reviews: any[];
}

export default function ProfileView({ user, reviews }: ProfileViewProps) {
    const { userId, roles } = useKeycloak();
    const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'portfolio' | 'proposals'>('about');
    const [isSaved, setIsSaved] = useState(false);
    const [isLoadingSave, setIsLoadingSave] = useState(false);

    useEffect(() => {
        const checkSavedStatus = async () => {
            try {
                // Optimistic check or fetch logic. 
                // Since this is public view, we need to know if current user saved THIS user.
                // Assuming we have an endpoint for this or we fetch all saved.
                const res = await api.get('/users/saved-freelancers');
                const savedList = res.data;
                const isFound = savedList.some((saved: any) => saved.freelancerId === user.id);
                setIsSaved(isFound);
            } catch (e) {
                // Ignore error (e.g. 401 if not logged in)
            }
        };
        if (user?.id) {
            checkSavedStatus();
        }
    }, [user?.id]);

    const toggleSave = async () => {
        if (isLoadingSave) return;
        setIsLoadingSave(true);
        try {
            if (isSaved) {
                await api.delete(`/users/saved-freelancers/${user.id}`);
                setIsSaved(false);
            } else {
                await api.post('/users/saved-freelancers', { freelancerId: user.id });
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Failed to toggle save', error);
            // Optionally show toast
        } finally {
            setIsLoadingSave(false);
        }
    };

    if (!user) {
        return <div className="text-center text-slate-400">User not found</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="relative">
                <div className="h-48 rounded-3xl bg-slate-800 relative overflow-hidden shadow-xl">
                    {user.coverImageUrl ? (
                        <img src={getPublicUrl(user.coverImageUrl)} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                    )}
                </div>
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div className="w-32 h-32 rounded-3xl bg-slate-900 border-4 border-slate-950 p-1">
                        <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={getPublicUrl(user.avatarUrl)} alt={user.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-16 h-16 text-slate-400" />
                            )}
                        </div>
                    </div>
                    <div className="pb-4 space-y-2">
                        <h1 className="text-3xl font-bold text-white">{user.firstName} {user.lastName}</h1>
                        <div className="flex flex-col gap-2">
                            <p className="text-slate-400 flex items-center gap-2">
                                {user.roles && user.roles.includes('CLIENT') ? (
                                    <span className="flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4" /> {user.companyName || 'Client'}
                                    </span>
                                ) : (
                                    user.title || 'Freelancer'
                                )}
                            </p>
                            <BadgeList userId={user.id} />
                            {user.roles && !user.roles.includes('CLIENT') && user.isAvailable && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border transition-all w-fit bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    Available for Work
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-12 right-8 pb-4 flex gap-2">
                    <button
                        onClick={() => toggleSave()}
                        className={`p-2.5 rounded-xl font-medium transition-all shadow-lg ${isSaved ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/20' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                        title={isSaved ? "Unsave Freelancer" : "Save Freelancer"}
                    >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                    <HireModal freelancerId={user.id} freelancerName={user.firstName} countryCode={user.country} />
                    <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all">
                        Message
                    </button>
                </div>
            </div>

            <div className="pt-12 flex gap-8 border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('about')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'about' ? 'text-blue-500' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    About
                    {activeTab === 'about' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'reviews' ? 'text-blue-500' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Reviews ({user.reviewCount})
                    {activeTab === 'reviews' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'portfolio' ? 'text-blue-500' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Portfolio ({user.portfolio?.length || 0})
                    {activeTab === 'portfolio' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                </button>
                {(userId === user.id || roles.includes('realm:CLIENT') || roles.includes('CLIENT')) && (
                    <button
                        onClick={() => setActiveTab('proposals')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'proposals' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
                    >
                        Proposals
                        {activeTab === 'proposals' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {activeTab === 'about' ? (
                    <>
                        {/* Left Column: Info & Socials */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                <h3 className="font-semibold text-white">About</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {user.overview || 'No overview provided.'}
                                </p>
                                <div className="space-y-3 pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <MapPin className="w-4 h-4" /> {[user.address, user.country].filter(Boolean).join(', ') || 'Remote'}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <Calendar className="w-4 h-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                <h3 className="font-semibold text-white">Languages</h3>
                                <div className="space-y-3">
                                    {user.languages && user.languages.length > 0 ? (
                                        user.languages.map((lang: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <span className="text-white font-medium">{lang.language}</span>
                                                <span className="text-slate-500">{lang.proficiency}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No languages listed.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                <h3 className="font-semibold text-white">Social Profiles</h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: Github, label: 'GitHub', username: user.githubUsername, url: `https://github.com/${user.githubUsername}`, color: 'hover:text-white' },
                                        { icon: Linkedin, label: 'LinkedIn', username: user.linkedinUsername, url: `https://linkedin.com/in/${user.linkedinUsername}`, color: 'hover:text-blue-400' },
                                        { icon: Twitter, label: 'Twitter', username: user.twitterUsername, url: `https://twitter.com/${user.twitterUsername}`, color: 'hover:text-sky-400' },
                                        { icon: Globe, label: 'Website', username: user.website, url: user.website, color: 'hover:text-emerald-400' },
                                        { icon: Award, label: 'Behance', username: user.behanceUsername, url: `https://behance.net/${user.behanceUsername}`, color: 'hover:text-blue-400' },
                                        { icon: Award, label: 'Dribbble', username: user.dribbbleUsername, url: `https://dribbble.com/${user.dribbbleUsername}`, color: 'hover:text-pink-400' },
                                    ].filter(s => s.username).map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={"flex items-center justify-between group p-2 rounded-lg hover:bg-slate-800 transition-all " + social.color}
                                        >
                                            <div className="flex items-center gap-3">
                                                <social.icon className="w-4 h-4 text-slate-500 group-hover:text-inherit transition-colors" />
                                                <span className="text-sm text-slate-400 group-hover:text-inherit transition-colors">{social.label}</span>
                                            </div>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                                        </a>
                                    ))}
                                    {![user.githubUsername, user.linkedinUsername, user.twitterUsername, user.website, user.behanceUsername, user.dribbbleUsername].some(Boolean) && (
                                        <p className="text-sm text-slate-500 italic">No social profiles viewable.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Skills & Experience */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-white">Skills & Expertise</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills?.length > 0 ? user.skills.map((skill: string) => (
                                        <span
                                            key={skill}
                                            className="px-4 py-1.5 rounded-xl bg-slate-800 text-sm text-slate-300 border border-slate-700 cursor-default"
                                        >
                                            {skill}
                                        </span>
                                    )) : (
                                        <p className="text-sm text-slate-500">No skills added.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-white">Experience</h3>
                                </div>
                                <div className="space-y-8">
                                    {user.experience?.length > 0 ? user.experience.map((exp: any, idx: number) => (
                                        <div key={exp.id} className="relative pl-8 group before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-blue-500 before:rounded-full after:absolute after:left-[3px] after:top-6 after:bottom-[-32px] after:w-[2px] after:bg-slate-800 last:after:hidden">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-sm font-bold text-white">{exp.role || exp.title}</div>
                                                    <div className="text-xs text-blue-400 font-medium mt-0.5">
                                                        {exp.company} • {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : new Date(exp.endDate).getFullYear()}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{exp.description}</p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-500">No experience listed.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-white">Certifications</h3>
                                </div>
                                <div className="space-y-4">
                                    {user.certifications?.length > 0 ? user.certifications.map((cert: any) => (
                                        <div key={cert.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                                            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                                                <Award className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">{cert.title}</h4>
                                                        <p className="text-xs text-slate-400 mt-0.5">{cert.issuer}</p>
                                                    </div>
                                                </div>
                                                {cert.verificationUrl && (
                                                    <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center gap-1">
                                                        Verify Credential <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cert.status === 'VERIFIED'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                        }`}>
                                                        {cert.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-500">No certifications listed.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-white">Education</h3>
                                </div>
                                <div className="space-y-8">
                                    {user.education?.length > 0 ? user.education.map((edu: any, idx: number) => (
                                        <div key={edu.id} className="relative pl-8 group before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-500 before:rounded-full after:absolute after:left-[3px] after:top-6 after:bottom-[-32px] after:w-[2px] after:bg-slate-800 last:after:hidden">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-sm font-bold text-white">{edu.degree} in {edu.fieldOfStudy}</div>
                                                    <div className="text-xs text-indigo-400 font-medium mt-0.5">
                                                        {edu.institution} • {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{edu.description}</p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-500">No education listed.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'reviews' ? (
                    <div className="lg:col-span-3 space-y-6">
                        {reviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-700'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-sm italic">
                                            "{review.comment || 'No comment provided.'}"
                                        </p>

                                        {/* Reply View for Public */}
                                        {review.reply && (
                                            <div className="mt-4 ml-6 p-4 rounded-xl bg-slate-800/50 border-l-2 border-blue-500/50 space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <span>Freelancer Response</span>
                                                    <span>{new Date(review.repliedAt!).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-300 italic">
                                                    "{review.reply}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                                <MessageSquare className="w-12 h-12 text-slate-700 mx-auto" />
                                <div className="space-y-1">
                                    <p className="text-white font-bold">No reviews yet</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'portfolio' ? (
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Portfolio Projects</h3>
                        </div>
                        {user.portfolio?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {user.portfolio.map((item: any) => (
                                    <div key={item.id} className="group relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all">
                                        <div className="aspect-video relative overflow-hidden">
                                            <img src={getPublicUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                                <Building2 className="w-12 h-12 text-slate-700 mx-auto" />
                                <div className="space-y-1">
                                    <p className="text-white font-bold">No projects visible</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'proposals' ? (
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Active Proposals</h3>
                        </div>
                        <Proposals freelancerId={user.id} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
