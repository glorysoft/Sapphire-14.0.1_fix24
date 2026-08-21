(function (ng) {
    

    const PartnerInfoCtrl = function (partnerInfoService, $window) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.scrollTop = $window.pageYOffset;

            ctrl.partnerId = ctrl.resolve.params.partnerId;

            ctrl.url =
                ctrl.partnerId != null ? `partners/popup?rnd=${  Math.random()  }&id=${  ctrl.partnerId}` : `partners/popupAdd?rnd=${  Math.random()}`;

            ctrl.isShow = true;

            partnerInfoService.setUrlParam(ctrl.partnerId);
        };

        ctrl.dismissPartnerInfo = function () {
            ctrl.isShow = false;

            ctrl.dismiss({ $value: ctrl });
        };
    };

    PartnerInfoCtrl.$inject = ['partnerInfoService', '$window'];

    ng.module('partnerInfo', []).controller('PartnerInfoCtrl', PartnerInfoCtrl);
})(window.angular);
