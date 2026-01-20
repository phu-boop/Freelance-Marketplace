'use client';

import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Plus, ArrowRight, Brain, Globe, ShieldCheck } from 'lucide-react';
import { useKeycloak } from '@/components/KeycloakProvider';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import SettingsTabs from '@/components/settings/SettingsTabs';
import { useRouter } from 'next/navigation';

export default function ExpertiseSettingsPage() {
    const { userId } = useKeycloak();
    const router = useRouter();
    const [assessments, setAssessments] = useState<any[]>([]);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            try {
                const userRes = await api.get(`/users/${userId}`);
                setSkills(userRes.data.skills || []);

                // Fetch assessments (assumed endpoint)
                const assessmentsRes = await api.get(`/users/${userId}/assessments`);
                setAssessments(assessmentsRes.data || []);

                const certsRes = await api.get(`/users/${userId}/certifications`);
                setCertifications(certsRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleStartAssessment = async (skill: string) => {
        try {
            const res = await api.post('/vetting/assessments/start', { skillName: skill });
            router.push(`/assessments/${res.data.id}`);
        } catch (err) {
            console.error('Failed to start assessment', err);
        }
    };

    if (loading) return <div className="h-96 animate-pulse bg-slate-900/50 rounded-xl max-w-4xl mx-auto" />;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Talent Trust & Expertise</h1>
                <p className="text-slate-400">Verify your skills and showcase certifications to stand out to premium clients.</p>
            </div>

            <SettingsTabs />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Skill Assessments */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-400" />
                        Skill Assessments
                    </h2>
                    <div className="space-y-4">
                        {skills.map((skill) => {
                            const assessment = assessments.find(a => a.skillName === skill);
                            const isPassed = assessment?.status === 'COMPLETED';

                            return (
                                <Card key={skill} className="p-4 bg-slate-900/50 border-slate-800/50 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isPassed ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                                            {isPassed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Award className="w-5 h-5 text-slate-500" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white uppercase tracking-tight">{skill}</div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase">
                                                {isPassed ? `Score: ${assessment.score}%` : 'Not Verified'}
                                            </div>
                                        </div>
                                    </div>
                                    {!isPassed && (
                                        <button
                                            onClick={() => handleStartAssessment(skill)}
                                            className="p-2 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-lg transition-all"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Certifications */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-400" />
                        Certifications
                    </h2>
                    <div className="space-y-4">
                        {certifications.map((cert) => (
                            <Card key={cert.id} className="p-4 bg-slate-900/50 border-slate-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Award className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white uppercase tracking-tight">{cert.title}</div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase">{cert.issuer}</div>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border
                                    ${cert.status === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                    {cert.status}
                                </span>
                            </Card>
                        ))}
                        <button className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-white hover:border-slate-700 transition-all font-black text-xs uppercase tracking-widest">
                            <Plus className="w-4 h-4" /> Add Certification
                        </button>
                    </div>
                </div>
            </div>

            {/* Expert Vetted Section */}
            <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-blue-500/20 rounded-[2.5rem] p-10 mt-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="w-48 h-48 -mr-16 -mt-16" />
                </div>
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-500/30">Premium Feature</span>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Become Expert-Vetted®</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed font-medium">
                        The top 1% of talent on our platform is manually vetted via live technical interviews and rigorous soft-skill assessments. Expert-Vetted talent gains access to 5x higher project budgets and elite enterprise clients.
                    </p>
                    <button className="px-8 py-4 bg-white text-slate-950 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-50 transition-all flex items-center gap-3 shadow-2xl shadow-white/5">
                        Apply for Vetting <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
