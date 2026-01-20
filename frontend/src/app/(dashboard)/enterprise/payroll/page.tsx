"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Users,
    Play,
    AlertCircle,
    CheckCircle,
    FileText,
    Search,
    Download,
    Filter
} from "lucide-react"

export default function PayrollPage() {
    const [isProcessing, setIsProcessing] = useState(false)
    const [processResult, setProcessResult] = useState<any>(null)

    const handleStartPayroll = () => {
        setIsProcessing(true)
        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false)
            setProcessResult({
                processed: 12,
                totalNet: 45000,
                taxes: 12000,
                failed: 0
            })
        }, 2000)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Automated Payroll</h1>
                <p className="text-slate-400 mt-2 text-sm">Review, verify tax withholding, and execute batch employee payments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Users size={20} className="text-blue-400" /> Current EOR Cycle
                            </h2>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                    <input
                                        className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                        placeholder="Search employee..."
                                    />
                                </div>
                                <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5">
                                    <Filter size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden border border-white/5 rounded-xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5">
                                    <tr className="text-slate-400">
                                        <th className="p-4">Employee</th>
                                        <th className="p-4">Gross Salary</th>
                                        <th className="p-4">Tax (US/DE/FR)</th>
                                        <th className="p-4 text-right">Net Payout</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { name: "John Doe", email: "john@eng.co", gross: 12000, tax: 3600, net: 8400, country: "US" },
                                        { name: "Alice Smith", email: "alice@design.io", gross: 9000, tax: 2700, net: 6300, country: "DE" },
                                        { name: "Bob Wilson", email: "bob@marketing.com", gross: 8000, tax: 2000, net: 6000, country: "UK" }
                                    ].map((emp, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium">{emp.name}</div>
                                                <div className="text-xs text-slate-500 italic">{emp.country} Tax Jurisdiction</div>
                                            </td>
                                            <td className="p-4">${emp.gross.toLocaleString()}</td>
                                            <td className="p-4 text-red-400/80">-${emp.tax.toLocaleString()}</td>
                                            <td className="p-4 text-right font-bold text-emerald-400">${emp.net.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-emerald-600/10 border border-blue-500/20 space-y-6">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Play size={18} className="text-blue-400 font-bold" /> Cycle Control
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Total Gross</span>
                                <span className="font-medium">$29,000.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Total Withholding</span>
                                <span className="text-red-400">-$8,300.00</span>
                            </div>
                            <div className="h-px bg-white/10" />
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total Payout</span>
                                <span className="text-emerald-400">$20,700.00</span>
                            </div>
                        </div>

                        <button
                            onClick={handleStartPayroll}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isProcessing ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                                }`}
                        >
                            {isProcessing ? (
                                <>Processing...</>
                            ) : (
                                <>Process Monthly Batch <CheckCircle size={20} /></>
                            )}
                        </button>

                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                            <AlertCircle className="shrink-0 text-amber-500" size={18} />
                            <p className="text-[11px] text-amber-200/80 leading-relaxed">
                                Platform treasury will hold withholding taxes until next quarterly remittance.
                                Ensure all local jurisdiction filings match this batch.
                            </p>
                        </div>
                    </div>

                    <AnimatePresence>
                        {processResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4"
                            >
                                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                    <CheckCircle size={20} /> Cycle Successfully Executed
                                </div>
                                <div className="text-xs text-slate-400 space-y-1">
                                    <div>Ref: CYC-2026-JAN-01</div>
                                    <div>Processed: {processResult.processed} Payments</div>
                                    <div>Taxes Forwarded: ${processResult.taxes}</div>
                                </div>
                                <button className="text-blue-400 text-xs font-semibold hover:underline flex items-center gap-1">
                                    Download Detailed Ledger <FileText size={14} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
