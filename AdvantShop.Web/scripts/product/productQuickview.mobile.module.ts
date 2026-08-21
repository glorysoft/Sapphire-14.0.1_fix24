import carouselModule from '../_common/carousel/carousel.module.js';
import ratingModule from '../_common/rating/rating.module.js';
import rotateModule from '../_common/rotate/rotate.module.js';
import videosModule from '../_partials/videos/videos.module.js';
//
import customOptionsModule from '../_partials/custom-options/customOptions.module.js';
import colorsViewerModule from '../_partials/colors-viewer/colorsViewer.module.js';
import sizesViewerModule from '../_partials/sizes-viewer/sizesViewer.module.js';
import buyOneClickModule from '../_partials/buy-one-click/buyOneClick.module.js';
import preOrderModule from '../_partials/pre-order/preOrder.module.js';
import tabsModule from '../_common/tabs/tabs.module.js';
//
import compareModule from '../_partials/compare/compare.module';
import shippingModule from '../_partials/shipping/shipping.module.js';
import priceAmountListModule from '../_partials/price-amount-list/priceAmountList.module.js';
//
import photoViewerModule from '../_common/photoViewer/photoViewer.module.js';
//
import '../../styles/partials/gallery.scss';
import '../../styles/partials/product-color.scss';
import '../../styles/partials/properties.scss';
import '../../styles/partials/bonus-card.scss';
//
import stockListModule from '../product/components/stock-list/stock-list.module.js';

import ProductCtrl from './controllers/productController.js';
import productService from './services/productService.js';
//
import { showStocksDirective } from '../product/directives/showStocksDirective.js';
//
import '../../styles/partials/stickers.scss';
import productAvailabilityMapModule from '../product/components/productAvailabilityMap/productAvailabilityMap.module.js';
//
import '../../Areas/Mobile/styles/_common/popover.scss';
//
import '../../Areas/Mobile/scripts/_partials/cutom-options/styles/customOptions.scss';

import '../../Areas/Mobile/styles/views/product.scss';

const quickviewModule = 'productQuickView';

const deps = [
    ratingModule,
    carouselModule,
    rotateModule,
    compareModule,
    customOptionsModule,
    colorsViewerModule,
    sizesViewerModule,
    shippingModule,
    priceAmountListModule,
    buyOneClickModule,
    videosModule,
    photoViewerModule,
    preOrderModule,
    productAvailabilityMapModule,
    stockListModule,
    tabsModule,
];

angular
    .module(quickviewModule, deps)
    .controller('ProductCtrl', ProductCtrl)
    .service('productService', productService)
    .directive('showStocks', showStocksDirective);

export default quickviewModule;
