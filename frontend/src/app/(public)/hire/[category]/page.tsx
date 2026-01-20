import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';
import { Metadata } from 'next';

type Props = {
    params: { category: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const categoryName = decodeURIComponent(params.category).replace(/-/g, ' ');
    const title = `Hire Top ${categoryName} Freelancers | Premium Marketplace`;
    const description = `Find and hire the best ${categoryName} experts. Vetted talent, secure payments, and AI-powered matching.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
    };
}

export default function HireCategoryPage({ params }: Props) {
    const category = decodeURIComponent(params.category).replace(/-/g, ' ');

    // Mock Top Talent (in reality, fetch via SSG or SSR)
    const topTalent = [
        { name: "Alex R.", title: `Senior ${category} Expert`, rating: 5.0, rate: "$85/hr", jobs: 142 },
        { name: "Sarah K.", title: `Lead ${category} Specialist`, rating: 4.9, rate: "$95/hr", jobs: 89 },
        { name: "David M.", title: `${category} Consultant`, rating: 4.9, rate: "$120/hr", jobs: 56 },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
            {/* Hero Section */}
            <section className="container mx-auto px-4 text-center mb-20">
                <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text capitalize">
                    Hire the Best <br /> {category} Talent
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                    Access a curated network of elite {category} professionals.
                    Vetted for quality, reliability, and expertise.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/signup" className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2">
                        Get Started <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/how-it-works" className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all">
                        How it Works
                    </Link>
                </div>
            </section>

            {/* Value Props */}
            <section className="container mx-auto px-4 mb-24 grid md:grid-cols-3 gap-8">
                <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Vetted Professionals</h3>
                    <p className="text-slate-400">Every freelancer is screened for technical skills and communication.</p>
                </div>
                <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-6">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Fast Hiring</h3>
                    <p className="text-slate-400">Average time to hire for {category} roles is under 48 hours.</p>
                </div>
                <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                        <Star className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Satisfaction Guaranteed</h3>
                    <p className="text-slate-400">If you're not satisfied with the work, our escrow protection has you covered.</p>
                </div>
            </section>

            {/* Featured Talent */}
            <section className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold">Featured {category} Experts</h2>
                    <Link href="/freelancers" className="text-blue-400 font-bold hover:text-blue-300">View All</Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {topTalent.map((talent, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all cursor-pointer group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold">
                                    {talent.name.charAt(0)}
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg text-xs font-bold">
                                    <Star className="w-3 h-3 fill-yellow-500" />
                                    {talent.rating}
                                </div>
                            </div>
                            <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{talent.name}</h3>
                            <p className="text-slate-400 text-sm mb-4">{talent.title}</p>
                            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
                                <span className="font-mono font-bold text-white">{talent.rate}</span>
                                <span className="text-slate-500">{talent.jobs} jobs done</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
