import yandexTemplate from './yandex.tpl.html';

(function (ng) {
    

    ng.module('shippingYandex', [])
        .controller('ShippingYandexCtrl', [
            '$scope',
            'shippingService',
            function ($scope, shippingService) {
                const ctrl = this;

                ctrl.$onInit = function () {
                    ctrl.init();
                };

                ctrl.init = function () {
                    if (ctrl.isInit) return;
                    ctrl.isInit = true;
                    shippingService.fireTemplateReady($scope);
                    if (!ctrl.datesOfDelivery) ctrl.datesOfDelivery = ctrl.shipping.DatesOfDelivery || [];
                    if (!ctrl.timesOfDelivery) ctrl.timesOfDelivery = ctrl.shipping.TimesOfDelivery;
                    if (!ctrl.shipping.TimeOfDelivery && ctrl.shipping.SelectedInterval) ctrl.changeInterval();
                };

                ctrl.changeInterval = function () {
                    if (ctrl.shipping.SelectedInterval) {
                        ctrl.shipping.TimeOfDelivery = ctrl.getFormattedInerval(
                            ctrl.shipping.SelectedInterval.From,
                            ctrl.shipping.SelectedInterval.To,
                        );
                        ctrl.yandexCallback({
                            event: 'yandexIntervalDelivery',
                            field: ctrl.shipping.SelectedInterval || 0,
                        });
                    }
                };

                ctrl.getTimesOfDelivery = function (dateOfDelivery) {
                    return ctrl.timesOfDelivery[dateOfDelivery];
                };

                ctrl.getFormattedInerval = function (from, to) {
                    const _from = new Date(from);
                    const _to = new Date(to);
                    const fromHours = _from.getHours(),
                        fromMinutes = _from.getMinutes(),
                        fromTimeFormatted =
                            `${fromHours < 10 ? `0${  fromHours}` : fromHours  }:${  fromMinutes < 10 ? `0${  fromMinutes}` : fromMinutes}`;
                    const toHours = _to.getHours(),
                        toMinutes = _to.getMinutes(),
                        toTimeFormatted = `${toHours < 10 ? `0${  toHours}` : toHours  }:${  toMinutes < 10 ? `0${  toMinutes}` : toMinutes}`;

                    const offset = _from.getTimezoneOffset() / -60;
                    const offsetRemains = offset % 1;
                    let offsetStr = offset > 0 ? `+${  Math.trunc(offset)}` : Math.trunc(offset);
                    offsetStr = offsetRemains == 0 ? `${offsetStr  }:00` : `${offsetStr  }:${  offsetRemains * 60}`;
                    return `${fromTimeFormatted  }-${  toTimeFormatted  } (GMT ${  offsetStr  })`;
                };
            },
        ])
        .directive('shippingYandex', [
            'urlHelper',
            function (urlHelper) {
                return {
                    scope: {
                        shipping: '=',
                        yandexCallback: '&',
                    },
                    controller: 'ShippingYandexCtrl',
                    controllerAs: 'shippingYandex',
                    bindToController: true,
                    templateUrl: yandexTemplate,
                    link (scope, element, attrs, ctrl) {
                        ctrl.init();
                    },
                };
            },
        ]);
})(window.angular);
