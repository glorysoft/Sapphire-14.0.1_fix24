(function (ng) {
    

    /* @ngInject */
    const ModalSubtractBonusCtrl = function ($uibModalInstance, $http, $window, toaster, $q, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.cardId = params != null && params.cardId != null ? params.cardId : null;
            ctrl.SendSms = params != null && params.sendSms != undefined ? params.sendSms : true;

            $http.get(`cards/getBonuses?cardId=${  ctrl.cardId}`).then(
                (result) => {
                    ctrl.additionBonuses = result.data.obj;
                },
                (err) => {
                    toaster.pop('error', '', $translate.instant('Admin.Js.AdditionBonus.ErrorGettingBonuses') + err);
                },
            );
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.subctractBonus = function () {
            $http
                .post('cards/subtractBonus', {
                    cardId: ctrl.cardId,
                    amount: ctrl.amount,
                    reason: ctrl.reason,
                    additionId: ctrl.additionId,
                    sendsms: ctrl.SendSms,
                })
                .then((result) => {
                    const data = result.data;
                    if (data.result === true) {
                        $window.location.assign(`cards/edit/${  ctrl.cardId}`);
                        toaster.pop('success', '', $translate.instant('Admin.Js.AdditionBonus.BonusesAreWrittenOff'));
                    } else {
                        ctrl.btnLoading = false;
                        if (data.errors && data.errors.length) {
                            data.errors.forEach((error) => {
                                toaster.pop('error', error);
                            });
                        } else {
                            toaster.pop('error', '', $translate.instant('Admin.Js.MainBonus.ErrorWritingOffBonuses'));
                        }
                    }
                })
                .catch(() => {
                    toaster.pop('error', '', $translate.instant('Admin.Js.MainBonus.ErrorWritingOffBonuses'));
                });
        };

        ctrl.onChangeSwitch = function (checked) {
            ctrl.SendSms = checked;
        };
    };

    ng.module('uiModal').controller('ModalSubtractBonusCtrl', ModalSubtractBonusCtrl);
})(window.angular);
