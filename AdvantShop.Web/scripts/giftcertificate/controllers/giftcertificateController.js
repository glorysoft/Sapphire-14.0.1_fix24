/* @ngInject */
function GiftCertificateCtrl(giftcertificateService, $document, $translate, toaster) {
    const ctrl = this;

    ctrl.send = function () {
        let result = true;

        if (typeof ctrl.agreement != 'undefined' && !ctrl.agreement) {
            toaster.pop('error', $translate.instant('Js.Subscribe.ErrorAgreement'));
            result = false;
        }

        return result;
    };

    ctrl.paymentMethodChange = function (id) {
        const el = $document[0].getElementById('PaymentMethod');
        el.value = id;
    };

    ctrl.previewModal = giftcertificateService.dialogOpen;
}

export default GiftCertificateCtrl;
