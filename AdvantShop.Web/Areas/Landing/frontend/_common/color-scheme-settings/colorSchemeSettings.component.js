import colorSchemeSettingsTemplate from './templates/colorSchemeSettings.html';
(function (ng) {
    

    ng.module('colorSchemeSettings').component('colorSchemeSettings', {
        templateUrl: colorSchemeSettingsTemplate,
        controller: 'ColorSchemeSettingsCtrl',
        bindings: {
            settings: '=',
            onInit: '&',
            onUpdateBackground: '&',
            onUpdateColor: '&',
            fontMain: '<?',
            fontHeight: '<?',
        },
    });
})(window.angular);
