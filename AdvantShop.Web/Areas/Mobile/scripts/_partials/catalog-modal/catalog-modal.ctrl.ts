import {ICatalogModalOptions, ICatalogModalService} from "./catalog-modal.service";


export interface ICatalogModalCtrl {
    openModal(options?:ICatalogModalOptions): void
}

export class CatalogModalCtrl {
    /* @ngInject */
    constructor(readonly catalogModalService:ICatalogModalService) {
    }

    openModal(options:ICatalogModalOptions) {
        this.catalogModalService.openModal(options);
    }
}
