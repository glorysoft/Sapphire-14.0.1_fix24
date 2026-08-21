(function (ng) {
    

    const TriggerActionSendRequestCtrl = function ($http) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.mode = ctrl.action.IsNew === true ? 'add' : 'edit';

            ctrl.methodOptions = [
                { label: 'GET', value: 0 },
                { label: 'POST', value: 1 },
            ];

            if (ctrl.action.RequestMethod == null) {
                ctrl.action.RequestMethod = 0;
            }
        };

        ctrl.addParam = function () {
            ctrl.action.SendRequestData.RequestParams = ctrl.action.SendRequestData.RequestParams || [];

            ctrl.action.SendRequestData.RequestParams.push({ Key: ctrl.newParamKey, Value: ctrl.newParamValue });

            ctrl.newParamKey = null;
            ctrl.newParamValue = null;
        };

        ctrl.removeParam = function (item) {
            ctrl.action.SendRequestData.RequestParams = ctrl.action.SendRequestData.RequestParams.filter((x) => !angular.equals(x, item));
        };

        ctrl.getSendRequestParameters = function () {
            let str = '';
            if (ctrl.sendRequestParameters != null) {
                for (let i = 0; i < ctrl.sendRequestParameters.length; i++) {
                    str += (i != 0 ? ', ' : '') + ctrl.sendRequestParameters[i];
                }
            }
            return str;
        };

        ctrl.addHeaderParam = function () {
            ctrl.action.SendRequestData.RequestHeaderParams = ctrl.action.SendRequestData.RequestHeaderParams || [];

            ctrl.action.SendRequestData.RequestHeaderParams.push({
                Key: ctrl.newHeaderParamKey,
                Value: ctrl.newHeaderParamValue,
            });

            ctrl.newHeaderParamKey = null;
            ctrl.newHeaderParamValue = null;
        };

        ctrl.removeHeaderParam = function (item) {
            ctrl.action.SendRequestData.RequestHeaderParams = ctrl.action.SendRequestData.RequestHeaderParams.filter((x) => !angular.equals(x, item));
        };
    };

    TriggerActionSendRequestCtrl.$inject = ['$http'];

    ng.module('triggers').controller('TriggerActionSendRequestCtrl', TriggerActionSendRequestCtrl);
})(window.angular);
