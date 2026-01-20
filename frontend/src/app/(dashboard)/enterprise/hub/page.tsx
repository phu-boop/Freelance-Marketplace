"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    BarChart3,
    Wallet,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    Building2,
    PieChart,
    ArrowRight,
    ShieldCheck,
    Briefcase
} from "lucide-react"

export default function EnterpriseHub() {
    const [stats, setStats] = useState({
        totalSpend: 154200,
        activeContracts: 12,
        pendingApprovals: 3,
        departmentSpend: [
            { name: "Engineering", amount: 85000, color: "bg-blue-500" },
            { name: "Marketing", amount: 32000, color: "bg-purple-500" },
            { name: "Design", amount: 24500, color: "bg-pink-500" },
            { name: "Others", amount: 12700, color: "bg-gray-400" }
        ]
    })

    const [approvals, setApprovals] = useState([
        { id: "1", type: "Contract", title: "Senior AI Engineer - Q1 Project", amount: 15000, requester: "Alex Rivers", date: "2026-01-16", roles: ["FINANCE"] },
        { id: "2", type: "EOR HIRE", title: "Product Designer (EOR)", amount: 8000, requester: "Sarah Chen", date: "2026-01-17", roles: ["ADMIN"] },
        { id: "3", type: "Payment", title: "Cloud Ops Milestone 3", amount: 25000, requester: "James Bond", date: "2026-01-17", roles: ["FINANCE", "ADMIN"] }
    ])

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Enterprise Hub
                    </h1>
                    <p className="text-slate-400 mt-2">Manage departmental budgets, approvals, and EOR operations.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all flex items-center gap-2">
                        <Briefcase size={18} /> New Batch Hire
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Period Spend", value: `$${stats.totalSpend.toLocaleString()}`, icon: Wallet, color: "text-blue-400" },
                    { label: "Active Enterprise Contracts", value: stats.activeContracts, icon: Building2, color: "text-emerald-400" },
                    { label: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, color: "text-amber-400" },
                    { label: "Treasury Balance", value: "$420,000", icon: ShieldCheck, color: "text-purple-400" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <div className="mt-4 text-2xl font-bold">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Department spend Chart (Simplified) */}
                <div className="lg:col-span-1 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                    <div className="flex items-center gap-2">
                        <PieChart className="text-blue-400" size={20} />
                        <h2 className="text-lg font-semibold">Spend by Department</h2>
                    </div>
                    <div className="space-y-4">
                        {stats.departmentSpend.map((dept, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>{dept.name}</span>
                                    <span className="font-semibold">${dept.amount.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(dept.amount / stats.totalSpend) * 100}%` }}
                                        className={`h-full ${dept.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Approval Queue */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" size={20} />
                        <h2 className="text-lg font-semibold">Approval Queue</h2>
                    </div>
                    <div className="overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-slate-400 text-sm">
                                    <th className="pb-3 pr-4">Type</th>
                                    <th className="pb-3">Details</th>
                                    <th className="pb-3 text-right">Amount</th>
                                    <th className="pb-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {approvals.map((item) => (
                                    <tr key={item.id} className="group">
                                        <td className="py-4 pr-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold ${item.type === 'EOR HIRE' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-xs text-slate-500">By {item.requester} • {item.date}</div>
                                            <div className="mt-1 flex gap-1">
                                                {item.roles.map(r => (
                                                    <span key={r} className="text-[10px] text-amber-500/80 border border-amber-500/20 px-1 rounded">Need: {r}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right font-bold text-slate-200">
                                            ${item.amount.toLocaleString()}
                                        </td>
                                        <td className="py-4 text-right space-x-2">
                                            <button className="p-2 hover:bg-emerald-500/10 text-emerald-400 rounded-lg transition-colors">
                                                <CheckCircle2 size={20} />
                                            </button>
                                            <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                                                <XCircle size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 group">
                        View full queue <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    )
}
