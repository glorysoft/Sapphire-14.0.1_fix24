(function (ng) {
    

    const LeadInfoTriggerCtrl = function (leadInfoService) {
        const ctrl = this;

        ctrl.openByTrigger = function () {
            leadInfoService.addInstance({ leadId: ctrl.leadId }, { onClose: ctrl.onClose });
        };
    };

    LeadInfoTriggerCtrl.$inject = ['leadInfoService'];

    ng.module('leadInfo').controller('LeadInfoTriggerCtrl', LeadInfoTriggerCtrl);
})(window.angular);
