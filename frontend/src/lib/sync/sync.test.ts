
import { SyncManager } from './SyncManager';
import { LocalStore } from './LocalStore';
import api from '../api';

// Mock localStorage
const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        })
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock API
jest.mock('../api', () => ({
    get: jest.fn(),
    patch: jest.fn()
}));

describe('SyncManager', () => {
    let syncManager: SyncManager;
    let localStore: LocalStore;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
        syncManager = SyncManager.getInstance();
        localStore = new LocalStore();
    });

    it('should pull updates and save to local store', async () => {
        const mockResponse = {
            data: {
                upserted: { jobs: [{ id: '1', title: 'New Job' }] },
                deleted: { jobs: [] },
                newSince: '2023-01-01T12:00:00Z'
            }
        };
        (api.get as jest.Mock).mockResolvedValue(mockResponse);

        await syncManager.pull('jobs', '/api/jobs/sync');

        expect(api.get).toHaveBeenCalledWith('/api/jobs/sync', { params: { since: expect.any(String) } });
        expect(localStorageMock.setItem).toHaveBeenCalled();

        const items = localStore.getItems('jobs');
        expect(items['1']).toBeDefined();
        expect(items['1'].title).toBe('New Job');
        expect(localStore.getLastSyncTime('jobs')).toBe('2023-01-01T12:00:00Z');
    });

    it('should handle push and update local store', async () => {
        const mockData = { id: '1', title: 'Updated Job' };
        const mockResponse = { data: { ...mockData, version: 2 } };
        (api.patch as jest.Mock).mockResolvedValue(mockResponse);

        await syncManager.push('jobs', '1', mockData, 1);

        expect(api.patch).toHaveBeenCalledWith('/api/jobs/1', { ...mockData, baseVersion: 1 });

        const items = localStore.getItems('jobs');
        expect(items['1']).toBeDefined();
        expect(items['1'].version).toBe(2);
    });
});
