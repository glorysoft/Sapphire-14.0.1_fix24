import { fixGS, hasGS } from '../../../_shared/gs-symbol/gs-symbol.helper.js';

(function (ng) {
    const ModalChangeMarkingCtrl = /* @ngInject */ function (
        $uibModalInstance,
        $window,
        toaster,
        $q,
        $http,
        $translate,
        settingFeaturesService,
        settingFeaturesKey,
    ) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.orderItemId = params.orderItemId;

            settingFeaturesService.isEnabled(settingFeaturesKey.GsSymbolAutoFix).then((isEnabled) => {
                ctrl.gsSymbolAutoFix = isEnabled;
            });

            ctrl.getItems();
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getItems = function () {
            $http.get('orders/getMarking', { params: { orderItemId: ctrl.orderItemId } }).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    ctrl.codes = data.obj.Codes;
                    ctrl.name = data.obj.Name;
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', '', error);
                    });
                }
            });
        };

        ctrl.save = function () {
            let codesNormalize = [];
            if (ctrl.gsSymbolAutoFix) {
                let codesItemTemp;
                const errorsFix = [];
                const paddedCodes = [];
                for (const codesItem of ctrl.codes) {
                    if (typeof codesItem === 'undefined' || codesItem === null || codesItem.length === 0) {
                        codesNormalize.push(codesItem);
                        continue;
                    }

                    codesItemTemp = hasGS(codesItem) ? { data: codesItem } : fixGS(codesItem);

                    if (typeof codesItemTemp.error !== 'undefined') {
                        errorsFix.push(`${codesItemTemp.error}: ${codesItem}`);
                    } else {
                        if (codesItemTemp.gtinPadded) {
                            paddedCodes.push(codesItem);
                        }
                        codesNormalize.push(codesItemTemp.data);
                    }
                }
                if (errorsFix.length > 0) {
                    toaster.pop('error', 'Отмена сохранения из-за ошибок авто-исправления GS-символов', errorsFix.join('<br>'));
                    return;
                }
                if (paddedCodes.length > 0) {
                    toaster.pop('warning', 'GTIN дополнен ведущими нулями до 14 знаков', paddedCodes.join('<br>'));
                }
            } else {
                codesNormalize = ctrl.codes;
            }

            $http.post('orders/saveMarking', { orderItemId: ctrl.orderItemId, codes: codesNormalize }).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.Order.DataSavedSuccessfully'));
                    $uibModalInstance.close();
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', '', error);
                    });
                }
            });
        };
    };

    ng.module('uiModal').controller('ModalChangeMarkingCtrl', ModalChangeMarkingCtrl);
})(window.angular);
