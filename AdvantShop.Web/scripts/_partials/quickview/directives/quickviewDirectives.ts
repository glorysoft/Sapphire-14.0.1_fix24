import { type IQuickViewCtrl, type IQuickViewModalParamsCtrl } from '../controllers/quickviewController';
import { type IDirective, type IParseService, type IController, type IScope, type IAttributes } from 'angular';

type QuickViewTriggerDirective = IDirective<IScope, JQLite, IAttributes, IQuickViewControllerLInk>;

interface IQuickViewControllerLInk {
    quickview: IQuickViewCtrl;
    productViewItem: IController | null;
    modalControl: IController | null;
}

function quickviewTriggerDirective(): QuickViewTriggerDirective {
    return {
        require: {
            quickview: 'quickviewTrigger',
            productViewItem: '?^productViewItem',
            modalControl: '?^^modalControl',
        },
        restrict: 'A',
        scope: true,
        controller: 'QuickviewCtrl',
        controllerAs: 'quickview',
        bindToController: true
    };
}

export { quickviewTriggerDirective };
