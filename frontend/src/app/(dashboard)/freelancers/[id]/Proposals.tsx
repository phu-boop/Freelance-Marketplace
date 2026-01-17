"use client";

import { useEffect, useState } from 'react';
import { useKeycloak } from '@/components/KeycloakProvider';
import { toast } from 'sonner';

interface Proposal {
    id: string;
    jobId: string;
    freelancerId: string;
    clientId: string;
    message?: string;
    status: string;
    createdAt: string;
}

export default function Proposals({ freelancerId }: { freelancerId: string }) {
    const { token } = useKeycloak();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const res = await fetch(`${apiUrl}/proposals?freelancerId=${freelancerId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch proposals');
                }
                const data = await res.json();
                setProposals(data);
            } catch (e: any) {
                console.error(e);
                toast.error(e.message || 'Failed to load proposals');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchProposals();
    }, [freelancerId, token]);

    if (loading) return <div className="text-slate-400">Loading proposals...</div>;
    if (proposals.length === 0) return <div className="text-slate-400">No proposals found.</div>;

    return (
        <div className="space-y-4">
            {proposals.map((p) => (
                <div key={p.id} className="p-4 border rounded bg-slate-900/30 border-slate-700">
                    <p className="text-sm text-slate-300">Job ID: {p.jobId}</p>
                    <p className="text-sm text-slate-300">Status: {p.status}</p>
                    {p.message && <p className="text-sm text-slate-400">Message: {p.message}</p>}
                </div>
            ))}
        </div>
    );
}
