'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
    enableSorting?: boolean;
}

interface DataGridProps<T> {
    columns: Column<T>[];
    data: T[];
    pageSize?: number;
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
}

export default function DataGrid<T extends { id: string | number }>({
    columns,
    data,
    pageSize = 10,
    onRowClick,
    isLoading = false
}: DataGridProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: keyof T, direction: 'asc' | 'desc' } | null>(null);

    // Sorting Logic
    const sortedData = React.useMemo(() => {
        if (!sortConfig) return data;
        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    // Pagination Logic
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const currentData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSort = (key: keyof T) => {
        setSortConfig(current => {
            if (!current || current.key !== key) return { key, direction: 'asc' };
            if (current.direction === 'asc') return { key, direction: 'desc' };
            return null;
        });
    };

    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-500 text-sm font-medium">Loading data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className={`px-6 py-4 whitespace-nowrap transition-colors ${col.enableSorting ? 'cursor-pointer hover:text-white hover:bg-slate-800' : ''}`}
                                        onClick={() => col.enableSorting && handleSort(col.accessorKey)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.header}
                                            {col.enableSorting && (
                                                <div className="flex flex-col">
                                                    {sortConfig?.key === col.accessorKey ? (
                                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-400" /> : <ChevronDown className="w-3 h-3 text-indigo-400" />
                                                    ) : (
                                                        <ChevronsUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-500" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {currentData.length > 0 ? (
                                currentData.map((row) => (
                                    <tr
                                        key={row.id}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        className={`transition-all hover:bg-slate-800/40 group ${onRowClick ? 'cursor-pointer' : ''}`}
                                    >
                                        {columns.map((col, idx) => (
                                            <td key={idx} className="px-6 py-4 text-slate-300">
                                                {col.cell ? col.cell(row) : (row[col.accessorKey] as React.ReactNode)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">
                                        No matching records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-xs text-slate-500 font-medium">
                        Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
