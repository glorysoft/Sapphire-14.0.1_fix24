import templateUrl from './templates/fivePostRateDeliverySLReference.html';
(function (ng) {
    

    const FivePostRateDeliverySLReferenceCtrl = function () {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.mappedData = [];
            ctrl.deliverySlList = JSON.parse(ctrl.deliverySlJson);
            let rateDeliverySlReference = [];
            if (ctrl.references) {
                rateDeliverySlReference = ctrl.references
                    .split(';')
                    .map((x) => {
                        const arr = x.split(':');
                        return {
                            rateCode: arr[0],
                            deliverySlList: arr[1].split(','),
                        };
                    });
            }

            ctrl.mappedData = [];

            if (ctrl.rates) {
                ctrl.rates.forEach((rate) => {
                    const rateDeliverySl = rateDeliverySlReference.find(x => x.rateCode == rate.Value);
                    ctrl.mappedData.push(rateDeliverySl == null || rateDeliverySl.deliverySlList == null
                        ? []
                        : rateDeliverySl.deliverySlList.filter(deliverySlCode => ctrl.deliverySlList.some(deliverySl => deliverySl.Value == deliverySlCode)));
                });
            }
        };
        ctrl.getReference = function () {
            const referenceList = [];
            for (const index in ctrl.mappedData) {
                const deliverySl = ctrl.mappedData[index];
                if (deliverySl.length == 0)
                    continue;
                referenceList.push(`${ctrl.rates[index].Value  }:${  deliverySl.join(',')}`);
            }
            return referenceList.join(';');
        };
    };
    FivePostRateDeliverySLReferenceCtrl.$inject = [];
    ng.module('shippingMethod')
        .controller('FivePostRateDeliverySLReferenceCtrl', FivePostRateDeliverySLReferenceCtrl)
        .component('fivePostRateDeliverySLReference', {
            templateUrl,
            controller: 'FivePostRateDeliverySLReferenceCtrl',
            bindings: {
                onInit: '&',
                deliverySlJson: '@',
                references: '@',
                rates: '=',
            },
        });
})(window.angular);
