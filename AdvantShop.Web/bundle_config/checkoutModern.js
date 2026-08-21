import checkoutModule from '../scripts/checkout/checkout.module.js';
import '../styles/views/checkoutModern/checkout-modern.scss';
import '../scripts/_partials/shipping/shippingModern.module.js';
import '../scripts/_partials/payment/paymentModern.module.js';

import appDependency from '../scripts/appDependency.js';

appDependency.addItem(checkoutModule);
