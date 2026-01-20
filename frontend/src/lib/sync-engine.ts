import Dexie, { Table } from 'dexie';

// Define DB
export interface OfflineMutation {
    id?: number;
    url: string;
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body: any;
    timestamp: number;
    retryCount: number;
}

class SyncDatabase extends Dexie {
    mutations!: Table<OfflineMutation>;

    constructor() {
        super('FreelanceSyncDB');
        this.version(1).stores({
            mutations: '++id, timestamp' // Primary key and index
        });
    }
}

export const db = new SyncDatabase();

// Sync Engine
export class SyncEngine {
    static async queueMutation(url: string, method: 'POST' | 'PUT' | 'DELETE' | 'PATCH', body: any) {
        await db.mutations.add({
            url,
            method,
            body,
            timestamp: Date.now(),
            retryCount: 0
        });
        console.log(`[Sync] Queued ${method} ${url}`);

        // Try to sync immediately if online
        if (navigator.onLine) {
            this.processQueue();
        }
    }

    static async processQueue() {
        if (!navigator.onLine) return;

        const mutations = await db.mutations.orderBy('timestamp').toArray();
        if (mutations.length === 0) return;

        console.log(`[Sync] Processing ${mutations.length} mutations...`);

        for (const mutation of mutations) {
            try {
                await this.performRequest(mutation);
                await db.mutations.delete(mutation.id!);
                console.log(`[Sync] Synced ${mutation.url}`);
            } catch (error) {
                console.error(`[Sync] Failed ${mutation.url}`, error);
                // Exponential backoff logic could go here
                // For now, if 4xx error (client side), we delete to avoid blocking.
                // If 5xx or network, we keep it.
                // Simple logic: increment retry, if > 5 delete
                if (mutation.retryCount > 5) {
                    await db.mutations.delete(mutation.id!);
                } else {
                    await db.mutations.update(mutation.id!, { retryCount: mutation.retryCount + 1 });
                }
            }
        }
    }

    static async performRequest(mutation: OfflineMutation) {
        // We assume 'api' instance is available or we use fetch with auth headers
        // For this engine, we use standard fetch for simplicity, assuming headers are managed or token is in localStorage
        const token = localStorage.getItem('token'); // Simplification
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + mutation.url, {
            method: mutation.method,
            headers,
            body: JSON.stringify(mutation.body)
        });

        if (!res.ok) {
            throw new Error(`Sync failed: ${res.statusText}`);
        }
    }
}

// Global Listener
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => SyncEngine.processQueue());
}
