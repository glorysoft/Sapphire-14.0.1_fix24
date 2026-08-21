import { PubSub } from '../../../_common/PubSub/PubSub.js';
import orderReviewTemplate from '../templates/review.html';
/* @ngInject */
export default function OrderReviewCtrl(orderService, modalService, toaster, $translate) {
    const ctrl = this;

    ctrl.showModal = () => {
        ctrl.modalId = `modalOrderReview_${ctrl.orderNumber}`;

        orderService.getOrderReview(ctrl.orderNumber).then((result) => {
            if (result) {
                ctrl.review = result;
            }

            ctrl.readonly = !ctrl.review || ctrl.review.Readonly;

            modalService.renderModal(
                ctrl.modalId,
                `<div class="row">
                    <div class="col-xs-11">
                        Заказ №${ctrl.orderNumber}
                    </div>
                </div>`,
                `<div data-ng-include="'${orderReviewTemplate}'"></div>`,
                null,
                {
                    destroyOnClose: true,
                    callbackClose: 'ctrl.modalClose',
                    modalClass: 'adv-review-modal',
                },
                {
                    ctrl,
                },
            );

            modalService.getModal(ctrl.modalId).then((modal) => {
                modal.modalScope.open();
            });
        });
    };

    ctrl.modalClose = () => {
        modalService.destroy(ctrl.modalId);
    };

    ctrl.addReview = () => {
        if (ctrl.review.Ratio === 0 && !ctrl.review.Text) {
            toaster.pop('error', '', $translate.instant('Js.Order.ReviewIsEmpty'));
            return;
        }

        orderService.addOrderReview(ctrl.orderNumber, ctrl.review.Ratio, ctrl.review.Text).then((data) => {
            if (data.result)
                modalService.getModal(ctrl.modalId).then((modal) => {
                    ctrl.review.Readonly = true;
                    PubSub.publish('orderReview.add', {
                        review: ctrl.review,
                    });
                    modal.modalScope.close();
                });
            else if (data.errors !== undefined && data.errors !== null) {
                //modalService.destroy(ctrl.modalId);
                data.errors.forEach((err) => {
                    toaster.pop('error', '', err);
                });
            }
        });
    };
}
