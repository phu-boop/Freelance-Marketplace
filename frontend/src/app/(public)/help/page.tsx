'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ChevronDown,
    LifeBuoy,
    Briefcase,
    Settings,
    Shield,
    CreditCard,
    MessageCircle,
    Mail,
    Phone,
    ArrowRight,
    HelpCircle,
    TrendingUp,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => (
    <div className="border-b border-slate-800 last:border-none">
        <button
            onClick={onClick}
            className="w-full py-6 flex items-center justify-between text-left group"
        >
            <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-blue-400' : 'text-white group-hover:text-blue-300'}`}>
                {question}
            </span>
            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <p className="pb-6 text-slate-400 leading-relaxed max-w-3xl">
                        {answer}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const categories = [
        { id: 'getting-started', label: 'Getting Started', icon: <TrendingUp className="w-5 h-5" /> },
        { id: 'freelancing', label: 'Freelancing', icon: <Briefcase className="w-5 h-5" /> },
        { id: 'hiring', label: 'Hiring Talent', icon: <CheckCircle2 className="w-5 h-5" /> },
        { id: 'payments', label: 'Payments', icon: <CreditCard className="w-5 h-5" /> },
        { id: 'security', label: 'Safety & Security', icon: <Shield className="w-5 h-5" /> },
        { id: 'account', label: 'Account Settings', icon: <Settings className="w-5 h-5" /> },
    ];

    const faqs = [
        {
            category: 'getting-started',
            question: "How do I create a professional profile?",
            answer: "To create a profile that stands out, navigate to your Settings and fill out your professional title, overview, and skills. We highly recommend uploading a portfolio and adding your verified work history to increase your chances of being hired by 3x."
        },
        {
            category: 'payments',
            question: "How does the Escrow system work?",
            answer: "When a contract starts, the client deposits funds into our secure Escrow system. These funds are held by FreelanceHub and only released to the freelancer once the client approves the submitted work or milestone. This protects both parties."
        },
        {
            category: 'freelancing',
            question: "How do I get paid for my work?",
            answer: "Once your work is approved by the client, the milestone funds are released from Escrow to your FreelanceHub balance. You can then withdraw these funds via VNPay, Bank Transfer, or other supported methods in your region."
        },
        {
            category: 'hiring',
            question: "What should I look for when hiring?",
            answer: "Check the freelancer's Job Success Score (JSS), their total earnings, and read reviews from previous clients. We also recommend chatting with candidates via our secure messaging system before making a final hire."
        },
        {
            category: 'security',
            question: "How can I stay safe on the platform?",
            answer: "Always keep communications and payments within FreelanceHub. Never share sensitive personal info or agree to pay outside the platform. Our team monitors for fraudulent activity 24/7 to keep the marketplace secure."
        }
    ];

    const filteredFaqs = searchQuery
        ? faqs.filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.answer.toLowerCase().includes(searchQuery.toLowerCase()))
        : faqs;

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Header */}
            <div className="relative pt-32 pb-40 overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-3xl" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest"
                    >
                        <LifeBuoy className="w-3 h-3" /> Help center
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-extrabold tracking-tight"
                    >
                        How can we <span className="text-blue-500">help you</span> today?
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto relative group"
                    >
                        <div className="absolute inset-0 bg-blue-500/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search for articles, guides, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-6 bg-slate-900/80 border border-slate-800 rounded-3xl text-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 backdrop-blur-md transition-all relative z-10"
                        />
                    </motion.div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 pb-20">
                {/* Topic Categories */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
                    {categories.map((cat, idx) => (
                        <motion.button
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 + 0.3 }}
                            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all group text-center space-y-4 shadow-xl"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/5 flex items-center justify-center mx-auto group-hover:bg-blue-600 transition-colors">
                                <div className="text-blue-400 group-hover:text-white transition-colors">
                                    {cat.icon}
                                </div>
                            </div>
                            <span className="block text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                                {cat.label}
                            </span>
                        </motion.button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* FAQ Accordion */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                            <p className="text-slate-500">Quick answers to common questions about our platform.</p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq, i) => (
                                    <FAQItem
                                        key={i}
                                        question={faq.question}
                                        answer={faq.answer}
                                        isOpen={openIndex === i}
                                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    />
                                ))
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                    <HelpCircle className="w-12 h-12 text-slate-700 mx-auto" />
                                    <p className="text-slate-500 italic">No matching results found for &quot;{searchQuery}&quot;</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Sidebar */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-[2.5rem] bg-blue-600 space-y-8 shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                            <div className="space-y-2 relative z-10">
                                <h3 className="text-2xl font-bold text-white">Still need help?</h3>
                                <p className="text-blue-100/80 text-sm">Our support team is available 24/7 to assist you with any inquiries.</p>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <a href="mailto:support@freelancehub.com" className="w-full p-4 bg-white/10 backdrop-blur-md rounded-2xl flex items-center gap-4 hover:bg-white/20 transition-all border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">Email us at</p>
                                        <p className="text-sm font-bold text-white">support@freelancehub.com</p>
                                    </div>
                                </a>

                                <div className="w-full p-4 bg-white/10 backdrop-blur-md rounded-2xl flex items-center gap-4 hover:bg-white/20 transition-all border border-white/10 cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">Live Chat</p>
                                        <p className="text-sm font-bold text-white">Start instant conversation</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 group relative z-10">
                                Contact Support <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 space-y-6">
                            <h3 className="font-bold text-white">Community & Learning</h3>
                            <div className="space-y-4">
                                <Link href="#" className="flex items-center justify-between group">
                                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Video tutorials</span>
                                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-all" />
                                </Link>
                                <Link href="#" className="flex items-center justify-between group">
                                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Freelance Academy</span>
                                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-all" />
                                </Link>
                                <Link href="#" className="flex items-center justify-between group">
                                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Developer API</span>
                                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-all" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
