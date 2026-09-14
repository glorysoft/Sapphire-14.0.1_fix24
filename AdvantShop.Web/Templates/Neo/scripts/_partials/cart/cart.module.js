import cartMiniListTemplate from './templates/cart-mini.html';
import cartMiniFooterTemplate from './templates/cartMiniFooter.html';

import './styles/cart.scss';
import './styles/cart-full-product.scss';
import './styles/cart-full-summary.scss';
import './styles/cart-mini.scss';
import './styles/cart-full-controls.scss';

const MODULE_NAME = 'cart';
angular.module(MODULE_NAME)
    .run([`cartMiniTemplatesConfig`, (cartMiniTemplatesConfig) => {
        cartMiniTemplatesConfig.cartMiniListTemplate = cartMiniListTemplate
        cartMiniTemplatesConfig.cartMiniFooterTemplate = cartMiniFooterTemplate
    }]);

export default MODULE_NAME;
