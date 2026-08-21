(function (ng) {
    

    const PartnerInfoTriggerCtrl = function (partnerInfoService) {
        const ctrl = this;

        ctrl.openByTrigger = function () {
            partnerInfoService.addEditPartner({ partnerId: ctrl.partnerId }, { onClose: ctrl.onClose });
        };
    };

    PartnerInfoTriggerCtrl.$inject = ['partnerInfoService'];

    ng.module('partnerInfo').controller('PartnerInfoTriggerCtrl', PartnerInfoTriggerCtrl);
})(window.angular);
