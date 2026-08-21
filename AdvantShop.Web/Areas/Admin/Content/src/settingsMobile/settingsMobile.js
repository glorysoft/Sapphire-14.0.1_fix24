const SettingsMobileCtrl = /* @ngInject */ function($http) {
    const ctrl = this;

    ctrl.$onInit = () => {
        ctrl.colorPickerOptions = {
            swatchBootstrap: false,
            format: 'hex',
            alpha: false,
            case: 'lower',
            swatchOnly: false,
            allowEmpty: true,
            required: false,
            preserveInputFormat: false,
            restrictToFormat: false,
            inputClass: 'form-control',
        };

        ctrl.colorPickerEventApi = {};

        ctrl.colorPickerEventApi.onBlur = () => {
            ctrl.colorPickerApi.getScope().AngularColorPickerController.update();
        };
    };

    ctrl.getSettings = (template) => {
        $http.get('settings/getMobileTemplateSettings', { params: { template } })
            .then((response) => {
                const { data } = response;

                ctrl.templateSettings = data;
            });
    };

    ctrl.changeTemplate = () => {
        ctrl.getSettings(ctrl.mobileTemlate);
    };

    ctrl.onChangeMobileAppActiveStateOffOn = (checked) => {
        ctrl.MobileAppActive = checked;
    };

    ctrl.onChangeMobileAppShowBadgesStateOffOn = (checked) => {
        ctrl.MobileAppShowBadges = checked;
    };

    ctrl.isHidden = (setting) =>
        typeof ctrl.HiddenSettings !== 'undefined'
        && ctrl.HiddenSettings.length > 0
        && ctrl.HiddenSettings.indexOf(`Mobile_${setting}`) > -1;
};

const moduleName = 'settingsMobile';

angular.module(moduleName, [])
    .controller('SettingsMobileCtrl', SettingsMobileCtrl);

export default moduleName;
