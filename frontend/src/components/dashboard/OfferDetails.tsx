import React from 'react';
import { X, CheckCircle, XCircle, DollarSign, Calendar, Clock, Building, FileText } from 'lucide-react';
import { formatDistance } from 'date-fns';
import api from '@/lib/api';

interface OfferDetailsProps {
    offer: any;
    onClose: () => void;
    onUpdate?: () => void;
}

export function OfferDetails({ offer, onClose, onUpdate }: OfferDetailsProps) {
    const [isCountering, setIsCountering] = React.useState(false);
    const [counterBid, setCounterBid] = React.useState(offer?.bidAmount || '');
    const [counterTimeline, setCounterTimeline] = React.useState(offer?.timeline || '');
    const [actionLoading, setActionLoading] = React.useState(false);

    if (!offer) return null;
    const { job, status, bidAmount, timeline, coverLetter, createdAt } = offer;

    const handleAction = async (action: 'accept' | 'decline') => {
        setActionLoading(true);
        try {
            await api.post(`/proposals/${offer.id}/offer/${action}`);
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error(`Failed to ${action} offer`, error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCounter = async () => {
        setActionLoading(true);
        try {
            await api.post(`/proposals/${offer.id}/offer/counter`, {
                amount: parseFloat(counterBid),
                timeline: counterTimeline
            });
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to send counter offer', error);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                Job Offer
                            </span>
                            <span className="text-slate-400 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Received {formatDistance(new Date(offer.updatedAt), new Date(), { addSuffix: true })}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">{job.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5" />
                                {job.client_id ? 'Verified Client' : 'Client'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5" />
                                Budget: ${job.budget}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Offer Terms */}
                    <div className={`rounded-2xl p-6 border transition-all ${isCountering ? 'bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-slate-800/30 border-slate-800'}`}>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            {isCountering ? 'Propose New Terms' : 'Offer Terms'}
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <span className="text-sm text-slate-400">Agreed Rate ($)</span>
                                {isCountering ? (
                                    <input
                                        type="number"
                                        value={counterBid}
                                        onChange={(e) => setCounterBid(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                ) : (
                                    <div className="text-xl font-bold text-white flex items-center">
                                        ${bidAmount} <span className="text-sm font-normal text-slate-500 ml-1">/ fixed</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-slate-400">Timeline</span>
                                {isCountering ? (
                                    <input
                                        type="text"
                                        value={counterTimeline}
                                        onChange={(e) => setCounterTimeline(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                ) : (
                                    <div className="text-xl font-bold text-white flex items-center">
                                        {timeline}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Job Description */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Job Description</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            {job.description}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-4 justify-end">
                    {isCountering ? (
                        <>
                            <button
                                onClick={() => setIsCountering(false)}
                                className="px-6 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCounter}
                                disabled={actionLoading}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Submit Counter Offer
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsCountering(true)}
                                className="px-6 py-3 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700 hover:border-slate-600"
                            >
                                Counter Offer
                            </button>
                            <button
                                onClick={() => handleAction('decline')}
                                disabled={actionLoading}
                                className="px-6 py-3 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <XCircle className="w-5 h-5" />
                                Decline
                            </button>
                            <button
                                onClick={() => handleAction('accept')}
                                disabled={actionLoading}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <CheckCircle className="w-5 h-5" />
                                )}
                                Accept Offer
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
