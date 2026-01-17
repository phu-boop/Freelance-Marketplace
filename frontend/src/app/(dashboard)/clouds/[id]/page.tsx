'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useKeycloak } from '@/components/KeycloakProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Users,
    UserPlus,
    Trash2,
    ArrowLeft,
    Search,
    Shield,
    Mail,
    Star,
    LayoutGrid,
    List,
    MoreVertical,
    FileText,
    CheckCircle2,
    Check,
    Loader2,
    BadgeCheck,
    Settings,
    CreditCard,
    DollarSign as BudgetIcon
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

interface CloudMember {
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
    userProfile?: any;
}

interface CloudDetails {
    id: string;
    name: string;
    description: string;
    visibility: string;
    costCenter?: string;
    budget?: number;
    ownerId: string;
}

export default function CloudDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { userId, roles, token } = useKeycloak();

    const [cloud, setCloud] = useState<CloudDetails | null>(null);
    const [members, setMembers] = useState<CloudMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    // Invite Talent State
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [talentQuery, setTalentQuery] = useState('');
    const [talentResults, setTalentResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Edit Cloud State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editCloud, setEditCloud] = useState({ name: '', description: '', visibility: 'PRIVATE', costCenter: '', budget: 0 });

    const fetchData = async () => {
        if (!id) return;
        try {
            const cloudRes = await axios.get(`/api/clouds/${id}`);
            setCloud(cloudRes.data);
            setMembers(cloudRes.data.members || []);
            setEditCloud({
                name: cloudRes.data.name,
                description: cloudRes.data.description,
                visibility: cloudRes.data.visibility,
                costCenter: cloudRes.data.costCenter || '',
                budget: cloudRes.data.budget || 0
            });
        } catch (err) {
            console.error('Failed to fetch cloud details:', err);
            toast.error('Failed to load talent cloud details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCloud = async () => {
        try {
            await axios.patch(`/api/clouds/${id}`, editCloud);
            toast.success('Cloud settings updated!');
            setIsEditOpen(false);
            fetchData();
        } catch (err) {
            console.error('Failed to update cloud:', err);
            toast.error('Failed to update cloud settings');
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const searchFreelancers = async () => {
        if (!talentQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await axios.get(`/api/search/users?q=${talentQuery}`);
            setTalentResults(res.data.results || []);
        } catch (err) {
            console.error('Search failed:', err);
            toast.error('Failed to search freelancers');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddMember = async (memberUserId: string) => {
        try {
            await axios.post(`/api/clouds/${id}/members`, { userId: memberUserId });
            toast.success('Talent added to cloud!');
            fetchData(); // Refresh list
        } catch (err) {
            console.error('Failed to add member:', err);
            toast.error('Failed to add talent');
        }
    };

    const handleRemoveMember = async (memberUserId: string) => {
        if (!window.confirm('Are you sure you want to remove this member from the cloud?')) return;

        try {
            await axios.delete(`/api/clouds/${id}/members/${memberUserId}`);
            setMembers(members.filter(m => m.userId !== memberUserId));
            toast.success('Member removed successfully');
        } catch (err) {
            console.error('Failed to remove member:', err);
            toast.error('Failed to remove member');
        }
    };

    const filteredMembers = members.filter(m =>
        m.userProfile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.userProfile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.userId.includes(searchQuery)
    );

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading Cloud details...</div>;
    }

    if (!cloud) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-white">Cloud not found</h2>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col gap-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="w-fit text-slate-400 hover:text-white gap-2 -ml-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Selection
                </Button>

                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-4 bg-blue-600/20 rounded-2xl">
                                <Users className="w-8 h-8 text-blue-400" />
                            </div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">{cloud.name}</h1>
                        </div>
                        <p className="text-slate-400 text-lg max-w-2xl">{cloud.description}</p>
                    </div>
                    <div className="flex gap-3">
                        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 rounded-xl px-5 py-6 font-semibold transition-all flex gap-2">
                                    <Settings className="w-5 h-5 text-blue-500" />
                                    Cloud Settings
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-950 border-slate-800 max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-white">Update Talent Cloud</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Modify the pool configuration and financial metadata.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name" className="text-slate-300">Cloud Name</Label>
                                        <Input
                                            id="edit-name"
                                            value={editCloud.name}
                                            onChange={(e) => setEditCloud({ ...editCloud, name: e.target.value })}
                                            className="bg-slate-900 border-slate-800 text-white rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-description" className="text-slate-300">Description</Label>
                                        <textarea
                                            id="edit-description"
                                            value={editCloud.description}
                                            onChange={(e) => setEditCloud({ ...editCloud, description: e.target.value })}
                                            className="w-full h-32 bg-slate-900 border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-costCenter" className="text-slate-300 uppercase text-[10px] font-bold">Cost Center</Label>
                                            <Input
                                                id="edit-costCenter"
                                                value={editCloud.costCenter}
                                                onChange={(e) => setEditCloud({ ...editCloud, costCenter: e.target.value })}
                                                className="bg-slate-900 border-slate-800 text-white rounded-xl h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-budget" className="text-slate-300 uppercase text-[10px] font-bold">Annual Budget ($)</Label>
                                            <Input
                                                id="edit-budget"
                                                type="number"
                                                value={editCloud.budget}
                                                onChange={(e) => setEditCloud({ ...editCloud, budget: Number(e.target.value) })}
                                                className="bg-slate-900 border-slate-800 text-white rounded-xl h-12"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleUpdateCloud} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6">
                                        Save Changes
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-6 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex gap-2">
                                    <UserPlus className="w-5 h-5" />
                                    Invite Talent
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-950 border-slate-800 max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
                                <DialogHeader className="p-6 pb-2">
                                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                        <UserPlus className="w-6 h-6 text-blue-400" />
                                        Bring Top Talent to {cloud.name}
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Search our global marketplace for verified experts to add to your private cloud.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="p-6 pt-2 space-y-4">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <Input
                                                placeholder="Search by name, skill, or role..."
                                                value={talentQuery}
                                                onChange={(e) => setTalentQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && searchFreelancers()}
                                                className="pl-11 bg-slate-900 border-slate-800 rounded-xl h-12 text-white"
                                            />
                                        </div>
                                        <Button
                                            onClick={searchFreelancers}
                                            disabled={isSearching}
                                            className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl px-6 font-bold"
                                        >
                                            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                                        </Button>
                                    </div>

                                    <div className="overflow-y-auto max-h-[400px] pr-2 space-y-3 custom-scrollbar">
                                        {talentResults.length > 0 ? (
                                            talentResults.map(talent => {
                                                const isAlreadyMember = members.some(m => m.userId === talent.id);
                                                return (
                                                    <div key={talent.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between group hover:bg-slate-900 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700 overflow-hidden">
                                                                {talent.avatar ? (
                                                                    <img src={talent.avatar} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    talent.firstName?.charAt(0) || 'U'
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white flex items-center gap-1.5">
                                                                    {talent.firstName} {talent.lastName}
                                                                    <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                                                                </div>
                                                                <div className="text-blue-500 text-xs font-semibold">{talent.title || 'Freelancer'}</div>
                                                                <div className="text-slate-500 text-[10px] mt-1 flex flex-wrap gap-1">
                                                                    {(talent.skills || []).slice(0, 3).map((s: string) => (
                                                                        <span key={s} className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{s}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            disabled={isAlreadyMember}
                                                            onClick={() => handleAddMember(talent.id)}
                                                            variant={isAlreadyMember ? 'ghost' : 'outline'}
                                                            className={isAlreadyMember
                                                                ? 'text-green-500 bg-green-500/5'
                                                                : 'bg-slate-950 border-slate-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl font-bold h-10'
                                                            }
                                                        >
                                                            {isAlreadyMember ? <Check className="w-5 h-5" /> : 'Add to Cloud'}
                                                        </Button>
                                                    </div>
                                                );
                                            })
                                        ) : talentQuery && !isSearching ? (
                                            <div className="py-12 text-center text-slate-500">
                                                No talent found matching "{talentQuery}"
                                            </div>
                                        ) : !isSearching && (
                                            <div className="py-12 text-center text-slate-500 italic">
                                                Try searching for skills like 'React' or 'Python'
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <DialogFooter className="bg-slate-900/30 p-4 border-t border-slate-800/50">
                                    <Button variant="ghost" onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-white">
                                        Done
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <div className="relative w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Search members by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 bg-slate-950 border-slate-800 rounded-xl focus:ring-blue-500 h-11"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className={viewMode === 'grid' ? 'bg-slate-800 text-white rounded-lg shadow-sm' : 'text-slate-500 rounded-lg'}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={viewMode === 'list' ? 'bg-slate-800 text-white rounded-lg shadow-sm' : 'text-slate-500 rounded-lg'}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="text-slate-500 text-sm font-medium">
                        Showing {filteredMembers.length} members
                    </div>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMembers.map(member => (
                        <Card key={member.id} className="bg-slate-900 border-slate-800 hover:border-blue-500/30 transition-all group overflow-hidden">
                            <CardHeader className="pb-2 relative">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                                <div className="flex flex-col items-center pt-4">
                                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-950 flex items-center justify-center text-3xl font-bold text-slate-600 mb-4 group-hover:scale-105 transition-transform overflow-hidden shadow-2xl">
                                        {member.userProfile?.avatar ? (
                                            <img src={member.userProfile.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            member.userProfile?.firstName?.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <CardTitle className="text-xl text-center flex items-center gap-2 text-white">
                                        {member.userProfile?.firstName} {member.userProfile?.lastName}
                                        {member.userId === userId && (
                                            <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full uppercase font-bold border border-blue-600/20">You</span>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="text-blue-500 font-semibold mt-1">
                                        {member.userProfile?.title || 'Professional Freelancer'}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-center gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    ))}
                                    <span className="text-slate-400 text-xs ml-1 font-bold">(4.9)</span>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {(member.userProfile?.skills || ['React', 'Node.js', 'Typescript']).slice(0, 3).map((skill: string) => (
                                        <span key={skill} className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold border border-slate-700/50">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" className="flex-1 bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold h-10 transition-all">
                                        Profile
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-10 h-10 p-0 bg-slate-950 border-slate-800 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 rounded-xl transition-all"
                                        onClick={() => handleRemoveMember(member.userId)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" className="w-10 h-10 p-0 bg-slate-950 border-slate-800 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400 rounded-xl transition-all">
                                        <Mail className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800">
                                <th className="p-5 text-slate-500 font-bold uppercase text-xs tracking-wider">Member</th>
                                <th className="p-5 text-slate-500 font-bold uppercase text-xs tracking-wider">Title</th>
                                <th className="p-5 text-slate-500 font-bold uppercase text-xs tracking-wider">Role</th>
                                <th className="p-5 text-slate-500 font-bold uppercase text-xs tracking-wider">Joined At</th>
                                <th className="p-5 text-slate-500 font-bold uppercase text-xs tracking-wider">Stats</th>
                                <th className="p-5 text-slate-500 font-bold uppercase text-xs tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map(member => (
                                <tr key={member.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-md">
                                                {member.userProfile?.avatar ? (
                                                    <img src={member.userProfile.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-slate-500">{member.userProfile?.firstName?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-lg">{member.userProfile?.firstName} {member.userProfile?.lastName}</div>
                                                <div className="text-slate-500 text-xs font-medium">{member.userId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-blue-400 font-semibold">{member.userProfile?.title || 'Full Stack Engineer'}</div>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-slate-700">
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="p-5 text-slate-400 font-medium">
                                        {new Date(member.joinedAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Star className="w-3.5 h-3.5 fill-amber-500" />
                                                <span className="font-bold">4.9</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-green-500">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span className="font-bold text-xs uppercase tracking-tighter">Vetted</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl h-10 w-10 transition-all">
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl h-10 w-10 transition-all">
                                                <Mail className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl h-10 w-10 transition-all"
                                                onClick={() => handleRemoveMember(member.userId)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
