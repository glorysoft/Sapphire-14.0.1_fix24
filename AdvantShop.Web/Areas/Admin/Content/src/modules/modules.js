import modulesController from './modules.controller.js';
import modulesService from './modules.service.js';

import './modules.scss';

const MODULE_NAME = 'modules';

angular.module(MODULE_NAME, ['uiModal', 'productsSelectvizr'])
    .controller('ModulesCtrl', modulesController)
    .service('modulesService', modulesService);

export default MODULE_NAME;
