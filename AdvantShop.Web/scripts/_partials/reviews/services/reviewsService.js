/* @ngInject */
export const reviewsService = function (modalService) {
    // eslint-disable-next-line no-invalid-this
    const service = this;
    service.showModal = function (modalId, modalContent, reviewsCtrl, callbackOpen) {
        const _modalId = modalId != null ? modalId : 'reviewFormModal';

        modalService.renderModal(
            _modalId,
            null,
            modalContent,
            null,
            {
                closePosition: 'inside',
                modalClass: 'review-form-modal',
                destroyOnClose: true,
                callbackInit: callbackOpen,
            },
            {
                reviews: reviewsCtrl,
            },
        );

        return modalService.getModal(_modalId).then((modal) => {
            modal.modalScope.open();
        });
    };
};
