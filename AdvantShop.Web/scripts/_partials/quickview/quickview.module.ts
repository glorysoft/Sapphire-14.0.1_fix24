import './styles/quickview.scss';

import QuickviewCtrl from './controllers/quickviewController';
import { quickviewTriggerDirective } from './directives/quickviewDirectives';
import QuickviewService from './services/quickviewService';
import priceAmountListModule from '../price-amount-list/priceAmountList.module.js';
import '../../../Areas/Admin/Content/src/_shared/is-mobile/is-mobile.js';

const moduleName = 'quickview';

angular
    .module(moduleName, [priceAmountListModule, 'isMobile'])
    .constant('quickviewConfig', {
        url: 'product/productquickview',
    })
    .run(
        /* @ngInject */ (quickviewConfig, isMobileService) => {
            quickviewConfig.url = `${isMobileService.getValue() ? 'mobile/' : ''}product/productquickview`;
        },
    )
    .controller('QuickviewCtrl', QuickviewCtrl)
    .directive('quickviewTrigger', quickviewTriggerDirective)
    .service('quickviewService', QuickviewService);

export default moduleName;
