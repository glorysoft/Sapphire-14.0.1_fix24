/* @ngInject */
function CardsFormCtrl(cardsService, toaster, $translate) {
    const ctrl = this;

    ctrl.apply = function (code) {
        if (code != null && code.length > 0) {
            cardsService.apply(code).then((data) => {
                if (data.result === true && data.msg == null) {
                    ctrl.applyFn();
                } else {
                    ctrl.applyFn();
                    toaster.pop('error', $translate.instant('Js.Cards.CantApplyCoupon'), data.msg);
                }
            });
        }
    };
}

export default CardsFormCtrl;
