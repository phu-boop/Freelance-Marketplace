import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    cloudId: string;
    cloudName: string;
}

export function InviteMemberModal({ isOpen, onClose, cloudId, cloudName }: InviteMemberModalProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await api.post(`/clouds/${cloudId}/invite`, { email });
            setSuccess(true);
            toast.success(`Invitation sent to ${email}`);
            setTimeout(() => {
                setSuccess(false);
                setEmail('');
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error('Failed to invite member', error);
            toast.error(error.response?.data?.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>Invite Talent to {cloudName}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Enter the email address of the freelancer you want to invite to this Private Cloud.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Invitation Sent!</h3>
                        <p className="text-slate-400">We've sent an email to {email} with instructions to join.</p>
                    </div>
                ) : (
                    <form onSubmit={handleInvite} className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="freelancer@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-slate-900 border-slate-800 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-between gap-4">
                            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-slate-800 text-slate-300">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !email}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white w-full sm:w-auto"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Invitation
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
