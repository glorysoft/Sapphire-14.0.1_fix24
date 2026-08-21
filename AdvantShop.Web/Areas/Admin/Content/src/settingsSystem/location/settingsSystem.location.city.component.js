import cityTemplate from './city.html';
(function (ng) {
    

    ng.module('settingsSystem').component('gridCity', {
        templateUrl: cityTemplate,
        controller: 'SettingsSystemLocationCityCtrl',
        bindings: {
            onGridInit: '&',
            onSelect: '&',
            gridParams: '<?',
            onGridPreinit: '&',
        },
    });
})(window.angular);
