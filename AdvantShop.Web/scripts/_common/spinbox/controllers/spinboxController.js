import { isNotEmpty } from '../../utils/define';

/* @ngInject */
export function SpinboxCtrl($element, $timeout, spinboxKeyCodeAllow, spinboxTooltipTextType, $translate, $attrs, $scope, $parse, spinboxConstants) {
    const ctrl = this;

    let timeoutTooltip = null,
        callbackTimerId;

    const callbackCall = (value, force) => {
        if (isNotEmpty(callbackTimerId)) {
            $timeout.cancel(callbackTimerId);
        }

        callbackTimerId = $timeout(
            () => {
                // && ctrl.form.$valid
                if (isNotEmpty(ctrl.updateFn)) {
                    ctrl.updateFn({ value, proxy: ctrl.proxy });
                }
            },
            ctrl.debounce && !force ? 700 : 0,
        );
    };

    ctrl.numberToFloat = (num) => parseFloat(num?.toString().replace(/\s*/gu, '').replace(/,/gu, '.'));
    ctrl.formatterNumber = (num) => {
        if (ctrl.needComma === false) return num;
        return num?.toString().replace(/\s*/gu, '').replace(/\./gu, ',');
    };

    ctrl.processValue = (num, fn, needFormatter = false) => {
        const result = fn(ctrl.numberToFloat(num));
        return needFormatter ? ctrl.formatterNumber(result) : result;
    };

    ctrl.$onInit = () => {
        ctrl.needComma = isNotEmpty(ctrl.needComma) ? ctrl.needComma : false;
        ctrl.allowZero = isNotEmpty(ctrl.allowZero) ? ctrl.allowZero : true;
        ctrl.isRequired = isNotEmpty(ctrl.isRequired) ? ctrl.isRequired : true;
        ctrl.debounce = isNotEmpty(ctrl.debounce) ? ctrl.debounce : true;
        ctrl.onlyValidation = isNotEmpty(ctrl.onlyValidation) ? ctrl.onlyValidation : false;
        ctrl.tooltipText = null;
        ctrl.isVisibleArrows = isNotEmpty(ctrl.isVisibleArrows) ? ctrl.isVisibleArrows : true;
        ctrl.inputName = isNotEmpty(ctrl.inputName) ? ctrl.inputName : undefined;

        ctrl._step = ctrl.numberToFloat(ctrl.step);
        ctrl._max = isNotEmpty(ctrl.max)
            ? ctrl.processValue(ctrl.max, (value) => ctrl.getNearValue(value, ctrl.numberToFloat(ctrl.max), ctrl.numberToFloat(ctrl.min)))
            : spinboxConstants.MAX_DEFAULT;
        ctrl._min = isNotEmpty(ctrl.min)
            ? ctrl.processValue(ctrl.min, (value) => ctrl.getNearValue(value, ctrl.numberToFloat(ctrl.max), ctrl.numberToFloat(ctrl.min)))
            : spinboxConstants.MIN_DEFAULT;

        $scope.$watch('spinbox.max', (newVal) => {
            if (newVal === undefined) return;
            ctrl._max = typeof newVal === 'string' ? $parse(newVal)($scope) : (newVal ?? spinboxConstants.MAX_DEFAULT);
            ctrl.checkButtons(ctrl.value);
        });

        $scope.$watch('spinbox.min', (newVal) => {
            if (newVal === undefined) return;
            ctrl._min = typeof newVal === 'string' ? $parse(newVal)($scope) : (newVal ?? spinboxConstants.MIN_DEFAULT);
            ctrl.checkButtons(ctrl.value);
        });

        $scope.$watch('spinbox.step', (newVal) => {
            if (newVal === undefined) return;
            ctrl._step = typeof newVal === 'string' ? $parse(newVal)($scope) : (newVal ?? 1);
        });

        if (!ctrl.value) {
            return;
        }
        ctrl.value = ctrl.processValue(ctrl.value ?? ctrl.getMinAvailableValue(), (num) => ctrl.getNearestMoreMultiple(num, ctrl.getStep()), true);
        ctrl.checkButtons(ctrl.numberToFloat(ctrl.value));
    };

    ctrl.less = () => {
        let newValue = ctrl.numberToFloat(ctrl.value) - ctrl.getStep();

        if (ctrl.onlyValidation === false) {
            newValue =
                ctrl.checkRange(newValue) === true ? newValue : isNotEmpty(ctrl.getMinAvailableValue()) ? ctrl.getMinAvailableValue() : newValue;
        }

        const finishNewValue = ctrl.numberRound(newValue);

        if (
            $attrs.validationBeforeUpdateFn &&
            !ctrl.validationBeforeUpdateFn({
                value: finishNewValue,
                proxy: ctrl.proxy,
            })
        ) {
            return;
        }

        ctrl.form.$setDirty();
        ctrl.value = ctrl.formatterNumber(finishNewValue);

        ctrl.checkButtons(ctrl.value);

        ctrl.beforeUpdate();

        callbackCall(ctrl.numberToFloat(ctrl.value));
    };

    ctrl.more = () => {
        let newValue = ctrl.numberToFloat(ctrl.value) + ctrl.getStep();

        if (ctrl.onlyValidation === false) {
            newValue =
                ctrl.checkRange(newValue) === true ? newValue : isNotEmpty(ctrl.getMaxAvailableValue()) ? ctrl.getMaxAvailableValue() : newValue;
        }

        const finishNewValue = ctrl.numberRound(newValue);

        if (
            $attrs.validationBeforeUpdateFn &&
            !ctrl.validationBeforeUpdateFn({
                value: finishNewValue,
                proxy: ctrl.proxy,
            })
        ) {
            return;
        }

        ctrl.form.$setDirty();
        ctrl.value = ctrl.formatterNumber(finishNewValue);

        ctrl.checkButtons(ctrl.value);

        ctrl.beforeUpdate();

        callbackCall(ctrl.numberToFloat(ctrl.value));
    };

    ctrl.checkRange = (newValue) =>
        newValue <= ctrl.numberToFloat(ctrl.getMaxAvailableValue()) && newValue >= ctrl.numberToFloat(ctrl.getMinAvailableValue());

    ctrl.checkRegex = (char) => /\d/gu.test(char);

    ctrl.keydown = (event) => {
        let symbol;

        if (event.altKey || event.ctrlKey || event.shiftKey) {
            event.preventDefault();
            return;
        }

        const code = ctrl.prepareNumpad(event.keyCode);

        if (!ctrl.isExistKeyCodeAllow(code)) {
            symbol = Number(String.fromCharCode(code));

            if (Number.isNaN(symbol) === true) {
                event.preventDefault();
            }
        } else {
            switch (code) {
                case 40:
                    // down arrow
                    ctrl.less();
                    event.preventDefault();
                    break;
                case 38:
                    // up arrow
                    ctrl.more();
                    event.preventDefault();
                    break;
                default:
                    break;
            }
        }
    };

    // ctrl.keyup =  (event) =>{
    //     const code = ctrl.prepareNumpad(event.keyCode),
    //         symbol = Number(String.fromCharCode(code));
    //     // ctrl.value = parseFloat($element[0].querySelector('.spinbox-input').value);
    //     //update if number
    //
    //     // callbackCall(ctrl.normalizeNumberInput(ctrl.value));
    //
    //     // if (Number.isNaN(symbol) === false) {
    //     //
    //     //
    //     //     // if(ctrl.form.$valid){
    //     //     //     callbackCall(ctrl.normalizeNumberInput(ctrl.value));
    //
    //     //     // }
    //     // } else if ([8, 49, 110, 188].indexOf(event.keyCode) !== -1 && ctrl.value > 0) {
    //     //     //'backspace': 8,
    //     //     //'delete': 46,
    //     //     //'decimalPoint': 110,
    //     //     //'comma': 188,
    //     //     callbackCall(ctrl.normalizeNumberInput(ctrl.value));
    //
    //     // }
    // };

    ctrl.prepareNumpad = (keycode) => (keycode > 95 && keycode < 106 ? keycode - 48 : keycode);

    ctrl.isExistKeyCodeAllow = (keycode) => {
        let result = false;

        for (const key in spinboxKeyCodeAllow) {
            if (spinboxKeyCodeAllow[key] === keycode) {
                result = true;
                break;
            }
        }

        return result;
    };

    ctrl.checkButtons = (newValue) => {
        if (ctrl.onlyValidation) return;

        ctrl.lessBtnDisabled = newValue <= ctrl.getMinAvailableValue();
        ctrl.moreBtnDisabled = newValue >= ctrl.getMaxAvailableValue();
    };

    ctrl.checkMinMax = (value) => {
        let result = value;
        if (result > ctrl.getMaxAvailableValue()) {
            result = ctrl.formatterNumber(ctrl.getMaxAvailableValue());
            ctrl.tooltipText = ctrl.getTooltipText(spinboxTooltipTextType.max);
        } else if (Number.isNaN(result) || result < ctrl.numberToFloat(ctrl.getMinAvailableValue())) {
            result = ctrl.formatterNumber(ctrl.getMinAvailableValue());
            ctrl.tooltipText = ctrl.getTooltipText(spinboxTooltipTextType.min);
        } else {
            result = ctrl.formatterNumber(result);
        }
        return result;
    };
    ctrl.correctByStep = (value) => {
        let whole,
            newValue = value;

        const normalizedValue = ctrl.numberToFloat(newValue);
        const step = ctrl.numberToFloat(ctrl.getStep());

        if (step === 0) return newValue;

        if (!ctrl.isShareWhole(normalizedValue, step) || normalizedValue === 0) {
            whole = normalizedValue - ctrl.getRemainder(normalizedValue, step);

            newValue = whole + step;

            newValue = ctrl.checkRange(newValue) === true ? newValue : ctrl.getNearValue(newValue);

            newValue = ctrl.numberRound(newValue);
            ctrl.checkButtons(newValue);
            ctrl.tooltipText = ctrl.getTooltipText(spinboxTooltipTextType.multiplicity);
        }
        return newValue;
    };
    ctrl.valueFoldStep = () => {
        let value = ctrl.numberToFloat($element[0].querySelector('.spinbox-input').value);

        if (ctrl.isRequired === false && Number.isNaN(value)) return;

        if (
            $attrs.validationBeforeUpdateFn &&
            !ctrl.validationBeforeUpdateFn({
                value: value || ctrl.numberToFloat(ctrl.getMinAvailableValue()),
                proxy: ctrl.proxy,
            })
        ) {
            return;
        }
        if (ctrl.allowZero === false && value === 0) {
            ctrl.value = ctrl.formatterNumber(spinboxConstants.MIN_DEFAULT);

            ctrl.beforeUpdate();
            callbackCall(ctrl.numberToFloat(ctrl.value));
        }

        if ((value === 0 || Number.isNaN(value)) && ctrl.getMinAvailableValue() === spinboxConstants.MIN_DEFAULT) {
            ctrl.value = ctrl.formatterNumber(spinboxConstants.MIN_DEFAULT);
            return;
        }

        value = ctrl.onlyValidation ? value : ctrl.checkMinMax(value);

        ctrl.value = ctrl.formatterNumber(ctrl.onlyValidation ? value : ctrl.correctByStep(value));

        ctrl.checkButtons(ctrl.value);

        if (isNotEmpty(ctrl.tooltipText)) {
            if (timeoutTooltip) {
                ctrl.hideTooltip();
                $timeout.cancel(timeoutTooltip);
            }
            ctrl.showTooltip();
            timeoutTooltip = $timeout(() => {
                ctrl.tooltipText = null;
            }, spinboxConstants.TOOLTIP_TIMER);
        }
        ctrl.beforeUpdate();

        callbackCall(ctrl.numberToFloat(ctrl.value));
    };

    ctrl.getLengthAfterSemicolon = (value) => (value.toString().split('.')[1] ?? '').length;
    ctrl.numberRound = (newValue) =>
        //http://0.30000000000000004.com/
        //http://stackoverflow.com/questions/588004/is-floating-point-math-broken/588014#588014
        parseFloat(newValue.toPrecision(12));
    ctrl.getRemainder = (num1, num2) => ctrl.numberRound(num1 % num2);
    ctrl.isShareWhole = (num1, num2) => {
        const maxLengthAfterSemicolon = Math.max(ctrl.getLengthAfterSemicolon(num1), ctrl.getLengthAfterSemicolon(num2));
        const multiple = 10 ** (maxLengthAfterSemicolon || 1);

        const _num1 = multiple * num1;
        const _num2 = multiple * num2;

        const remainder = ctrl.getRemainder(ctrl.numberRound(_num1), ctrl.numberRound(_num2));

        return remainder === 0;
    };
    ctrl.getNearestLessMultiple = (number, multiple) => (multiple === 0 ? number : ctrl.numberRound(Math.floor(number / multiple) * multiple));
    ctrl.getNearestMoreMultiple = (number, multiple) => (multiple === 0 ? number : ctrl.numberRound(Math.ceil(number / multiple) * multiple));

    ctrl.getNearValue = (value, max, min) =>
        ctrl.processValue(value, (num) => {
            const normalizeMax = ctrl.numberToFloat(max ?? ctrl.getMaxAvailableValue() ?? spinboxConstants.MAX_DEFAULT);
            const normalizeMin = ctrl.numberToFloat(min ?? ctrl.getMinAvailableValue() ?? spinboxConstants.MIN_DEFAULT);

            if (num >= normalizeMax) {
                return ctrl.isShareWhole(normalizeMax, ctrl.getStep()) ? normalizeMax : ctrl.getNearestLessMultiple(normalizeMax, ctrl.getStep());
            } else if (normalizeMin >= num) {
                return ctrl.isShareWhole(normalizeMin, ctrl.getStep()) ? normalizeMin : ctrl.getNearestMoreMultiple(normalizeMin, ctrl.getStep());
            }

            return num;
        });

    ctrl.showTooltip = () => {
        ctrl.isOpenTooltip = true;
    };

    ctrl.hideTooltip = () => {
        ctrl.isOpenTooltip = false;
    };

    ctrl.getTooltipText = (type) => {
        if (type === spinboxTooltipTextType.min) {
            return `${$translate.instant('Js.Spinbox.MinTextNote')} ${ctrl.getMinAvailableValue()}`;
        }
        if (type === spinboxTooltipTextType.max) {
            return `${$translate.instant('Js.Spinbox.MaxTextNote')} ${ctrl.getMaxAvailableValue()}`;
        }
        if (type === spinboxTooltipTextType.multiplicity) {
            return `${$translate.instant('Js.Spinbox.MultiplicityTextNote')} ${ctrl.getStep()}`;
        }
        return '';
    };

    ctrl.setValidationText = (text) => {
        ctrl.validationText = text;
    };

    ctrl.getMinAvailableValue = () => ctrl._min;
    ctrl.getMaxAvailableValue = () => ctrl._max;
    ctrl.getStep = () => ctrl._step;
}
