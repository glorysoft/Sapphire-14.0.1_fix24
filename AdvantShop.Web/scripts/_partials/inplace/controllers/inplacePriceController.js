/* @ngInject */
function InplacePriceCtrl($scope, $timeout, inplaceService) {
    const ctrl = this;

    ctrl.callbacks = [];

    ctrl.$onInit = function () {
        ctrl.needReinit = {};

        ctrl.inplaceParams = ctrl.inplaceParams();
    };

    ctrl.active = function () {
        ctrl.startContent = ctrl.editor.getData();
        ctrl.isShow = true;
    };

    ctrl.save = function () {
        if (!ctrl.product || !ctrl.product.offerSelected) {
            return;
        }

        const content = ctrl.convertToFloat(ctrl.editor.getData());

        if (!content) {
            return;
        }

       const params = angular.extend(ctrl.inplaceParams, {
            content,
            id: ctrl.product.offerSelected.OfferId,
            field: ctrl.type,
        });

        inplaceService.save(ctrl.inplaceUrl, params).finally(() => {
            ctrl.isShow = false;
            ctrl.product.refreshPrice().then(() => {
                ctrl.setNeedReinit();
                $timeout(() => {
                    ctrl.callCallbacks(ctrl.callbacks); //когда изменилась верстка надо обновить позиция
                }, 300);
            });
        });
    };

    ctrl.setNeedReinit = function () {
        for (const key in ctrl.needReinit) {
            if (Object.hasOwn(ctrl.needReinit, key)) {
                ctrl.needReinit[key] = true;
            }
        }
    };

    ctrl.cancel = function () {
        ctrl.isShow = false;
        ctrl.editor.container.$.innerHTML = ctrl.startContent;
    };

    ctrl.convertToFloat = function (priceString) {
        let price = priceString
            .replace(/,/gu, '.')
            .replace(/ /gu, '')
            .replace(/&nbsp;/gu, '');

        if (priceString.length === 0) {
            price = 0;
        } else if (/^[0-9]+(?<group>\.[0-9][0-9])?$/u.test(price) === false) {
            price = null;
        } else {
            price = parseFloat(price);
        }

        return price;
    };

    ctrl.addCallback = function (callback) {
        ctrl.callbacks.push(callback);
    };

    ctrl.callCallbacks = function (callbacksArray) {
        callbacksArray.forEach((callback) => {
            callback();
        });
    };

    ctrl.destroy = function () {
        $scope.$destroy();
        //$element.remove();
    };
}

export default InplacePriceCtrl;
