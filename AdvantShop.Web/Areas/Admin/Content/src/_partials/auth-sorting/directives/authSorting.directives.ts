import { IAttributes, IDirectiveFactory, IScope } from 'angular';
import { IAuthSortingController } from '../controllers/authSorting.controller';
import authSortingTemplate from '../templates/authSorting.template.html';

interface AuthSortingDirective extends IDirectiveFactory<IScope, JQLite, IAttributes, IAuthSortingController> {}

const authSorting: AuthSortingDirective = () => ({
        restrict: 'AE',
        scope: {},
        templateUrl: authSortingTemplate,
        controller: 'AuthSortingController',
        controllerAs: 'ctrl',
        bindToController: true,
    });

export default authSorting;
