'use client';

import React from 'react';
import { MoreVertical, Search, Filter, Shield } from 'lucide-react';

export function CloudMembers({ members }: { members: any[] }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 backdrop-blur-xl">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-400" />
                            Cloud Members
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{members.length} Vetted Freelancers</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search talent..."
                                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all w-64"
                            />
                        </div>
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"><Filter className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="p-2">
                    {members.length > 0 ? (
                        members.map((member, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-800/50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden relative">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">User ID: {member.userId.substring(0, 8)}...</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded-full">{member.role}</span>
                                            {member.status === 'ACTIVE' && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden md:block">
                                        <div className="text-xs font-medium text-slate-400">Joined</div>
                                        <div className="text-sm font-bold text-white">{new Date(member.joinedAt).toLocaleDateString()}</div>
                                    </div>
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            No members found in this cloud.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
