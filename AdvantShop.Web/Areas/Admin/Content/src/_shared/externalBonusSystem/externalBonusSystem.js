(function (ng) {
    

    /* @ngInject */
    const ExternalBonusSystemCtrl = function ($window, SweetAlert, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.createCard = function (customerId, reloadPage) {
            SweetAlert.confirm($translate.instant('Admin.Js.ExternalBonusSystem.AreYouSureWantCreateCard'), {
                title: $translate.instant('Admin.Js.ExternalBonusSystem.BonusSystem'),
            }).then((result) => {
                if (result === true || result.value) {
                    $http.post('externalbonus/addcard', { customerId }).then((response) => {
                        const data = response.data;
                        if (data.errors != null) {
                            data.errors.forEach((err) => {
                                toaster.pop('error', '', err);
                            });
                        } else if (data.result === true) {
                                if (reloadPage) {
                                    $window.location.reload();
                                }
                            } else {
                                toaster.pop('error', $translate.instant('Admin.Js.ExternalBonusSystem.IsNotCreateCard'));
                            }
                    });
                }
            });
        };
    };

    ng.module('externalBonusSystem', []).controller('ExternalBonusSystemCtrl', ExternalBonusSystemCtrl);
})(window.angular);
