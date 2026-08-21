import appDependency from '../../../../../scripts/appDependency.js';

import modulesModule from '../../../Content/src/modules/modules.js';
appDependency.addItem(modulesModule);

import '../../../Content/src/_shared/adv-tracking/advTracking.js';
import '../../../Content/src/_shared/adv-tracking/advTracking.service.js';
appDependency.addItem('advTracking');
import '../Content/styles/_shared/onoffswitch/onoffswitch.scss';
import '../Content/styles/_shared/card/card.scss';
import '../Content/styles/_shared/module-card/module-card.scss';
import '../Content/styles/views/modules.scss';

import '../../../Content/src/exportfeeds/modal/addYandexGlobalDeliveryCost/ModalAddYandexGlobalDeliveryCostCtrl.js';
import '../../../Content/src/_shared/modal/export-products-selectvizr/ModalExportProductsSelectvizrCtrl.js';

import '../../../Content/src/_partials/products-selectvizr/productsSelectvizr.js';
import '../../../Content/src/_partials/products-selectvizr/productsSelectvizr.component.js';

import '../Content/styles/views/module-card.scss';
import '../Content/styles/views/module-preview.scss';
