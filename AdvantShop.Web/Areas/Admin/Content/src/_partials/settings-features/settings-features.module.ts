import SettingFeaturesService from './settings-features.service';
import { SettingFeaturesKeys } from './settings-features.constant';

const moduleName = 'settingsFeatures';

angular.module(moduleName, []).constant('settingFeaturesKey', SettingFeaturesKeys).service('settingFeaturesService', SettingFeaturesService);
export default moduleName;
