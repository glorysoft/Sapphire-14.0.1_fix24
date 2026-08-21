import RootMenuCtrl from './controllers/rootMenu.ctrl.js';
import { rootMenuDirective } from './directives/rootMenuDirectives';

const moduleName = 'rootMenu';

angular.module(moduleName, []).controller('RootMenuCtrl', RootMenuCtrl).directive('rootMenu', rootMenuDirective);

export default moduleName;
