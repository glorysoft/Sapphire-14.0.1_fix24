import cartMobileFullTemplate from './templates/cart-mobile-full.html';
import cartMiniListTemplate from '../../../../../scripts/_partials/cart/templates/cart-mini.html';
import cartMiniFooterTemplate from '../../../../../scripts/_partials/cart/templates/cartMiniFooter.html';


import './styles/cart-full-mobile.scss';
import '../../../../../scripts/_partials/cart/styles/cart-mini.scss';
import './styles/cart-mini.scss';

const MODULE_NAME = 'cart';
angular.module(MODULE_NAME)
    .config([`$provide`, function ($provide) {
        $provide.decorator(`cartMobileFullDirective`, [`$delegate`, function ($delegate) {
            const directive = $delegate[0];
            directive.templateUrl = cartMobileFullTemplate;
            return $delegate;
        }]);

    }])
    .run([`cartMiniTemplatesConfig`, (cartMiniTemplatesConfig) => {
        cartMiniTemplatesConfig.cartMiniListTemplate = cartMiniListTemplate
        cartMiniTemplatesConfig.cartMiniFooterTemplate = cartMiniFooterTemplate
    }]);

export default MODULE_NAME;
