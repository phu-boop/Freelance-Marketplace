import api from '../api';
import { LocalStore } from './LocalStore';

export class SyncManager {
    private static instance: SyncManager;
    private localStore: LocalStore;

    private constructor() {
        this.localStore = new LocalStore();
    }

    public static getInstance(): SyncManager {
        if (!SyncManager.instance) {
            SyncManager.instance = new SyncManager();
        }
        return SyncManager.instance;
    }

    /**
     * Pulls updates from the server for a specific resource.
     * @param resource The resource name (e.g., 'users', 'jobs')
     */
    async pull(resource: string, endpoint: string): Promise<void> {
        const lastSync = this.localStore.getLastSyncTime(resource);
        console.log(`[SyncManager] Pulling ${resource} updates since ${lastSync}`);

        try {
            const response = await api.get(endpoint, {
                params: { since: lastSync }
            });

            const { upserted, deleted, newSince } = response.data;

            // Handle Upserts
            const upsertedItems = upserted[resource] || [];
            if (upsertedItems.length > 0) {
                console.log(`[SyncManager] Upserting ${upsertedItems.length} items for ${resource}`);
                this.localStore.saveItems(resource, upsertedItems);
            }

            // Handle Deletes
            const deletedIds = deleted[resource] || [];
            if (deletedIds.length > 0) {
                console.log(`[SyncManager] Deleting ${deletedIds.length} items for ${resource}`);
                this.localStore.deleteItems(resource, deletedIds);
            }

            // Update Sync Time
            this.localStore.setLastSyncTime(resource, newSince);
            console.log(`[SyncManager] Pull complete. New sync time: ${newSince}`);

        } catch (error) {
            console.error(`[SyncManager] Pull failed for ${resource}:`, error);
            throw error;
        }
    }

    /**
     * Pushes a local update to the server.
     * Uses versioning to detect conflicts.
     */
    async push(resource: string, id: string, data: any, baseVersion: number, endpointPrefix: string = '/api'): Promise<any> {
        console.log(`[SyncManager] Pushing update for ${resource}:${id} with baseVersion ${baseVersion}`);

        try {
            const response = await api.patch(`${endpointPrefix}/${resource}/${id}`, {
                ...data,
                baseVersion
            });
            console.log(`[SyncManager] Push successful for ${resource}:${id}`);

            // Update local store with the server's response (which typically contains the new version)
            this.localStore.saveItems(resource, [response.data]);
            return response.data;

        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                console.warn(`[SyncManager] Conflict detected for ${resource}:${id}`);
                return this.handleConflict(resource, id, data, baseVersion);
            }
            console.error(`[SyncManager] Push failed for ${resource}:${id}`, error);
            throw error;
        }
    }

    private async handleConflict(resource: string, id: string, localData: any, baseVersion: number): Promise<any> {
        // Strategy: Server Authority (Last Write Wins from Server perspective, but we notify client)
        // 1. Pull latest version from server
        // 2. Notify UI/User that data has changed (In this reference impl, we just update local cache)

        console.log('[SyncManager] Handling conflict: Fetching latest version from server...');
        // Force a pull to update local state
        // Note: In a real app, you might want to fetch just this one item
        // For simplicity, we assume the push failure returns the latest version or we just pull everything

        // Let's assume we re-pull everything for now to be safe
        // In a refined implementation, we would GET /api/resource/id

        // Simulating "Server Wins" by abandoning local change and throwing an error for the UI to handle
        throw new Error('Conflict detected. Please refresh data.');
    }
}
