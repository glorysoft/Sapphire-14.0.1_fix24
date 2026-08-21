import flatpickrModule from '../../vendors/flatpickr/flatpickr.module.js';
import '../../styles/partials/bonus-card.scss';
import '../../styles/partials/order-history-products.scss';
import '../../styles/views/checkout.scss';

import bonusModule from '../_partials/bonus/bonus.module.js';
import addressModule from '../_partials/address/address.module.js';
import buyOneClickModule from '../_partials/buy-one-click/buyOneClick.module.js';
import paymentModule from '../_partials/payment/payment.module.js';
import shippingModule from '../_partials/shipping/shipping.module.js';
import cardsModule from '../_partials/cards/cards.module.js';
import yandexMaps from '../_common/yandexMaps/yandexMaps.module.js';
import cartModule from '../../scripts/_partials/cart/cart.module.js';
import warehousesModule from '../../scripts/warehouses/warehouses.module.js';

import rangeSliderModule from '../../vendors/rangeSlider/rangeSlider.module.js';

import checkoutCtrl from './controllers/checkoutController.js';
import checkoutService from './services/checkoutService.js';
import ngFileUploadModule from '../../node_modules/ng-file-upload/index.js';
import quickviewModule from '../_partials/quickview/quickview.module.ts';
import productViewModule from '../_partials/product-view/productView.module.js';
import phoneConfirmationModule from '../user/confirmations/phone/phoneConfirmation.ts';
import geoModeUtilsModule from '../_common/geoMode/geoMode.utils.ts';
import emailConfirmationModule from '../user/confirmations/email/emailConfirmation.ts';

const moduleName = 'checkout';

angular
    .module(moduleName, [
        flatpickrModule,
        bonusModule,
        addressModule,
        buyOneClickModule,
        paymentModule,
        shippingModule,
        cardsModule,
        yandexMaps,
        cartModule,
        rangeSliderModule,
        warehousesModule,
        ngFileUploadModule,
        quickviewModule,
        productViewModule,
        phoneConfirmationModule,
        geoModeUtilsModule,
        emailConfirmationModule,
    ])
    .service('checkoutService', checkoutService)
    .controller('CheckOutCtrl', checkoutCtrl);

export default moduleName;
