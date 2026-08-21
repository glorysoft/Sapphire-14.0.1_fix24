(function (ng) {
    

    /* @ngInject */
    const BonusSystemInactiveCtrl = function ($window, SweetAlert, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.activateBonusSystem = function (bonusSystemKey, bonusSystemName) {
            SweetAlert.confirm($translate.instant('Admin.Js.BonusSystemInactive.AreYouSureWantActivate'), {
                title: bonusSystemName || $translate.instant('Admin.Js.BonusSystemInactive.BonusSystem'),
            }).then((result) => {
                if (result === true || result.value) {
                    $http.post('service/setbonussystem', { bonusSystemKey }).then((response) => {
                        if (response != null && response.data.errors != null) {
                            response.data.errors.forEach((err) => {
                                toaster.pop('error', '', err);
                            });
                        } else {
                            $window.location.reload();
                        }
                    });
                }
            });
        };

        ctrl.showPopupInactive = function () {
            SweetAlert.alert($translate.instant('Admin.Js.BonusSystemInactive.PopupInactive'), {
                title: $translate.instant('Admin.Js.BonusSystemInactive.BonusSystem'),
            });
        };
    };

    ng.module('bonusSystemInactive', []).controller('BonusSystemInactiveCtrl', BonusSystemInactiveCtrl);
})(window.angular);
