import {
    type IStickyElementStorage,
    type IStickyElementStorageManager,
    type StickyElementPositionName,
} from '../stickyElement.types';
import {StickyElementStorage} from "./stickyElementStorage";

export class StickyElementStorageManager implements IStickyElementStorageManager {
    private storagesMap = new Map<StickyElementPositionName, IStickyElementStorage>();

    constructor() {
        this.storagesMap.set('top', new StickyElementStorage());
        this.storagesMap.set('bottom', new StickyElementStorage());
    }
    get(position: StickyElementPositionName) {
        const storage =  this.storagesMap.get(position);

        if(typeof storage === 'undefined') {
            throw new Error(`stickyElement: not found storage  by position "${position}"`);
        }

        return storage;
    }

    getAll(): [StickyElementPositionName, IStickyElementStorage][]{
        return Array.from(this.storagesMap.entries());
    }
}
