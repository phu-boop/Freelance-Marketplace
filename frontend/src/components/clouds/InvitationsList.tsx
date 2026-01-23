import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Cloud, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Invitation {
    id: string;
    cloud: {
        name: string;
        ownerId: string;
    };
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
}

export function InvitationsList() {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();

    const fetchInvitations = async () => {
        try {
            const res = await api.get('/clouds/invitations/my');
            setInvitations(res.data);
        } catch (error) {
            console.error('Failed to fetch invitations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    const handleAccept = async (id: string) => {
        setProcessingId(id);
        try {
            await api.post(`/clouds/invitations/${id}/accept`);
            toast.success('Invitation accepted!');
            // Refresh invites and potentially refresh parent or redirect
            fetchInvitations();
            router.refresh();
        } catch (error: any) {
            console.error('Failed to accept invitation', error);
            toast.error(error.response?.data?.message || 'Failed to accept invitation');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return null; // Or skeleton
    if (invitations.length === 0) return null;

    return (
        <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Pending Invitations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invitations.map((invite) => (
                    <Card key={invite.id} className="bg-slate-900 border-slate-800 border-l-4 border-l-blue-500">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <Cloud className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{invite.cloud.name}</h3>
                                        <p className="text-xs text-slate-400">Invited to join as a Member</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                    Pending
                                </Badge>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                                    onClick={() => handleAccept(invite.id)}
                                    disabled={!!processingId}
                                >
                                    {processingId === invite.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                    )}
                                    Accept
                                </Button>
                                {/* Implement Reject later if API supports it */}
                                {/* <Button variant="outline" className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Decline
                                </Button> */}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
