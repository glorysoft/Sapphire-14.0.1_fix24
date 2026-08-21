import type { IStickyElementStorage, IStickyElementStoragePoint, StickyElementStorageKey } from '../stickyElement.types';
import { StickyElementStoragePoint } from './stickyElementStoragePoint';

export class StickyElementStorage implements IStickyElementStorage {
    private storage: Map<StickyElementStorageKey, IStickyElementStoragePoint>;
    constructor() {
        this.storage = new Map();
    }

    set(key: StickyElementStorageKey, value: IStickyElementStoragePoint) {
        this.storage.set(key, value);
    }

    get(key: StickyElementStorageKey) {
        return this.storage.get(key);
    }

    has(key: StickyElementStorageKey) {
        const item = this.get(key);
        return typeof item !== 'undefined';
    }

    entries() {
        return this.storage.entries();
    }

    size(){
        return this.storage.size;
    }

    createStoragePoint() {
        return new StickyElementStoragePoint();
    }
}
