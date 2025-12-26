'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Briefcase,
    Check,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Globe,
    Phone,
    Award,
    Building2,
    BookOpen,
    History,
    FileText,
    Layers
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useKeycloak } from '@/components/KeycloakProvider';
import { useRouter } from 'next/navigation';

import { AvatarUpload } from '@/components/AvatarUpload';

const steps = [
    { title: 'Identity', icon: User },
    { title: 'Professional', icon: Award },
    { title: 'Expertise', icon: Layers },
    { title: 'Rates', icon: Briefcase },
    { title: 'Education', icon: BookOpen },
    { title: 'Experience', icon: History },
    { title: 'Portfolio', icon: FileText }
];

export default function WizardPage() {
    const { userId, authenticated } = useKeycloak();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        country: '',
        headline: '',
        bio: '',
        hourlyRate: '',
        skills: [] as string[],
        primaryCategoryId: '',
        industry: '',
        avatarUrl: '',
        education: [] as any[],
        experience: [] as any[],
        portfolio: [] as any[],
    });

    useEffect(() => {
        if (!authenticated && !initialLoading) {
            router.push('/login');
            return;
        }

        const fetchInitialData = async () => {
            if (authenticated && userId) {
                try {
                    const [userRes, draftRes, categoriesRes] = await Promise.all([
                        api.get(`/users/${userId}`),
                        api.get(`/users/profile/draft/${userId}`).catch(() => ({ data: null })),
                        api.get('/common/categories').catch(() => ({ data: [] }))
                    ]);

                    const user = userRes.data;
                    const draft = draftRes.data;
                    setCategories(categoriesRes.data || []);

                    setFormData(prev => ({
                        ...prev,
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        phone: user.phone || '',
                        country: user.country || '',
                        avatarUrl: user.avatarUrl || '',
                        education: user.education || [],
                        experience: user.experience || [],
                        portfolio: user.portfolio || [],
                        ...(draft && {
                            headline: draft.headline || '',
                            bio: draft.bio || '',
                            hourlyRate: draft.hourlyRate ? draft.hourlyRate.toString() : '',
                            skills: draft.skills || [],
                            primaryCategoryId: draft.primaryCategoryId || '',
                        })
                    }));
                } catch (error) {
                    console.error('Failed to fetch initial data', error);
                } finally {
                    setInitialLoading(false);
                }
            } else if (!authenticated) {
                // If we know for sure we aren't authenticated (after Keycloak init)
                setInitialLoading(false);
            }
        };
        fetchInitialData();
    }, [authenticated, userId, initialLoading, router]);

    const saveDraft = async (data: any) => {
        if (!userId) return;
        try {
            await api.post('/users/profile/draft', data);
        } catch (error) {
            console.error('Failed to save draft', error);
        }
    };

    const handleNext = async () => {
        setLoading(true);
        // Save draft on each step transition
        await saveDraft(formData);
        if (step < steps.length) {
            setStep(s => s + 1);
        } else {
            // Finalize
            try {
                await api.post('/users/profile/complete');
                router.push('/dashboard');
            } catch (error) {
                console.error('Failed to complete profile', error);
            }
        }
        setLoading(false);
    };

    const handleBack = () => {
        if (step > 1) setStep(s => s - 1);
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="text-center space-y-4">
                <h1 className="text-5xl font-bold tracking-tight text-white">
                    Create Your <span className="text-gradient">Professional Profile</span>
                </h1>
                <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
                    Join our elite network of freelancers. Tell us about your journey and showcase your expertise to world-class clients.
                </p>
            </header>

            {/* Stepper */}
            <div className="flex items-center justify-between max-w-3xl mx-auto relative px-4">
                <div className="absolute h-0.5 bg-slate-800 left-0 right-0 top-1/2 -translate-y-1/2 z-0 mx-8" />
                <div
                    className="absolute h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 left-0 top-1/2 -translate-y-1/2 z-0 mx-8 transition-all duration-500"
                    style={{ width: `calc(${((step - 1) / (steps.length - 1)) * 100}% - 4rem)` }}
                />

                {steps.map((s, i) => {
                    const isCompleted = step > i + 1;
                    const isActive = step === i + 1;
                    const Icon = s.icon;

                    return (
                        <div key={s.title} className="relative z-10 flex flex-col items-center gap-3">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300",
                                isCompleted ? "bg-blue-600 border-blue-600 text-white" :
                                    isActive ? "bg-slate-900 border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110" :
                                        "bg-slate-900 border-slate-800 text-slate-500"
                            )}>
                                {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                isActive ? "text-blue-500" : "text-slate-500"
                            )}>
                                {s.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Wizard Content */}
            <div className="max-w-3xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="p-10 space-y-8 glass">
                            {step === 1 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold text-white">Basic Information</h2>
                                        <p className="text-slate-400">Let's start with your identity and location.</p>
                                    </div>

                                    <div className="flex flex-col items-center gap-4 py-4">
                                        <AvatarUpload
                                            currentAvatar={formData.avatarUrl}
                                            onUpload={async (blob) => {
                                                const uploadFormData = new FormData();
                                                uploadFormData.append('file', blob, 'avatar.jpg');
                                                const uploadRes = await api.post('/storage/upload', uploadFormData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                const { fileName } = uploadRes.data;
                                                const urlRes = await api.get(`/storage/url/${fileName}`);
                                                const { url } = urlRes.data;
                                                setFormData({ ...formData, avatarUrl: url });
                                            }}
                                        />
                                        <p className="text-sm text-slate-500">Upload a professional photo</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <Input
                                            label="First Name"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                        <Input
                                            label="Last Name"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                    <Input
                                        label="Phone Number"
                                        placeholder="+1 (555) 000-0000"
                                        leftIcon={<Phone className="w-4 h-4" />}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    <Input
                                        label="Country"
                                        placeholder="United States"
                                        leftIcon={<Globe className="w-4 h-4" />}
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold text-white">Professional Identity</h2>
                                        <p className="text-slate-400">Your headline and bio are the first things clients see.</p>
                                    </div>
                                    <Input
                                        label="Professional Headline"
                                        placeholder="Full Stack Developer Specializing in Cloud Native Apps"
                                        leftIcon={<Award className="w-4 h-4" />}
                                        value={formData.headline}
                                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                    />
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Professional Bio</label>
                                        <textarea
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all min-h-[200px]"
                                            placeholder="Describe your professional background, achievements, and what you can offer to clients..."
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold text-white">Expertise & Skills</h2>
                                        <p className="text-slate-400">Select your primary category and list your top skills.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Primary Category</label>
                                        <select
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            value={formData.primaryCategoryId}
                                            onChange={(e) => setFormData({ ...formData, primaryCategoryId: e.target.value })}
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Skills (Comma separated)</label>
                                        <Input
                                            placeholder="React, Node.js, GraphQL, AWS..."
                                            leftIcon={<Layers className="w-4 h-4" />}
                                            value={formData.skills.join(', ')}
                                            onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold text-white">Rates & Financials</h2>
                                        <p className="text-slate-400">Set your hourly rate. You can always change this later.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex-1">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</div>
                                            <Input
                                                className="pl-8"
                                                label="Hourly Rate"
                                                type="number"
                                                placeholder="50.00"
                                                value={formData.hourlyRate}
                                                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex-1 pt-8">
                                            <p className="text-sm text-slate-500 italic">
                                                * This is the amount clients will see, but it can be negotiated per project.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold text-white">Education</h2>
                                        <p className="text-slate-400">Add your educational background.</p>
                                    </div>
                                    {formData.education.map((edu, idx) => (
                                        <div key={idx} className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800 space-y-4 relative group">
                                            <button
                                                onClick={() => setFormData({ ...formData, education: formData.education.filter((_, i) => i !== idx) })}
                                                className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Check className="w-4 h-4 rotate-45" />
                                            </button>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    label="Institution"
                                                    value={edu.institution}
                                                    onChange={(e) => {
                                                        const newEdu = [...formData.education];
                                                        newEdu[idx].institution = e.target.value;
                                                        setFormData({ ...formData, education: newEdu });
                                                    }}
                                                />
                                                <Input
                                                    label="Degree"
                                                    value={edu.degree}
                                                    onChange={(e) => {
                                                        const newEdu = [...formData.education];
                                                        newEdu[idx].degree = e.target.value;
                                                        setFormData({ ...formData, education: newEdu });
                                                    }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    label="Field of Study"
                                                    value={edu.fieldOfStudy}
                                                    onChange={(e) => {
                                                        const newEdu = [...formData.education];
                                                        newEdu[idx].fieldOfStudy = e.target.value;
                                                        setFormData({ ...formData, education: newEdu });
                                                    }}
                                                />
                                                <Input
                                                    label="Start Date"
                                                    type="date"
                                                    value={edu.startDate?.split('T')[0] || ''}
                                                    onChange={(e) => {
                                                        const newEdu = [...formData.education];
                                                        newEdu[idx].startDate = e.target.value;
                                                        setFormData({ ...formData, education: newEdu });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={() => setFormData({
                                            ...formData,
                                            education: [...formData.education, { institution: '', degree: '', fieldOfStudy: '', startDate: '' }]
                                        })}
                                    >
                                        + Add Education
                                    </Button>
                                </div>
                            )}

                            {step === 6 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold text-white">Work Experience</h2>
                                        <p className="text-slate-400">Tell us about your professional history.</p>
                                    </div>
                                    {formData.experience.map((exp, idx) => (
                                        <div key={idx} className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800 space-y-4 relative group">
                                            <button
                                                onClick={() => setFormData({ ...formData, experience: formData.experience.filter((_, i) => i !== idx) })}
                                                className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Check className="w-4 h-4 rotate-45" />
                                            </button>
                                            <Input
                                                label="Company"
                                                value={exp.company}
                                                onChange={(e) => {
                                                    const newExp = [...formData.experience];
                                                    newExp[idx].company = e.target.value;
                                                    setFormData({ ...formData, experience: newExp });
                                                }}
                                            />
                                            <Input
                                                label="Job Title"
                                                value={exp.title}
                                                onChange={(e) => {
                                                    const newExp = [...formData.experience];
                                                    newExp[idx].title = e.target.value;
                                                    setFormData({ ...formData, experience: newExp });
                                                }}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    label="Start Date"
                                                    type="date"
                                                    value={exp.startDate?.split('T')[0] || ''}
                                                    onChange={(e) => {
                                                        const newExp = [...formData.experience];
                                                        newExp[idx].startDate = e.target.value;
                                                        setFormData({ ...formData, experience: newExp });
                                                    }}
                                                />
                                                <Input
                                                    label="End Date"
                                                    type="date"
                                                    disabled={exp.current}
                                                    value={exp.endDate?.split('T')[0] || ''}
                                                    onChange={(e) => {
                                                        const newExp = [...formData.experience];
                                                        newExp[idx].endDate = e.target.value;
                                                        setFormData({ ...formData, experience: newExp });
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={exp.current}
                                                    onChange={(e) => {
                                                        const newExp = [...formData.experience];
                                                        newExp[idx].current = e.target.checked;
                                                        if (e.target.checked) newExp[idx].endDate = null;
                                                        setFormData({ ...formData, experience: newExp });
                                                    }}
                                                />
                                                <label className="text-sm text-slate-400">Currently work here</label>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={() => setFormData({
                                            ...formData,
                                            experience: [...formData.experience, { company: '', title: '', startDate: '', current: false }]
                                        })}
                                    >
                                        + Add Experience
                                    </Button>
                                </div>
                            )}

                            {step === 7 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold text-white">Portfolio</h2>
                                        <p className="text-slate-400">Showcase your best work samples.</p>
                                    </div>
                                    {formData.portfolio.map((item, idx) => (
                                        <div key={idx} className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800 space-y-4 relative group">
                                            <button
                                                onClick={() => setFormData({ ...formData, portfolio: formData.portfolio.filter((_, i) => i !== idx) })}
                                                className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Check className="w-4 h-4 rotate-45" />
                                            </button>
                                            <Input
                                                label="Project Title"
                                                value={item.title}
                                                onChange={(e) => {
                                                    const newPort = [...formData.portfolio];
                                                    newPort[idx].title = e.target.value;
                                                    setFormData({ ...formData, portfolio: newPort });
                                                }}
                                            />
                                            <Input
                                                label="Project Image URL"
                                                value={item.imageUrl}
                                                onChange={(e) => {
                                                    const newPort = [...formData.portfolio];
                                                    newPort[idx].imageUrl = e.target.value;
                                                    setFormData({ ...formData, portfolio: newPort });
                                                }}
                                            />
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-400 ml-1">Description</label>
                                                <textarea
                                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all min-h-[100px]"
                                                    value={item.description}
                                                    onChange={(e) => {
                                                        const newPort = [...formData.portfolio];
                                                        newPort[idx].description = e.target.value;
                                                        setFormData({ ...formData, portfolio: newPort });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={() => setFormData({
                                            ...formData,
                                            portfolio: [...formData.portfolio, { title: '', imageUrl: '', description: '' }]
                                        })}
                                    >
                                        + Add Portfolio Item
                                    </Button>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex justify-between pt-8 border-t border-slate-800">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={step === 1 || loading}
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    isLoading={loading}
                                    rightIcon={step === steps.length ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                    className={cn(step === steps.length ? "bg-green-600 hover:bg-green-700 shadow-green-900/20" : "")}
                                >
                                    {step === steps.length ? 'Complete Profile' : 'Save & Continue'}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
