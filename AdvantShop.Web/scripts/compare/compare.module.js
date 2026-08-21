import ratingModule from '../_common/rating/rating.module.js';
import productViewModule from '../_partials/product-view/productView.module.js';

import '../../styles/views/compareproducts.scss';
import '../../styles/partials/properties.scss';

import './compare.js';

const moduleName = 'comparePage';

angular.module(moduleName, [ratingModule, productViewModule]).controller('ComparePageCtrl', () => {});

export default moduleName;
