import React, { useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface Experience {
    id: string;
    company: string;
    title: string;
    startDate: string;
    endDate?: string | null;
    current?: boolean;
    description?: string;
}

interface ExperienceListProps {
    initialData: Experience[];
}

export const ExperienceList: React.FC<ExperienceListProps> = ({ initialData }) => {
    const { userId } = useKeycloak();
    const [experiences, setExperiences] = useState<Experience[]>(initialData);
    const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or id
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Experience>>({});

    const handleEdit = (exp: Experience) => {
        setFormData({ ...exp, current: !exp.endDate });
        setIsEditing(exp.id);
    };

    const handleNew = () => {
        setFormData({ company: '', title: '', startDate: '', current: false });
        setIsEditing('new');
    };

    const handleCancel = () => {
        setIsEditing(null);
        setFormData({});
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this experience?')) return;
        try {
            await api.delete(`/users/experience/${id}`);
            setExperiences(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Failed to delete experience', error);
        }
    };

    const handleSave = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const payload = {
                ...formData,
                endDate: formData.current ? null : formData.endDate ? new Date(formData.endDate).toISOString() : null,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
            };

            if (isEditing === 'new') {
                const res = await api.post(`/users/${userId}/experience`, payload);
                setExperiences(prev => [...prev, res.data]);
            } else {
                const res = await api.patch(`/users/experience/${isEditing}`, payload);
                setExperiences(prev => prev.map(e => e.id === isEditing ? res.data : e));
            }
            setIsEditing(null);
        } catch (error) {
            console.error('Failed to save experience', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Work Experience</h3>
                {!isEditing && (
                    <Button onClick={handleNew} variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                        Add Experience
                    </Button>
                )}
            </div>

            {isEditing && (
                <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
                    <Input
                        label="Company"
                        value={formData.company || ''}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                    />
                    <Input
                        label="Job Title"
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Start Date"
                            type="date"
                            value={formData.startDate?.split('T')[0] || ''}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <Input
                            label="End Date"
                            type="date"
                            disabled={formData.current}
                            value={formData.endDate?.split('T')[0] || ''}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.current}
                            onChange={e => setFormData({ ...formData, current: e.target.checked })}
                            className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="text-sm text-slate-400">I currently work here</label>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={handleCancel} disabled={loading}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={loading}>Save</Button>
                    </div>
                </Card>
            )}

            <div className="space-y-4">
                {experiences.map(exp => (
                    <div key={exp.id} className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 flex justify-between items-start group hover:border-slate-700 transition-all">
                        <div>
                            <h4 className="font-bold text-white">{exp.title}</h4>
                            <p className="text-blue-400">{exp.company}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                            </p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(exp)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(exp.id)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {experiences.length === 0 && !isEditing && (
                    <div className="text-center py-8 text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                        No work experience added yet.
                    </div>
                )}
            </div>
        </div>
    );
};
