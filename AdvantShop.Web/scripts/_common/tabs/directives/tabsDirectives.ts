import { IAttributes, IDirectiveFactory, ILocationService, IParseService, IScope } from 'angular';
import { ITabsController } from '../controllers/tabsController';
import { ITabContentController } from '../controllers/tabContentController';
import { ITabHeaderController } from '../controllers/tabHeaderController';
import { ITabsService } from '../services/tabsService';

export const tabsDirective: IDirectiveFactory<IScope, JQLite, IAttributes, ITabsController> = /*@ngInject*/ (
    tabsService: ITabsService,
    $parse: IParseService,
    $location: ILocationService,
) => ({
    restrict: 'A',
    scope: true,
    controller: 'TabsCtrl',
    controllerAs: 'tabs',
    bindToController: true,
    compile(_cElement, cAttrs) {
        let onSelect;
        if (typeof cAttrs.type === 'undefined') {
            cAttrs.$set('type', 'horizontal');
        }

        if (typeof cAttrs.classesTabActive === 'undefined') {
            cAttrs.$set('classesTabActive', 'tabs-header-active cs-br-1');
        }

        if (typeof cAttrs.classesLinkActive === 'undefined') {
            cAttrs.$set('classesLinkActive', 'cs-l-2 link-dotted-invert link-dotted-none');
        }

        if (typeof cAttrs.classesLink === 'undefined') {
            cAttrs.$set('classesLink', 'link-dotted-invert');
        }

        if (typeof cAttrs.tabsOnSelect !== 'undefined') {
            onSelect = $parse(cAttrs.tabsOnSelect);
        }

        return function (_scope, element, attrs, ctrl) {
            if (typeof ctrl === 'undefined') {
                throw new Error('Controller "TabsCtrl" is required for directive "tabs"');
            }
            ctrl.tabsOnSelect = onSelect;
            ctrl.type = attrs.type;
            ctrl.classesTabActive = attrs.classesTabActive;
            ctrl.classesTab = attrs.classesTab;
            ctrl.classesLinkActive = attrs.classesLinkActive;
            ctrl.classesLink = attrs.classesLink;
            ctrl.allowHideAll = Boolean(attrs?.allowHideAll === 'true');
            ctrl.isToggle = Boolean(attrs?.isToggle === 'true');

            tabsService.addInStorage(ctrl, attrs.id);

            element.on('$destroy', () => {
                $location.search('tab', null);
            });
        };
    },
});

export const tabHeaderDirective: IDirectiveFactory<IScope, JQLite, IAttributes, [ITabHeaderController, ITabsController]> = () => ({
    require: ['tabHeader', '^tabs'],
    restrict: 'A',
    scope: true,
    controller: 'TabHeaderCtrl',
    controllerAs: 'tabHeader',
    bindToController: true,
    link(_scope, _element, attrs, ctrls) {
        if (typeof ctrls !== 'undefined') {
            ctrls[0].id = attrs.id;
            ctrls[0].headerTab = attrs.tabHeader;
            ctrls[1].addHeader(ctrls[0]);
        }
    },
});

export const tabContentDirective: IDirectiveFactory<IScope, JQLite, IAttributes, [ITabContentController, ITabsController]> = () => ({
    require: ['tabContent', '^tabs'],
    restrict: 'A',
    scope: true,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    controller: () => {},
    controllerAs: 'tabContent',
    bindToController: true,
    link(_scope, element, attrs, ctrls) {
        if (typeof ctrls !== 'undefined') {
            ctrls[0].isRender =
                element
                    .html()
                    .replace(/<br\s*[/]?>/giu, '')
                    .trim().length > 0;
            ctrls[0].headerId = attrs.tabContent;
            ctrls[1].addContent(ctrls[0]);
        }
    },
});

export const tabsGotoDirective: IDirectiveFactory = /* @ngInject */ (tabsService: ITabsService, scrollToBlockService) => ({
    restrict: 'A',
    link(scope, element, attrs) {
        element.on('click', (event) => {
            event.stopPropagation();
            event.preventDefault();

            const tab = document.getElementById(attrs.tabsGoto);

            if (tab !== null) {
                tabsService.change(attrs.tabsGoto);
                scrollToBlockService.scrollToBlock(tab.closest('[data-tabs]'));
                scope.$apply();
            }
        });
    },
});
