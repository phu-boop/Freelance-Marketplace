import React, { useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface Education {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string | null;
}

interface EducationListProps {
    initialData: Education[];
}

export const EducationList: React.FC<EducationListProps> = ({ initialData }) => {
    const { userId } = useKeycloak();
    const [education, setEducation] = useState<Education[]>(initialData);
    const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or id
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Education>>({});

    const handleEdit = (edu: Education) => {
        setFormData({ ...edu });
        setIsEditing(edu.id);
    };

    const handleNew = () => {
        setFormData({ institution: '', degree: '', fieldOfStudy: '', startDate: '' });
        setIsEditing('new');
    };

    const handleCancel = () => {
        setIsEditing(null);
        setFormData({});
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this education entry?')) return;
        try {
            await api.delete(`/users/education/${id}`);
            setEducation(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Failed to delete education', error);
        }
    };

    const handleSave = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const payload = {
                ...formData,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
            };

            if (isEditing === 'new') {
                const res = await api.post(`/users/${userId}/education`, payload);
                setEducation(prev => [...prev, res.data]);
            } else {
                const res = await api.patch(`/users/education/${isEditing}`, payload);
                setEducation(prev => prev.map(e => e.id === isEditing ? res.data : e));
            }
            setIsEditing(null);
        } catch (error) {
            console.error('Failed to save education', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Education</h3>
                {!isEditing && (
                    <Button onClick={handleNew} variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                        Add Education
                    </Button>
                )}
            </div>

            {isEditing && (
                <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
                    <Input
                        label="Institution"
                        value={formData.institution || ''}
                        onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Degree"
                            value={formData.degree || ''}
                            onChange={e => setFormData({ ...formData, degree: e.target.value })}
                        />
                        <Input
                            label="Field of Study"
                            value={formData.fieldOfStudy || ''}
                            onChange={e => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                        />
                    </div>
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
                            value={formData.endDate?.split('T')[0] || ''}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={handleCancel} disabled={loading}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={loading}>Save</Button>
                    </div>
                </Card>
            )}

            <div className="space-y-4">
                {education.map(edu => (
                    <div key={edu.id} className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 flex justify-between items-start group hover:border-slate-700 transition-all">
                        <div>
                            <h4 className="font-bold text-white">{edu.institution}</h4>
                            <p className="text-blue-400">{edu.degree} in {edu.fieldOfStudy}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                            </p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(edu)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(edu.id)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {education.length === 0 && !isEditing && (
                    <div className="text-center py-8 text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                        No education history added yet.
                    </div>
                )}
            </div>
        </div>
    );
};
