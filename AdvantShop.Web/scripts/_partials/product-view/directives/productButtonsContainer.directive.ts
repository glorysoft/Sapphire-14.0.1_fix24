import { IAttributes, IDirectiveFactory, IScope } from 'angular';
import { IProductButtonsContainerCtrl } from '../controllers/productButtonsContainerController';

type IProductButtonsContainerDirective = IDirectiveFactory<IScope, JQLite, IAttributes, IProductButtonsContainerCtrl>

const productButtonsContainerDirective: IProductButtonsContainerDirective = () => ({
    restrict: 'A',
    require: {
        productViewItem: '^^productViewItem',
    },
    controller: 'ProductButtonsContainerCtrl',
    controllerAs: 'productButtonsContainer',
    bindToController: true,
    scope: true,
});

export { productButtonsContainerDirective };
