import backgroundPickerTemplate from './../templates/backgroundPicker.html';
(function (ng) {
    

    ng.module('backgroundPicker').component('backgroundPicker', {
        templateUrl: backgroundPickerTemplate,
        controller: 'BackgroundPickerCtrl',
        bindings: {
            onUpdate: '&',
            colors: '<',
            colorSelected: '<?',
            onInit: '&',
        },
    });
})(window.angular);
