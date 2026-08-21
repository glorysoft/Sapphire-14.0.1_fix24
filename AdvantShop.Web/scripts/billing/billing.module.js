import BillingCtrl from './controllers/billingController.js';

import orderModule from '../_partials/order/order.module.js';

const moduleName = 'billing';

angular.module(moduleName, [orderModule]).controller('BillingCtrl', BillingCtrl);

export default moduleName;
