'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ShoppingBag, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useKeycloak } from '@/components/KeycloakProvider';

const BUNDLES = [
    { id: 'small', amount: 10, price: 1.50, description: 'Quick boost for 1-2 proposals' },
    { id: 'medium', amount: 50, price: 7.00, description: 'Popular choice for active freelancers', popular: true },
    { id: 'large', amount: 100, price: 12.00, description: 'Best value for high-volume bidding' },
];

export default function ConnectsShop() {
    const { token } = useKeycloak();
    const [loading, setLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState<number | null>(null);

    const handleBuy = async (amount: number) => {
        setLoading(amount.toString());
        setSuccess(null);
        try {
            await axios.post('/api/payments/connects/buy', { amount }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(amount);
            // In a real app, trigger a global state update or refetch balance
        } catch (error) {
            console.error("Purchase failed:", error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500/20" />
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Connects Shop</h2>
                    <p className="text-slate-400 text-sm">Boost your visibility and win more jobs.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {BUNDLES.map((bundle) => (
                    <Card
                        key={bundle.id}
                        className={`relative overflow-hidden bg-slate-900 border-slate-800 transition-all hover:border-blue-500/50 group ${bundle.popular ? 'ring-2 ring-blue-500' : ''}`}
                    >
                        {bundle.popular && (
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                Best Value
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-3xl font-black text-white">{bundle.amount}</CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Connects</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white mb-2">${bundle.price.toFixed(2)}</div>
                            <p className="text-xs text-slate-500 leading-relaxed">{bundle.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-transform group-active:scale-95"
                                disabled={!!loading}
                                onClick={() => handleBuy(bundle.amount)}
                            >
                                {loading === bundle.amount.toString() ? 'Processing...' : 'Purchase Now'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {success && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-400 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Successfully added {success} connects to your wallet!</span>
                </div>
            )}
        </div>
    );
}
