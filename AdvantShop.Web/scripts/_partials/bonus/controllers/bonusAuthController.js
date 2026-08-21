/* @ngInject */
function BonusAuthCtrl(toaster, bonusService, $translate) {
    const ctrl = this;

    ctrl.isCheckout = ctrl.page === 'checkout';

    ctrl.autorize = function () {
        if (ctrl.inProgress === true) {
            return;
        }

        ctrl.inProgress = true;

        bonusService.autorize(ctrl.numberCard, ctrl.phone).then((response) => {
            if (response.error != null && response.error.length > 0) {
                toaster.pop('error', $translate.instant('Js.Bonus.AuthCartError'), response.error);
            } else {
                bonusService.showModalCode(ctrl.check);
            }

            ctrl.inProgress = false;
        });
    };

    ctrl.check = function (code) {
        bonusService.checkCode(code, ctrl.isCheckout).then((bonus) => {
            if (bonus.error != null && bonus.error.length > 0) {
                toaster.pop('error', $translate.instant('Js.Bonus.SmsConfirmError'), bonus.error);
            } else {
                bonusService.successModal();
                ctrl.callbackSuccess({ bonus });
            }
        });
    };
}

export default BonusAuthCtrl;
