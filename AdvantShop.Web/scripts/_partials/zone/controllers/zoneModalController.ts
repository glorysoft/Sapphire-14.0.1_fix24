import { IController } from 'angular';
import { IModalService } from '../../../_common/modal/services/modalService';
import { ICacheService } from '../../../_common/cache/services/cache.service';

interface IZoneModalController extends IController {
    modalsStopWorking(): void;

    modalsStartWorking(): void;

    approveZone(): void;

    showDialogVariants(): void;
}

export default class ZoneModalController implements IZoneModalController {
    /* @ngInject */
    constructor(
        private readonly modalService: IModalService,
        private readonly zoneService: any,
        private readonly advCacheService: ICacheService,
    ) {}

    $onInit() {
        this.advCacheService.resetLastModified();
        this.modalService.getModal('zoneModalQuestion').then((modal) => {
            const originalCallbackClose = modal.modalScope.callbackClose;
            modal.modalScope.callbackClose = (...args) => {
                originalCallbackClose?.apply(modal.modalScope, args);
                this.modalsStartWorking();
            };
            modal.modalScope.open(true);
            this.modalsStopWorking();
        });
    }

    modalsStopWorking() {
        this.modalService.stopWorking();
    }

    modalsStartWorking() {
        this.modalService.startWorking();
    }

    approveZone() {
        this.modalsStartWorking();
        this.zoneService.approveZone();
    }

    showDialogVariants() {
        this.zoneService.zoneDialogOpen();
    }
}

angular.module('zone').controller('ZoneModalCtrl', ZoneModalController);
