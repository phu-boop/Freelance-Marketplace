'use client';

import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Shield, Globe, Lock, MoreVertical, ExternalLink } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface TalentCloud {
    cloud: {
        id: string;
        name: string;
        description: string;
        visibility: 'PUBLIC' | 'PRIVATE';
        ownerId: string;
        costCenter?: string;
        budget?: number;
    };
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export default function CloudsPage() {
    const { userId, roles, token } = useKeycloak();
    const [clouds, setClouds] = useState<TalentCloud[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCloud, setNewCloud] = useState({ name: '', description: '', visibility: 'PRIVATE', costCenter: '', budget: 0 });

    const fetchClouds = async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`/api/clouds/user/${userId}`);
            setClouds(res.data);
        } catch (err) {
            console.error('Failed to fetch clouds:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClouds();
    }, [userId]);

    const handleCreateCloud = async () => {
        if (!newCloud.name) {
            toast.error('Cloud name is required');
            return;
        }

        try {
            await axios.post('/api/clouds', {
                ...newCloud,
                ownerId: userId
            });
            toast.success('Talent Cloud created successfully!');
            setIsCreateOpen(false);
            setNewCloud({ name: '', description: '', visibility: 'PRIVATE', costCenter: '', budget: 0 });
            fetchClouds();
        } catch (err) {
            console.error('Failed to create cloud:', err);
            toast.error('Failed to create Talent Cloud');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading Talent Clouds...</div>;
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Users className="w-10 h-10 text-blue-500" />
                        Talent Clouds
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Manage your private pools of vetted talent.</p>
                </div>
                {roles.includes('CLIENT') && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-6 text-lg font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex gap-2">
                                <Plus className="w-6 h-6" />
                                Create New Cloud
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-950 border-slate-800 max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-white">Create Talent Cloud</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Define a new private pool for your organization's verified talent.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-300">Cloud Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Premium React Experts"
                                        value={newCloud.name}
                                        onChange={(e) => setNewCloud({ ...newCloud, name: e.target.value })}
                                        className="bg-slate-900 border-slate-800 text-white rounded-xl h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-slate-300">Description</Label>
                                    <textarea
                                        id="description"
                                        placeholder="Briefly describe the purpose of this cloud..."
                                        value={newCloud.description}
                                        onChange={(e) => setNewCloud({ ...newCloud, description: e.target.value })}
                                        className="w-full h-32 bg-slate-900 border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Visibility & Finance</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            type="button"
                                            variant={newCloud.visibility === 'PRIVATE' ? 'primary' : 'outline'}
                                            onClick={() => setNewCloud({ ...newCloud, visibility: 'PRIVATE' })}
                                            className={newCloud.visibility === 'PRIVATE' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-900 border-slate-800 text-slate-400'}
                                        >
                                            <Lock className="w-4 h-4 mr-2" />
                                            Private
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={newCloud.visibility === 'PUBLIC' ? 'primary' : 'outline'}
                                            onClick={() => setNewCloud({ ...newCloud, visibility: 'PUBLIC' })}
                                            className={newCloud.visibility === 'PUBLIC' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-900 border-slate-800 text-slate-400'}
                                        >
                                            <Globe className="w-4 h-4 mr-2" />
                                            Public
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="costCenter" className="text-[10px] text-slate-500 uppercase font-bold">Cost Center</Label>
                                            <Input
                                                id="costCenter"
                                                placeholder="e.g. DEPT-42"
                                                value={newCloud.costCenter}
                                                onChange={(e) => setNewCloud({ ...newCloud, costCenter: e.target.value })}
                                                className="bg-slate-900 border-slate-800 text-white rounded-xl h-10 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="budget" className="text-[10px] text-slate-500 uppercase font-bold">Annual Budget ($)</Label>
                                            <Input
                                                id="budget"
                                                type="number"
                                                placeholder="0.00"
                                                value={newCloud.budget}
                                                onChange={(e) => setNewCloud({ ...newCloud, budget: Number(e.target.value) })}
                                                className="bg-slate-900 border-slate-800 text-white rounded-xl h-10 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateCloud}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                                >
                                    Create Cloud
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clouds.length > 0 ? (
                    clouds.map((item) => (
                        <Card key={item.cloud.id} className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-3 bg-blue-600/10 rounded-xl group-hover:bg-blue-600/20 transition-colors">
                                        <Users className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {item.cloud.visibility === 'PUBLIC' ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                                <Globe className="w-3.5 h-3.5" />
                                                Public
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                                                <Lock className="w-3.5 h-3.5" />
                                                Private
                                            </div>
                                        )}
                                        {item.cloud.costCenter && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                                                {item.cloud.costCenter}
                                            </div>
                                        )}
                                        {item.cloud.budget ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
                                                ${item.cloud.budget.toLocaleString()}
                                            </div>
                                        ) : null}
                                        <div className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                                            {item.role}
                                        </div>
                                    </div>
                                </div>
                                <CardTitle className="text-2xl text-white group-hover:text-blue-400 transition-colors">{item.cloud.name}</CardTitle>
                                <CardDescription className="text-slate-400 text-base line-clamp-2 mt-2">
                                    {item.cloud.description || 'No description provided.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <Shield className="w-4 h-4" />
                                        <span>Enterprise Vetted</span>
                                    </div>
                                    <Link href={`/clouds/${item.cloud.id}`}>
                                        <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 gap-2 font-semibold">
                                            Manage
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <Users className="w-10 h-10 text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No Talent Clouds found</h3>
                        <p className="text-slate-400 max-w-md">Start building your private talent pool to streamline your hiring process for high-value projects.</p>
                        {roles.includes('CLIENT') && (
                            <Button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-4 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                                Create Your First Cloud
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
