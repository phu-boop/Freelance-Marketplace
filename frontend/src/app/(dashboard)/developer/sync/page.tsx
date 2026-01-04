"use client";

import React, { useState, useEffect } from 'react';
import { SyncManager } from '@/lib/sync/SyncManager';
import { LocalStore } from '@/lib/sync/LocalStore';

export default function SyncTestPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [localData, setLocalData] = useState<any>({});
    const syncManager = SyncManager.getInstance();
    const localStore = new LocalStore();

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
        console.log(msg);
    };

    const refreshLocalData = () => {
        setLocalData({
            jobs: localStore.getItems('jobs'),
            users: localStore.getItems('users'),
            lastSyncJobs: localStore.getLastSyncTime('jobs'),
            lastSyncUsers: localStore.getLastSyncTime('users'),
        });
    };

    useEffect(() => {
        refreshLocalData();
    }, []);

    const handlePullJobs = async () => {
        addLog('Pulling Jobs...');
        try {
            await syncManager.pull('jobs', '/api/jobs/sync');
            addLog('Jobs Pull Success');
        } catch (e: any) {
            addLog(`Jobs Pull Failed: ${e.message}`);
        }
        refreshLocalData();
    };

    const handlePullUsers = async () => {
        addLog('Pulling Users...');
        try {
            await syncManager.pull('users', '/api/users/sync');
            addLog('Users Pull Success');
        } catch (e: any) {
            addLog(`Users Pull Failed: ${e.message}`);
        }
        refreshLocalData();
    };

    const handleReset = () => {
        localStorage.clear();
        addLog('Local Storage Cleared');
        refreshLocalData();
    };

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Sync Client Verification</h1>

            <div className="flex gap-4">
                <button
                    onClick={handlePullJobs}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Pull Jobs
                </button>
                <button
                    onClick={handlePullUsers}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Pull Users
                </button>
                <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Reset Local Store
                </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="border p-4 rounded bg-gray-50">
                    <h2 className="font-semibold mb-2">Local Store State</h2>
                    <pre className="text-xs overflow-auto h-64">
                        {JSON.stringify(localData, null, 2)}
                    </pre>
                </div>
                <div className="border p-4 rounded bg-gray-50">
                    <h2 className="font-semibold mb-2">Logs</h2>
                    <div className="text-xs font-mono h-64 overflow-auto">
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
