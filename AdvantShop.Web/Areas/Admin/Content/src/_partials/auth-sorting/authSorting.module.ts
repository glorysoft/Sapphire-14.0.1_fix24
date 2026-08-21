import AuthSortingController from './controllers/authSorting.controller';
import AuthSortingService from './services/authSorting.service';
import authSorting from './directives/authSorting.directives';

import './styles/authSorting.style.scss';

const moduleName = 'authSortingModule';

angular
    .module(moduleName, ['as.sortable'])
    .controller('AuthSortingController', AuthSortingController)
    .service('authSortingService', AuthSortingService)
    .directive('authSorting', authSorting);

export default moduleName;
