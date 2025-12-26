'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, Download, Printer, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    amount: number;
    type: string;
    description: string;
    status: string;
    userId: string;
}

export default function InvoicePage() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await api.get(`/payments/transactions/${id}/invoice`);
                setInvoice(res.data);
            } catch (error) {
                console.error('Failed to fetch invoice', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!invoice) {
        return <div className="text-center text-slate-400">Invoice not found</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-8">
            <div className="flex justify-between items-center print:hidden">
                <Link href="/wallet" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Wallet
                </Link>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            <div className="bg-white text-slate-900 rounded-3xl p-12 shadow-2xl space-y-12 min-h-[800px]">
                <div className="flex justify-between items-start">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600">
                            <FileText className="w-8 h-8" />
                            <span className="text-2xl font-black tracking-tighter">FREELANCE<span className="text-slate-900">MARKET</span></span>
                        </div>
                        <div className="text-sm text-slate-500">
                            <p>123 Marketplace Ave</p>
                            <p>Tech City, TC 12345</p>
                            <p>support@freelancemarket.com</p>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <h1 className="text-4xl font-black text-slate-900">INVOICE</h1>
                        <p className="text-slate-500 font-medium">{invoice.invoiceNumber}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 border-t border-slate-100 pt-12">
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Billed To</p>
                        <p className="font-bold text-lg">User ID: {invoice.userId}</p>
                        <p className="text-sm text-slate-500">Platform Member</p>
                    </div>
                    <div className="text-right space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Invoice Details</p>
                        <div className="space-y-1">
                            <p className="text-sm"><span className="text-slate-400">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
                            <p className="text-sm"><span className="text-slate-400">Status:</span> <span className="text-emerald-600 font-bold">{invoice.status}</span></p>
                        </div>
                    </div>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-slate-900">
                            <th className="text-left py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                            <th className="text-right py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="text-right py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-slate-100">
                            <td className="py-6">
                                <p className="font-bold text-slate-900">{invoice.description || 'Service Transaction'}</p>
                                <p className="text-xs text-slate-500 mt-1">Transaction ID: {id}</p>
                            </td>
                            <td className="py-6 text-right font-medium text-slate-600">{invoice.type}</td>
                            <td className="py-6 text-right font-black text-slate-900">${Number(invoice.amount).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="flex justify-end pt-12">
                    <div className="w-64 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-bold">${Number(invoice.amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Tax (0%)</span>
                            <span className="font-bold">$0.00</span>
                        </div>
                        <div className="h-px bg-slate-100" />
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-3xl font-black text-blue-600">${Number(invoice.amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-24 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-900">Thank you for your business!</p>
                    <p className="text-xs text-slate-400">If you have any questions about this invoice, please contact our support team.</p>
                </div>
            </div>
        </div>
    );
}
