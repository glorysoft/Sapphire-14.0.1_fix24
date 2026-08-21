import SettingsAuthModulesController from './controllers/settingsAuthModules.controller';
import settingsAuthModules from './directives/settingsAuthModules.directives';
import SettingsAuthModulesService from './services/settingsAuthModules.service';

const moduleName = 'settingsAuthModulesModule';

angular
    .module(moduleName, [])
    .service('settingsAuthModulesService', SettingsAuthModulesService)
    .controller('SettingsAuthModulesController', SettingsAuthModulesController)
    .directive('settingsAuthModules', settingsAuthModules);

export default moduleName;
