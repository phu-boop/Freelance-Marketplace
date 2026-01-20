'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    TrendingUp,
    DollarSign,
    Briefcase,
    Shield,
    Settings,
    ArrowUpRight,
    Search,
    Filter,
    MoreVertical,
    UserPlus,
    BarChart3,
    PieChart,
    ChevronRight,
    Building2,
    Calendar,
    Globe,
    CreditCard,
    Clock
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function AgencyDashboard({ user }: { user: any }) {
    const [agency, setAgency] = React.useState<any>(null);
    const [members, setMembers] = React.useState<any[]>([]);
    const [contracts, setContracts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<'overview' | 'team' | 'financials' | 'settings'>('overview');

    React.useEffect(() => {
        const fetchAgencyData = async () => {
            try {
                // Fetch primary agency/team for user
                const teamsRes = await api.get('/user/teams');
                const primaryAgency = teamsRes.data.find((t: any) => t.isAgency) || teamsRes.data[0];

                if (primaryAgency) {
                    setAgency(primaryAgency);

                    // Fetch agency details (members)
                    const agencyDetailsRes = await api.get(`/user/teams/${primaryAgency.id}`);
                    setMembers(agencyDetailsRes.data.members || []);

                    // Fetch agency contracts
                    const contractsRes = await api.get(`/contracts/my?agencyId=${primaryAgency.id}`);
                    setContracts(contractsRes.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch agency data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchAgencyData();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!agency) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-6 max-w-2xl mx-auto mt-20">
                <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
                    <Building2 className="w-10 h-10 text-blue-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">No Agency Found</h2>
                    <p className="text-slate-400">You are not currently part of an agency. Agencies allow you to collaborate with other freelancers and manage collective bidding.</p>
                </div>
                <button
                    onClick={() => window.location.href = '/settings/teams'}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
                >
                    Create or Join an Agency
                </button>
            </div>
        );
    }

    const totalRevenue = contracts.reduce((sum, c) => sum + Number(c.totalAmount || 0), 0);
    const agencyShare = totalRevenue * (Number(agency.revenueSplitPercent || 20) / 100);

    const stats = [
        { label: 'Agency Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Active Members', value: members.length.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Live Contracts', value: contracts.filter(c => c.status === 'ACTIVE').length.toString(), icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Revenue Share', value: `${agency.revenueSplitPercent}%`, icon: PieChart, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    ];

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                        {agency.logoUrl ? (
                            <img src={agency.logoUrl} alt={agency.name} className="w-full h-full object-cover rounded-[2rem]" />
                        ) : (
                            <Building2 className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-white tracking-tight">{agency.name}</h1>
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">Agency 3.0</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {agency.agencyWebsite || 'No website'}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {format(new Date(agency.createdAt), 'MMM yyyy')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Manage
                    </button>
                    <button className="px-5 py-2.5 bg-blue-600 shadow-xl shadow-blue-500/20 text-white rounded-2xl text-sm font-bold hover:bg-blue-500 transition-all flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Invite Talent
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 border-b border-slate-800/50">
                {(['overview', 'team', 'financials', 'settings'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-6 py-3 rounded-t-2xl text-sm font-bold transition-all capitalize whitespace-nowrap",
                            activeTab === tab
                                ? "bg-slate-900 text-blue-400 border-x border-t border-slate-800 relative z-10"
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="p-6 rounded-[2.5rem] bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <stat.icon className="w-20 h-20 -mr-6 -mt-6 rotate-12" />
                                </div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn(stat.bg, stat.color, "p-4 rounded-2xl group-hover:scale-110 transition-transform")}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Data</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-3xl font-black text-white tracking-tighter">{stat.value}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Team Performance */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-blue-400" />
                                            Top Performers
                                        </h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Revenue generated by team members</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"><Filter className="w-4 h-4" /></button>
                                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="p-2">
                                    {members.slice(0, 5).map((member, idx) => (
                                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-800/50 rounded-2xl transition-all group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden relative">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user.email}`} alt={member.user.firstName} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{member.user.firstName} {member.user.lastName}</div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">{member.role}</div>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-0.5">
                                                <div className="text-sm font-black text-white tracking-tight">$1,250.00</div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                                                    <ArrowUpRight className="w-2.5 h-2.5" /> 12% Growth
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-slate-900/50 border-t border-slate-800">
                                    <button className="w-full py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-2xl text-xs font-black text-white uppercase tracking-[0.2em] transition-all">
                                        View Full Team Analytics
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Agency Config Panel */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-blue-500/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-wider">Revenue Share</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Distribution Model</span>
                                            <span className="text-2xl font-black text-white tracking-tighter">{agency.revenueSplitPercent}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${agency.revenueSplitPercent}%` }}
                                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                                            This amount is automatically deducted from payouts and credited to the agency wallet.
                                        </p>
                                    </div>
                                    <button className="w-full py-4 bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-50 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-white/5">
                                        Update Split
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-purple-400" />
                                    Agency Wallet
                                </h3>
                                <div className="space-y-1">
                                    <div className="text-4xl font-black text-white tracking-tighter">${agencyShare.toLocaleString()}</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pending Settlement</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.1em] transition-all">Withdraw</button>
                                    <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.1em] transition-all">Report</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'team' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {members.map((member, idx) => (
                        <div key={idx} className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] hover:border-slate-700 transition-all group shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden group-hover:scale-105 transition-transform">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user.email}`} alt={member.user.firstName} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={cn(
                                        "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                                        member.role === 'OWNER' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                            member.role === 'ADMIN' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                    )}>
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xl font-bold text-white tracking-tight">{member.user.firstName} {member.user.lastName}</h4>
                                    <p className="text-xs font-medium text-slate-500">{member.user.email}</p>
                                </div>
                                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Contracts</div>
                                        <div className="text-lg font-black text-white">4</div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Earnings (30d)</div>
                                        <div className="text-lg font-black text-green-400 group-hover:translate-x-[-4px] transition-transform">$2,450</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="p-8 border-2 border-dashed border-slate-800 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-blue-400 group">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <PlusCircle className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest">Add Member</span>
                    </button>
                </div>
            )}

            {/* Other tabs placeholders */}
            {(activeTab === 'financials' || activeTab === 'settings') && (
                <div className="p-20 text-center bg-slate-900 border border-slate-800 rounded-[2.5rem] border-dashed">
                    <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-slate-500 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">This section is currently under development to bring you deeper agency insights.</p>
                </div>
            )}
        </div>
    );
}

const PlusCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
    </svg>
);
