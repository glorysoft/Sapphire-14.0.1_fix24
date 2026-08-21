
import type { IDirectiveFactory, IScope, IAugmentedJQuery, IAttributes, IParseService } from 'angular'
import { ICatalogModalCtrl} from './catalog-modal.ctrl'
import {ICatalogModalOptions} from "./catalog-modal.service";

export const catalogModalTriggerDirective:IDirectiveFactory<IScope, IAugmentedJQuery, IAttributes, ICatalogModalCtrl> = /* @ngInject */($parse:IParseService) =>({
        restrict: 'A',
        scope: true,
        controller: 'CatalogModalCtrl',
        controllerAs: 'catalogModalCtrl',
        link: (scope, element, attrs, ctrl) =>  {
            element.on('click', (event: Event) => {
                event.preventDefault();
                const optionsRaw= attrs.catalogModalTrigger;
                const options: ICatalogModalOptions | undefined = optionsRaw?.length > 0 ? $parse(optionsRaw)(scope): undefined;
                ctrl?.openModal(options);
            })
        }
    })
