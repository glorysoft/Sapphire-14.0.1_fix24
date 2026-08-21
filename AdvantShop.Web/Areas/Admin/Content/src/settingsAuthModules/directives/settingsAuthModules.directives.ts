import { IAttributes, IDirectiveFactory, IScope } from 'angular';
import settingsAuthModulesTemplate from '../templates/settingsAuthModules.template.html';
import { ISettingsAuthModulesController } from '../controllers/settingsAuthModules.controller';

interface SettingsAuthModulesDirective extends IDirectiveFactory<IScope, JQLite, IAttributes, ISettingsAuthModulesController> {}

const settingsAuthModules: SettingsAuthModulesDirective = () => ({
        restrict: 'AE',
        scope: {
            redirectTo: '<?',
        },
        templateUrl: settingsAuthModulesTemplate,
        controller: 'SettingsAuthModulesController',
        controllerAs: 'ctrl',
        bindToController: true,
    });

export default settingsAuthModules;
