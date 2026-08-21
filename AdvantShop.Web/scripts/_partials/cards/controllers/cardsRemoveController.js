/* @ngInject */
function CardsRemoveCtrl(cardsService, $translate) {
    const ctrl = this;

    ctrl.remove = function (type) {
        let request;

        switch (type) {
            case 'coupon':
                request = cardsService.deleteCoupon();
                break;
            case 'certificate':
                request = cardsService.deleteCertificate();
                break;
            default:
                throw Error($translate.instant('Js.Cards.NotFoundTypeToRemove'));
        }

        request.then(() => {
            ctrl.applyFn();
        });
    };
}

export default CardsRemoveCtrl;
