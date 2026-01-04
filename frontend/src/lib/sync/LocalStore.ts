export class LocalStore {
    private prefix: string;

    constructor(prefix: string = 'app_sync_') {
        this.prefix = prefix;
    }

    private getKey(resource: string): string {
        return `${this.prefix}${resource}`;
    }

    getLastSyncTime(resource: string): string {
        return localStorage.getItem(`${this.prefix}${resource}_last_sync`) || new Date(0).toISOString();
    }

    setLastSyncTime(resource: string, time: string): void {
        localStorage.setItem(`${this.prefix}${resource}_last_sync`, time);
    }

    getItems(resource: string): Record<string, any> {
        const data = localStorage.getItem(this.getKey(resource));
        return data ? JSON.parse(data) : {};
    }

    saveItems(resource: string, items: any[]): void {
        const currentData = this.getItems(resource);
        items.forEach(item => {
            currentData[item.id || item._id] = item;
        });
        localStorage.setItem(this.getKey(resource), JSON.stringify(currentData));
    }

    deleteItems(resource: string, ids: string[]): void {
        const currentData = this.getItems(resource);
        ids.forEach(id => {
            delete currentData[id];
        });
        localStorage.setItem(this.getKey(resource), JSON.stringify(currentData));
    }

    getItem(resource: string, id: string): any {
        const currentData = this.getItems(resource);
        return currentData[id];
    }
}
