import { ILocationService } from 'angular';
import { ITabsController } from '../controllers/tabsController';

const hashStart = 'tab=';

export interface ITabsService {
    storage: Record<string, ITabsController>;
    countInStorage: number;

    addInStorage(tabs, id: string);

    change(id: string);

    findTabByid(id: string);

    getTabIdFromUrl(): string | undefined;

    changeUrl(tabId: string);
}

export class TabsService implements ITabsService {
    storage: Record<string, ITabsController> = {};
    countInStorage = -1;

    /* @ngInject */
    constructor(private readonly $location: ILocationService) {
        this.storage = {};
    }

    addInStorage(tabs, id: string) {
        this.storage[(id || (this.countInStorage += +1)).toString()] = tabs;
    }

    change(id: string) {
        const data = this.findTabByid(id);

        if (typeof data !== 'undefined') {
            data.tabs.change(data.pane);
        }
    }

    findTabByid(id: string) {
        let tabs, pane;

        for (const key of Object.keys(this.storage)) {
            tabs = this.storage[key];

            if (Object.hasOwn(this.storage, key)) {
                pane = tabs.panes[id];
                break;
            }
        }

        return typeof pane !== 'undefined' ? { tabs, pane } : undefined;
    }

    getTabIdFromUrl(): string | undefined {
        const { tab } = this.$location.search();
        if (typeof tab !== 'undefined') {
            return tab;
        }
        const hash = this.$location.hash();
        if (hash?.length > 0 && hash.startsWith(hashStart)) {
            return hash.replace(hashStart, '');
        }
        return undefined;
    }

    changeUrl(tabId: string) {
        this.$location.search('tab', tabId);
    }
}
