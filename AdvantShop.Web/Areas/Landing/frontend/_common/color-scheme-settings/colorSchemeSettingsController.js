(function (ng) {
    

    const ColorSchemeSettingsCtrl = function (blocksConstructorBackgroundColors, $timeout) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.backgroundPickerList = [];

            ctrl.colorPickerOptions = {
                swatchBootstrap: false,
                format: 'rgb',
                alpha: true,
                case: 'lower',
                swatchOnly: false,
                allowEmpty: true,
                required: false,
                preserveInputFormat: false,
                restrictToFormat: false,
                inputClass: 'blocks-constructor-input',
            };

            ctrl.colorPickerEventApi = {
                onChange (colorPicker, value, event) {
                    return $timeout(() => {
                        const colorPickerCtrl = colorPicker.getScope().AngularColorPickerController;
                        colorPickerCtrl.setNgModel(value);
                        return colorPicker;
                    });
                },
                onBlur (colorPicker, value, $event) {
                    if (value.length === 6) {
                        const colorPickerCtrl = colorPicker.getScope().AngularColorPickerController;

                        if (value.indexOf('rgb') === -1) {
                            value = tinycolor(colorPickerCtrl.getColorValue()).toRgbString();
                        }

                        colorPickerCtrl.setNgModel(value);

                        if (ctrl.onUpdateColor != null) {
                            ctrl.onUpdateColor({ cssString: value });
                        }
                    }
                },
            };

            ctrl.colorPickerText = {
                onChange (colorPicker, value, event) {
                    ctrl.colorPickerEventApi.onChange(colorPicker, value, event).then(() => {
                        if (ctrl.onUpdateColor != null) {
                            ctrl.onUpdateColor({ cssString: value });
                        }
                    });
                },
            };

            ctrl.settings = ctrl.settings || {};

            ctrl.format();

            ctrl.backgroundColors = blocksConstructorBackgroundColors;

            if (ctrl.onInit != null) {
                ctrl.onInit({ colorShemeSettings: ctrl });
            }
        };

        ctrl.updateBackground = function (cssString, type) {
            ctrl.settings.BackgroundColor = cssString;

            if (ctrl.onUpdateBackground != null) {
                ctrl.onUpdateBackground({ cssString, type });
            }
        };

        ctrl.updateBackgroundAlt = function (cssString, type) {
            ctrl.settings.BackgroundColorAlt = cssString;
        };

        ctrl.onInitBackgroundPicker = function (backgroundPicker) {
            ctrl.backgroundPickerList.push(backgroundPicker);
        };

        ctrl.updateBackgroundPickers = function () {
            ctrl.backgroundPickerList.forEach((item) => {
                item.updateValue();
            });
        };

        ctrl.format = function () {
            ctrl.buttonBorderWidth = parseFloat(ctrl.settings.ButtonBorderWidth);
            ctrl.buttonBorderRadius = parseFloat(ctrl.settings.ButtonBorderRadius);

            ctrl.buttonSecondaryBorderWidth = parseFloat(ctrl.settings.ButtonSecondaryBorderWidth);
            ctrl.buttonSecondaryBorderRadius = parseFloat(ctrl.settings.ButtonSecondaryBorderRadius);
        };
    };

    ng.module('colorSchemeSettings').controller('ColorSchemeSettingsCtrl', ColorSchemeSettingsCtrl);

    ColorSchemeSettingsCtrl.$inject = ['blocksConstructorBackgroundColors', '$timeout'];
})(window.angular);
