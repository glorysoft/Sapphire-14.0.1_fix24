import './catalog-modal.scss'
import { catalogModalTriggerDirective } from './catalog-modal.directive'
import { CatalogModalCtrl } from './catalog-modal.ctrl'
import { CatalogModalService } from './catalog-modal.service'

const MODULE_NAME = 'catalogModal';

angular.module(MODULE_NAME, [])
    .controller('CatalogModalCtrl', CatalogModalCtrl)
    .service('catalogModalService', CatalogModalService)
    .directive('catalogModalTrigger', catalogModalTriggerDirective);

export default MODULE_NAME;
