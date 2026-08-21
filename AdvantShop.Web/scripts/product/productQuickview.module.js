import carouselModule from '../_common/carousel/carousel.module.js';
import ratingModule from '../_common/rating/rating.module.js';
import rotateModule from '../_common/rotate/rotate.module.js';
import videosModule from '../_partials/videos/videos.module.js';
import zoomerModule from '../_common/zoomer/zoomer.module.js';

import customOptionsModule from '../_partials/custom-options/customOptions.module.js';
import colorsViewerModule from '../_partials/colors-viewer/colorsViewer.module.js';
import sizesViewerModule from '../_partials/sizes-viewer/sizesViewer.module.js';
import buyOneClickModule from '../_partials/buy-one-click/buyOneClick.module.js';
import preOrderModule from '../_partials/pre-order/preOrder.module.js';
import tabsModule from '../_common/tabs/tabs.module.ts';

import '../../styles/partials/gallery.scss';
import '../../styles/partials/product-color.scss';
import '../../styles/partials/properties.scss';
import '../../styles/views/product.scss';
import '../../styles/partials/product-reviews.scss'

import ProductCtrl from './controllers/productController.js';
import productService from './services/productService.js';
import productViewModule from '../_partials/product-view/productView.module.js';
import compareModule from '../_partials/compare/compare.module.js';
import reviewsModule from '../_partials/reviews/reviews.module.js';
import shippingModule from '../_partials/shipping/shipping.module.js';
import priceAmountListModule from '../_partials/price-amount-list/priceAmountList.module.js';
import productAvailabilityMapModule from './components/productAvailabilityMap/productAvailabilityMap.module.js';
import warehousesModule from '../warehouses/warehouses.module.js';

const moduleName = 'productQuickView';

const deps = [
    tabsModule,
    ratingModule,
    carouselModule,
    productViewModule,
    rotateModule,
    compareModule,
    customOptionsModule,
    colorsViewerModule,
    sizesViewerModule,
    zoomerModule,
    reviewsModule,
    shippingModule,
    priceAmountListModule,
    buyOneClickModule,
    videosModule,
    'urlHelper',
    preOrderModule,
    productAvailabilityMapModule,
    warehousesModule,
];

angular.module(moduleName, deps).controller('ProductCtrl', ProductCtrl).service('productService', productService);

export default moduleName;
