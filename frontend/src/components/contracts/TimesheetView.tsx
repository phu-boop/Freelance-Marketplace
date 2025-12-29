
import React, { useState, useEffect } from 'react';
import {
    Clock,
    Calendar,
    Plus,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface TimesheetViewProps {
    contractId: string;
    currentUser: any;
    isClient: boolean;
}

export default function TimesheetView({ contractId, currentUser, isClient }: TimesheetViewProps) {
    const [timesheets, setTimesheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [hours, setHours] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchTimesheets = async () => {
        try {
            const res = await api.get(`/contracts/${contractId}/timesheets`);
            setTimesheets(res.data);
        } catch (error) {
            console.error('Failed to fetch timesheets', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimesheets();
    }, [contractId]);

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/contracts/${contractId}/timesheets`, {
                date: selectedDate.toISOString(),
                hours: parseFloat(hours),
                description
            });
            toast.success('Time entry added');
            setIsAddModalOpen(false);
            setHours('');
            setDescription('');
            fetchTimesheets();
        } catch (error: any) {
            console.error('Failed to add time entry', error);
            toast.error(error.response?.data?.message || 'Failed to add time');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitForApproval = async (timesheetId: string) => {
        if (!confirm('Submit this timesheet for approval? You cannot edit it afterwards.')) return;
        try {
            await api.patch(`/timesheets/${timesheetId}/submit`);
            toast.success('Timesheet submitted');
            fetchTimesheets();
        } catch (error: any) {
            toast.error('Failed to submit timesheet');
        }
    };

    const handleApprove = async (timesheetId: string) => {
        if (!confirm('Approve this timesheet? Payment will be released.')) return;
        try {
            await api.patch(`/timesheets/${timesheetId}/approve`);
            toast.success('Timesheet approved');
            fetchTimesheets();
        } catch (error: any) {
            toast.error('Failed to approve timesheet');
        }
    };

    // Helper to get current week's timesheet from list
    const currentWeekTimesheet = timesheets.find(t => {
        const start = new Date(t.startDate).getTime();
        const end = new Date(t.endDate).getTime();
        const current = selectedDate.getTime();
        return current >= start && current <= end;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-500" />
                    Weekly Timesheet
                </h2>
                {!isClient && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Log Time
                    </button>
                )}
            </div>

            {/* Week Navigation (Mocked for simplicity, would manipulate selectedDate) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <p className="text-white font-bold">Current Week</p>
                    <p className="text-sm text-slate-500">{selectedDate.toLocaleDateString()}</p>
                </div>
                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Timesheet Display */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {!currentWeekTimesheet ? (
                    <div className="p-12 text-center text-slate-500">
                        No time logged for this week.
                    </div>
                ) : (
                    <div>
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentWeekTimesheet.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        currentWeekTimesheet.status === 'SUBMITTED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            'bg-slate-700 text-slate-400 border-slate-600'
                                    }`}>
                                    {currentWeekTimesheet.status}
                                </span>
                                <span className="ml-4 text-slate-400 font-bold">
                                    Total: {currentWeekTimesheet.totalHours} hrs
                                </span>
                            </div>

                            {/* Actions */}
                            {!isClient && currentWeekTimesheet.status === 'DRAFT' && (
                                <button
                                    onClick={() => handleSubmitForApproval(currentWeekTimesheet.id)}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold"
                                >
                                    Submit for Approval
                                </button>
                            )}
                            {isClient && currentWeekTimesheet.status === 'SUBMITTED' && (
                                <button
                                    onClick={() => handleApprove(currentWeekTimesheet.id)}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold"
                                >
                                    Approve & Pay
                                </button>
                            )}
                        </div>

                        <div className="divide-y divide-slate-800">
                            {currentWeekTimesheet.entries.map((entry: any) => (
                                <div key={entry.id} className="p-4 flex justify-between items-center hover:bg-slate-800/30 transition-colors">
                                    <div>
                                        <p className="text-white font-medium">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                        <p className="text-sm text-slate-500">{entry.description || 'No description'}</p>
                                    </div>
                                    <div className="font-bold text-white text-lg">
                                        {entry.hours}h
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Log Time</h3>
                        <form onSubmit={handleAddEntry} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedDate.toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Hours</label>
                                <input
                                    type="number"
                                    step="0.25"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Description</label>
                                <textarea
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 h-24"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What did you work on?"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
                                >
                                    {submitting ? 'Saving...' : 'Save Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
