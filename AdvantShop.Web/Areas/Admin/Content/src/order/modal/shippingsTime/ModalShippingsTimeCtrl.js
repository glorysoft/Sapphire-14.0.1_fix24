import './shippingsTime.html';

(function (ng) {
    

    const ModalShippingsTimeCtrl = function ($uibModalInstance, $window, toaster, $q, $http, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.obj;
            ctrl.id = params.id;
            ctrl.isLead = params.isLead || false;
            ctrl.urlPath = !ctrl.isLead ? 'orders' : 'leads';

            ctrl.getDeliveryTime();
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getDeliveryTime = function () {
            $http.get(`${ctrl.urlPath  }/getDeliveryTime`, { params: { id: ctrl.id } }).then((response) => {
                const data = response.data;
                if (data != null) {
                    ctrl.data = data;
                    if (data.DeliveryInterval.TimeZoneOffset != null) {
                        const hours = Math.abs(Math.trunc(data.DeliveryInterval.TimeZoneOffset));
                        ctrl.timeZoneOffset = hours < 10 ? `0${  hours}` : hours;
                        const minutes = Math.round(Math.abs((data.DeliveryInterval.TimeZoneOffset % 1) * 60));
                        ctrl.timeZoneOffset += `:${  minutes < 10 ? `0${  minutes}` : minutes}`;
                        ctrl.gmtSign = data.DeliveryInterval.TimeZoneOffset >= 0 ? 1 : -1;
                    }
                    ctrl.readableDeliveryTime = data.DeliveryInterval.ReadableString;
                    ctrl.form.$setPristine();
                    ctrl.formInited = true;
                }
            });
        };

        ctrl.save = function () {
            if (ctrl.timeZoneOffset && !ctrl.gmtSign) return toaster.pop('error', '', 'Не выбран знак часового пояса');

            const params = {
                id: ctrl.id,
                deliveryDate: ctrl.data.DeliveryDate,
                deliveryTime: getDeliveryTime(),
            };

            $http.post(`${ctrl.urlPath  }/saveDeliveryTime`, params).then((response) => {
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

        ctrl.changeDeliveryTime = function () {
            const gmt = !ctrl.timeZoneOffset || !ctrl.gmtSign ? '' : ` (GMT ${  ctrl.gmtSign > 0 ? '+' : '-'  }${ctrl.timeZoneOffset  })`;
            if (ctrl.data.UseInterval && ctrl.data.DeliveryInterval.TimeFrom) {
                ctrl.readableDeliveryTime = `${ctrl.data.DeliveryInterval.TimeFrom  }-${  ctrl.data.DeliveryInterval.TimeTo  }${gmt}`;
            } else if (ctrl.data.DeliveryInterval.TimeFrom) {
                ctrl.readableDeliveryTime = ctrl.data.DeliveryInterval.TimeFrom + gmt;
            } else {
                ctrl.readableDeliveryTime = '';
            }
        };

        function getDeliveryTime() {
            if (!ctrl.data.UseInterval && !ctrl.data.DeliveryInterval.TimeFrom) return null;
            let deliveryTimeStr = ctrl.data.DeliveryInterval.TimeFrom;
            if (ctrl.data.UseInterval) deliveryTimeStr += `-${  ctrl.data.DeliveryInterval.TimeTo}`;
            if (ctrl.timeZoneOffset) {
                const timeZoneArr = ctrl.timeZoneOffset.split(':');
                let offset = Number(timeZoneArr[0]) + Number(timeZoneArr[1]) / 60;
                offset *= ctrl.gmtSign;
                deliveryTimeStr += `|${  offset}`;
            }
            return deliveryTimeStr;
        }
    };

    ModalShippingsTimeCtrl.$inject = ['$uibModalInstance', '$window', 'toaster', '$q', '$http', '$translate'];

    ng.module('uiModal').controller('ModalShippingsTimeCtrl', ModalShippingsTimeCtrl);
})(window.angular);
