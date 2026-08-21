const ZonePopoverCtrl = /* @ngInject */ function (zoneService, popoverService, modalService, advCacheService) {
    const ctrl = this;

    ctrl.$onInit = async function () {
        await advCacheService.resetLastModified();
    };

    ctrl.handleOpenZonePopover = function () {
        modalService.stopWorking();
    };

    ctrl.handleCloseZonePopover = function () {
        modalService.startWorking();
    };

    ctrl.zoneOk = function () {
        popoverService.getPopoverScope('zonePopover').then((popoverScope) => {
            popoverScope.deactive();
        });
        zoneService.approveZone();
    };

    ctrl.zoneNo = function () {
        popoverService.getPopoverScope('zonePopover').then((popoverScope) => {
            popoverScope.deactive();
            zoneService.zoneDialogOpen();
        });
    };
};

angular.module('zone').controller('ZonePopoverCtrl', ZonePopoverCtrl);
