import regionTemplate from './region.html';
(function (ng) {
    

    ng.module('settingsSystem').component('gridRegion', {
        templateUrl: regionTemplate,
        controller: 'SettingsSystemLocationRegionCtrl',
        bindings: {
            onGridInit: '&',
            onSelect: '&',
            gridParams: '<?',
        },
    });
})(window.angular);
