import ShippingPaymentPageCtrl from './shippingPaymentPage.ctrl.js';
import shippingPaymentPageService from './shippingPaymentPage.service.js';
import shippingService from './shipping.service.js';

const MODULE_NAME = 'shippingPaymentPage';

angular.module(MODULE_NAME, [])
    .controller('ShippingPaymentPageCtrl', ShippingPaymentPageCtrl)
    .service('shippingPaymentPageService', shippingPaymentPageService)
    .service('shippingService', shippingService);

export default MODULE_NAME;

