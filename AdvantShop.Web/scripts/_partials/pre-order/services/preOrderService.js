/* @ngInject */
function preOrderService($http, $sce, modalService, toaster) {
    const service = this,
        isRenderDialog = false;

    service.showDialog = function (modalId) {
        modalService.open(modalId);
    };

    service.renderProductViewPreorder = function (modalId, {modalOptions, preorderOptions}) {
        if (modalService.hasModal(modalId)) {
            modalService.getModal(modalId).then((modal) => {
                modal.modalScope.open();
            });
        }

        const content = `<div data-pre-order-form
            data-form-init="modalData.formInit(form)"
            data-success-fn="modalData.successFn(result)"
            data-offer-id="modalData.offerId"
            data-product-id="modalData.productId"
            data-amount="modalData.amount">
        </div>`;

        let form = null;

        const modalData = {
            offerId: preorderOptions.offerId ?? '',
            productId: preorderOptions.productId ?? '',
            amount: preorderOptions.amount ?? '',
            formInit (formCtrl) {
                form = formCtrl;
                if (preorderOptions.formInit != null) {
                    preorderOptions.formInit(formCtrl);
                }
            },
            successFn (result) {
                if (preorderOptions.successFn != null) {
                    preorderOptions.successFn(result);
                } else {
                    service.successFn(result, modalId);
                }
            },
            callbackClose (modalScope) {
                if (modalOptions.callbackClose != null) {
                    modalOptions.callbackClose(modalScope);
                } else {
                    service.modalCallbackClose(form);
                }
            },
        };

        modalService.renderModal(
            modalId,
            modalOptions.header ?? null,
            content,
            null,
            {
                modalClass: 'pre-order-dialog',
                callbackClose: 'modalData.callbackClose(modalScope)',
                destroyOnClose: modalOptions.destroyOnClose,
            },
            { modalData },
        );

        return modalService.getModal(modalId).then((modal) => {
            modal.modalScope.open();
        });
    };

    service.successFn = function (result, modalId) {
        if (result) {
            window.location = result;
        } else {
            service.modalFooterShow(modalId, false);
        }
    };

    service.modalCallbackClose = function (form) {
        if (form != null && form.result != null && form.showRedirectButton === true) {
            window.location = form.result.url;
        }

        if (form != null && form.success === true) {
            form.reset();
        }
    };

    service.getFormData = function () {
        return $http.get('checkout/getpreorderformdata').then((response) => response.data);
    };

    service.modalFooterShow = function (modalId, show) {
        modalService.setVisibleFooter(modalId, show);
    };

    service.send = function (data) {
        return $http.post('checkout/checkoutpreorder', data).then((response) => response.data);
    };
}

export default preOrderService;
