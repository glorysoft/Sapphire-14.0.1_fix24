import './styles/tabs.scss';

import { TabsService } from './services/tabsService';
import { tabsDirective, tabHeaderDirective, tabContentDirective, tabsGotoDirective } from './directives/tabsDirectives.js';

import { TabsCtrl } from './controllers/tabsController';
import { TabHeaderCtrl } from './controllers/tabHeaderController';
import { TabContentCtrl } from './controllers/tabContentController';

const moduleName = 'tabs';

angular
    .module('tabs', [])
    .service('tabsService', TabsService)
    .controller('TabsCtrl', TabsCtrl)
    .controller('TabHeaderCtrl', TabHeaderCtrl)
    .controller('TabContentCtrl', TabContentCtrl)
    .directive('tabs', tabsDirective)
    .directive('tabHeader', tabHeaderDirective)
    .directive('tabContent', tabContentDirective)
    .directive('tabsGoto', tabsGotoDirective);

export default moduleName;
