import { fixGS, hasGS } from './gs-symbol.helper.js';

const MODULE_NAME = 'gs-symbol';

angular.module(MODULE_NAME, []).directive(
    'gsSymbol',
    /* @ngInject*/ (toaster, $parse, $timeout, settingFeaturesService, settingFeaturesKey) => ({
        restrict: 'A',
        require: 'ngModel',
        link: (scope, element, attrs, ngModelCtrl) => {
            settingFeaturesService.isEnabled(settingFeaturesKey.GsSymbolAutoFix).then((isEnabled) => {
                // element[0], а не деструктуризация: jqLite не итерируем, и без jQuery
                // деструктуризация бросает исключение прямо внутри .then — молча, через $q.
                const elementVanilla = element[0];

                let totalString = '';
                let altSequence = '';
                let altActive = false;
                let index = null;
                const values = [];
                let timer;
                let isHasGS = false;

                const autoFix = isEnabled ?? false;

                // Пишем и в DOM, и в ngModel: без $setViewValue модель остаётся со старым текстом.
                const applyValue = (newValue) => {
                    if (newValue === ngModelCtrl.$viewValue) {
                        return;
                    }

                    ngModelCtrl.$setViewValue(newValue);
                    ngModelCtrl.$render();
                };

                elementVanilla.addEventListener('keydown', (event) => {
                    // Handle Alt + Numpad sequence for ASCII codes
                    if (event.altKey) {
                        if (!altActive) {
                            altActive = true;
                            index = elementVanilla.selectionStart ?? elementVanilla.value.length;
                        }
                        // Only process digit keys when Alt is held
                        if (event.key >= '0' && event.key <= '9') {
                            altSequence += event.key;
                            event.preventDefault();
                            return;
                        }
                    }

                    // On Alt release, convert sequence to ASCII char
                    if (altActive && !event.altKey) {
                        // Без набранной последовательности (Alt+Tab и т.п.) ничего не вставляем
                        // и не сбрасываем авто-исправление.
                        if (altSequence) {
                            const asciiCode = parseInt(altSequence, 10);
                            totalString = String.fromCharCode(asciiCode);
                            altSequence = '';

                            values.push([index, totalString]);
                            isHasGS = true;
                        }

                        altActive = false;
                        index = null;
                        totalString = '';
                    }
                });
                // $timeout, а не setTimeout: обработчик меняет ngModel и должен идти внутри digest.
                elementVanilla.addEventListener('input', () => {
                    if (timer) {
                        $timeout.cancel(timer);
                    }
                    timer = $timeout(() => {
                        if (isHasGS) {
                            const chars = elementVanilla.value.split('');
                            // Индексы записаны по строке без вставок, поэтому каждая
                            // предыдущая вставка сдвигает следующую позицию вправо.
                            let insertedCount = 0;
                            // Каретку могли переставить руками — порядок ввода не гарантирует порядок позиций.
                            for (const [itemIndex, charCode] of [...values].sort((itemA, itemB) => itemA[0] - itemB[0])) {
                                chars.splice(itemIndex + insertedCount, 0, charCode);
                                insertedCount += charCode.length;
                            }
                            applyValue(chars.join(''));
                        } else if (autoFix && elementVanilla.value.length > 0 && !hasGS(elementVanilla.value)) {
                            const { error, data, gtinPadded } = fixGS(elementVanilla.value);

                            if (error) {
                                toaster.error(error);
                                return;
                            }

                            if (gtinPadded) {
                                toaster.warning('GTIN дополнен ведущими нулями до 14 знаков');
                            }

                            applyValue(data);
                        }
                        values.length = 0;
                        isHasGS = false;
                    }, 500);
                });

                scope.$on('$destroy', () => {
                    if (timer) {
                        $timeout.cancel(timer);
                    }
                });
            });
        },
    }),
);

export default MODULE_NAME;
