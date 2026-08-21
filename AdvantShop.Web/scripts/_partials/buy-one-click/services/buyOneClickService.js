import { PubSub } from '../../../_common/PubSub/PubSub.js';
/* @ngInject */
function buyOneClickService($http, $sce, modalService) {
    const service = this,
        modalId = 'modalBuyOneClick',
        isRenderDialog = false;

    service.showDialog = function (modalId) {
        modalService.open(modalId);
        PubSub.publish('buy_one_click_pre');
    };

    service.getFieldsOptions = function () {
        return $http.get('checkout/checkoutbuyinoneclickfields').then((response) => response.data);
    };

    service.getCustomerInfo = function () {
        return $http.get('checkout/checkoutbuyinoneclickcustomer').then((response) => response.data);
    };

    service.modalFooterShow = function (modalId, show) {
        modalService.setVisibleFooter(modalId, show);
    };

    service.checkout = function (
        page,
        orderType,
        offerId,
        productId,
        amount,
        attributesXml,
        name,
        email,
        phone,
        comment,
        captchaCode,
        captchaSource,
        isAgreeForPromotionalNewsletter,
    ) {
        const params = {
            page,
            orderType,
            offerId,
            productId,
            amount,
            attributesXml,
            name,
            email,
            phone,
            comment,
            captchaCode,
            captchaSource,
            isAgreeForPromotionalNewsletter,
        };

        return $http.post('checkout/checkoutbuyinoneclick', params).then((response) => {
            if (response.data.error === null || response.data.length === 0) {
                PubSub.publish('buy_one_click_confirm');
            }

            return response.data;
        });
    };
}

export default buyOneClickService;
