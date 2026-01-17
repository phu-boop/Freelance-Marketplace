import React, { useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { getPublicUrl } from '@/lib/utils';
import { useKeycloak } from '@/components/KeycloakProvider';

interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    projectUrl?: string;
}

interface PortfolioListProps {
    initialData: PortfolioItem[];
}

export const PortfolioList: React.FC<PortfolioListProps> = ({ initialData }) => {
    const { userId } = useKeycloak();
    const [items, setItems] = useState<PortfolioItem[]>(initialData);
    const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or id
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<PortfolioItem>>({});

    const handleEdit = (item: PortfolioItem) => {
        setFormData({ ...item });
        setIsEditing(item.id);
    };

    const handleNew = () => {
        setFormData({ title: '', description: '', imageUrl: '' });
        setIsEditing('new');
    };

    const handleCancel = () => {
        setIsEditing(null);
        setFormData({});
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.delete(`/users/portfolio/${id}`);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            console.error('Failed to delete portfolio item', error);
        }
    };

    const handleSave = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            if (isEditing === 'new') {
                const res = await api.post(`/users/${userId}/portfolio`, formData);
                setItems(prev => [...prev, res.data]);
            } else {
                const res = await api.patch(`/users/portfolio/${isEditing}`, formData);
                setItems(prev => prev.map(i => i.id === isEditing ? res.data : i));
            }
            setIsEditing(null);
        } catch (error) {
            console.error('Failed to save portfolio item', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Portfolio</h3>
                {!isEditing && (
                    <Button onClick={handleNew} variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                        Add Project
                    </Button>
                )}
            </div>

            {isEditing && (
                <Card className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
                    <Input
                        label="Project Title"
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                    <Input
                        label="Image URL"
                        value={formData.imageUrl || ''}
                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                        rightIcon={formData.imageUrl ? <img src={getPublicUrl(formData.imageUrl)} className="w-6 h-6 rounded object-cover" /> : <ImageIcon className="w-4 h-4" />}
                    />
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Description</label>
                        <textarea
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none"
                            rows={3}
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={handleCancel} disabled={loading}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={loading}>Save</Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                    <div key={item.id} className="group rounded-xl bg-slate-900/30 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all">
                        <div className="aspect-video bg-slate-900 relative">
                            {item.imageUrl ? (
                                <img src={getPublicUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-700">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => handleEdit(item)} className="p-2 bg-slate-800/80 rounded-full hover:bg-white hover:text-slate-900 transition-all">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-800/80 rounded-full hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-white truncate">{item.title}</h4>
                            <p className="text-slate-500 text-sm line-clamp-2 mt-1">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            {items.length === 0 && !isEditing && (
                <div className="text-center py-8 text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                    No portfolio projects added yet.
                </div>
            )}
        </div>
    );
};
