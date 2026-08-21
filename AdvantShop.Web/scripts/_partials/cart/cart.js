import helpTriggerModule from '../../../Areas/Admin/Content/src/_partials/help-trigger/helpTrigger.module.js';
import '../../../Areas/Admin/Content/src/_shared/is-mobile/is-mobile.js';
import '../../../Areas/Admin/Templates/Mobile/Content/vendors/ui-bootstrap/angular-popover-decorator/angular-popover-decorator.js';
import customOptionsModule from '../custom-options/customOptions.module.js';
import { cartAddConfigDefault } from './cartConfigDefault.ts';
import cartMiniPopupTemplate from './templates/cart-mini-popup.html';
import cartMiniListTemplate from './templates/cart-mini.html';
import cartMiniSidebarTemplate from './templates/cart-mini-sidebar.html';
import cartMiniFooterTemplate from './templates/cart-mini-footer.html';

(function (ng) {
    

    angular
        .module('cart', ['isMobile', helpTriggerModule, customOptionsModule])
        .constant('cartConfig', cartAddConfigDefault)
        .provider('cartMiniTemplatesConfig', function () {
            this.config = {
                cartMiniListTemplate,
                cartMiniPopupTemplate,
                cartMiniSidebarTemplate,
                cartMiniFooterTemplate,
            };

            this.$get = function () {
                return this.config;
            };
        });
})(window.angular);
