'use client';

import React, { useState, useEffect } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Save, Loader2, Info } from 'lucide-react';
import api from '@/lib/api';

interface AvailabilityCalendarProps {
    userId: string;
}

interface AvailabilityItem {
    id?: string;
    date: Date | string;
    isBusy: boolean;
    note?: string;
}

export default function AvailabilityCalendar({ userId }: AvailabilityCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<AvailabilityItem[]>([]);

    useEffect(() => {
        fetchAvailability();
    }, [userId]);

    const fetchAvailability = async () => {
        try {
            const response = await api.get(`/users/${userId}/availability`);
            setAvailability(response.data);
        } catch (error) {
            console.error('Failed to fetch availability', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (day: Date) => {
        const existing = availability.find(item => isSameDay(new Date(item.date), day));
        const pending = pendingChanges.find(item => isSameDay(new Date(item.date), day));

        const isBusy = pending ? !pending.isBusy : (existing ? !existing.isBusy : true);

        const newChange: AvailabilityItem = {
            date: day.toISOString(),
            isBusy
        };

        setPendingChanges(prev => {
            const filtered = prev.filter(item => !isSameDay(new Date(item.date), day));
            return [...filtered, newChange];
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post(`/users/${userId}/availability`, { items: pendingChanges });
            await fetchAvailability();
            setPendingChanges([]);
        } catch (error) {
            console.error('Failed to save availability', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-4 py-4 bg-slate-800/50 rounded-t-2xl border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
                        <p className="text-xs text-slate-400">Mark dates when you are busy</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    {pendingChanges.length > 0 && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes ({pendingChanges.length})
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/30">
                {days.map((day, i) => (
                    <div key={i} className="py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="grid grid-cols-7 bg-slate-900/10">
                {calendarDays.map((day, i) => {
                    const existing = availability.find(item => isSameDay(new Date(item.date), day));
                    const pending = pendingChanges.find(item => isSameDay(new Date(item.date), day));

                    const isBusy = pending ? pending.isBusy : (existing ? existing.isBusy : false);
                    const isSelected = pending !== undefined;
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const today = isToday(day);

                    return (
                        <div
                            key={i}
                            onClick={() => handleDateClick(day)}
                            className={`relative h-24 p-2 border-r border-b border-slate-800 cursor-pointer transition-all group overflow-hidden ${!isCurrentMonth ? 'bg-slate-950/20' : 'bg-transparent'
                                } hover:bg-slate-800/40`}
                        >
                            <span className={`text-sm font-medium ${!isCurrentMonth ? 'text-slate-700' : today ? 'text-blue-400 font-bold underline underline-offset-4' : 'text-slate-400'
                                }`}>
                                {format(day, 'd')}
                            </span>

                            {isBusy && (
                                <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 ${isSelected ? 'bg-orange-500/10' : 'bg-red-500/5'
                                    }`}>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${isSelected ? 'bg-orange-500 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}>
                                        Busy
                                    </div>
                                    {existing?.note && (
                                        <div className="text-[10px] text-slate-500 px-2 text-center line-clamp-2">
                                            {existing.note}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isSelected && !isBusy && (
                                <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                                    <div className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-tighter">
                                        Available
                                    </div>
                                </div>
                            )}

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-1 bg-slate-800 rounded-md border border-slate-700 shadow-xl">
                                    <Info className="w-3 h-3 text-slate-500" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center bg-slate-900/50 border border-slate-800 rounded-2xl gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-slate-400 animate-pulse">Loading your schedule...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </div>

            <div className="flex items-center gap-6 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
                    <span className="text-xs text-slate-400">Marked as Busy</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500" />
                    <span className="text-xs text-slate-400">Pending Busy Change</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span className="text-xs text-slate-400">Pending Available Change</span>
                </div>
                <div className="ml-auto text-xs text-slate-500 flex items-center gap-2">
                    <span className="text-blue-400 underline">15</span>
                    <span>Current Day</span>
                </div>
            </div>
        </div>
    );
}
