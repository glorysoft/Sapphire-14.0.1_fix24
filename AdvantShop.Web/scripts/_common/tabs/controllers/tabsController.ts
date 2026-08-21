/* @ngInject */
import { ICompiledExpression, IController, IDeferred, IQService, IScope } from 'angular';
import { ITabsService } from '../services/tabsService';
import { ITabHeaderController } from './tabHeaderController';
import { ITabContentController } from './tabContentController';

export interface ITabsController extends IController {
    panes: Record<string, ITabHeaderController>;
    queueHeader: Record<string, IDeferred<ITabHeaderController>>;
    queueContent: Record<string, IDeferred<ITabContentController>>;
    tabsOnSelect?: ICompiledExpression;
    type: 'horizontal' | 'vertical';
    classesTabActive: string;
    classesTab: string;
    classesLinkActive: string;
    classesLink: string;
    allowHideAll: boolean;
    isToggle: boolean;
    headerTab: string;
    tabSelected?: ITabHeaderController;
}

export class TabsCtrl implements ITabsController {
    panes: Record<string, ITabHeaderController> = {};
    queueHeader: Record<string, IDeferred<ITabHeaderController>> = {};
    queueContent: Record<string, IDeferred<ITabContentController>> = {};
    tabsOnSelect?: ICompiledExpression;
    type: 'horizontal' | 'vertical' = 'horizontal';
    classesTabActive = '';
    classesTab = '';
    classesLinkActive = '';
    classesLink = '';
    allowHideAll = false;
    isToggle = false;
    headerTab = '';
    tabSelected?: ITabHeaderController;

    /* @ngInject */
    constructor(
        private readonly $q: IQService,
        private readonly tabsService: ITabsService,
        private readonly $scope: IScope,
    ) {}

    $postLink() {
        this.selectFromUrl();

        window.addEventListener('hashchange', () => {
            this.selectFromUrl();
            this.$scope.$digest();
        });
    }

    selectFromUrl() {
        const tabId = this.tabsService.getTabIdFromUrl();

        if (typeof tabId !== 'undefined' && typeof this.panes[tabId] !== 'undefined') {
            if (typeof this.tabsOnSelect !== 'undefined') {
                this.tabsOnSelect(this.$scope, { tabHeader: this.panes[tabId], fromUrl: true });
            }
            const tabObj = this.tabsService.findTabByid(tabId);
            if (this.panes[tabId].headerTab?.length > 0) {
                this.headerTab = this.panes[tabId].headerTab;
            }
            if (typeof tabObj !== 'undefined' && tabObj?.pane?.selected === false) {
                this.change(tabObj.pane, true);
            }
        }
    }

    select(tabHeader: ITabHeaderController) {
        const keys = Object.keys(this.panes);

        if (typeof this.tabsOnSelect !== 'undefined') {
            this.tabsOnSelect(this.$scope, { tabHeader });
        }

        if (this.isToggle === false) {
            for (let i = 0, len = keys.length; i < len; i++) {
                this.panes[keys[i]].selected = false;
            }

            tabHeader.selected = true;
            this.tabSelected = tabHeader;
        } else {
            tabHeader.selected = !tabHeader.selected;
            this.tabSelected = tabHeader.selected === false ? undefined : tabHeader;
        }
    }

    addHeader(tabHeader: ITabHeaderController) {
        const defer = this.$q.defer<ITabContentController>(),
            searchTabId = this.tabsService.getTabIdFromUrl();

        this.panes[tabHeader.id] = tabHeader;

        if (typeof this.queueHeader[tabHeader.id] !== 'undefined') {
            this.queueHeader[tabHeader.id].resolve(tabHeader);

            this.queueHeader[tabHeader.id].promise.then((tabHeaderResolved) => {
                //tabHeader.isRender = tabContent.isRender;

                if (tabHeaderResolved.isRender === true && (tabHeaderResolved.id === searchTabId || typeof this.tabSelected === 'undefined')) {
                    this.select(tabHeaderResolved);
                } else {
                    tabHeaderResolved.selected = false;
                }
            });
        } else {
            if (typeof tabHeader.content === 'undefined') {
                this.queueContent[tabHeader.id] = defer;
            } else {
                defer.resolve(tabHeader.content);
            }

            defer.promise.then((tabContent: ITabContentController) => {
                tabHeader.content = tabContent;
                tabHeader.isRender = tabContent.isRender;

                if (tabHeader.isRender === true && (tabHeader.id === searchTabId || typeof this.tabSelected === 'undefined')) {
                    this.select(tabHeader);
                } else {
                    tabHeader.selected = false;
                }

                return tabContent;
            });
        }
    }

    addContent(tabContent) {
        const header = this.panes[tabContent.headerId],
            defer = this.$q.defer<ITabHeaderController>();

        //если заголовок ещё не проинициализовался
        if (typeof header === 'undefined') {
            this.queueHeader[tabContent.headerId] = defer;
        } else {
            defer.resolve(header);
        }

        defer.promise.then((headerResolved) => {
            tabContent.header = headerResolved;
            return headerResolved;
        });

        //проверяем если обещания на получения контента
        if (typeof this.queueContent[tabContent.headerId] !== 'undefined') {
            this.queueContent[tabContent.headerId].resolve(tabContent);
        }
    }

    change(tabHeader: ITabHeaderController, ignoreUrl: boolean) {
        if (this.allowHideAll === true && tabHeader.selected === true) {
            tabHeader.selected = false;
        } else {
            this.select(tabHeader);
            if (typeof tabHeader.headerTab !== 'undefined' && tabHeader.headerTab.length > 0) {
                this.headerTab = tabHeader.headerTab;
            }
            if (angular.isDefined(tabHeader.id) && !ignoreUrl) {
                this.tabsService.changeUrl(tabHeader.id);
            }
        }
    }
}
