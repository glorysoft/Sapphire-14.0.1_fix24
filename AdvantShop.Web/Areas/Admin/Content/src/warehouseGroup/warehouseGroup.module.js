import WarehouseGroupCtrl from './warehouseGroup.controller.js';
import '../../../Content/vendors/ng-sortable-custom/ng-sortable.module.js';

const MODULE_NAME = 'warehouseGroup';

angular.module(MODULE_NAME, ['as.sortable']).controller('WarehouseGroupCtrl', WarehouseGroupCtrl);

export default MODULE_NAME;
