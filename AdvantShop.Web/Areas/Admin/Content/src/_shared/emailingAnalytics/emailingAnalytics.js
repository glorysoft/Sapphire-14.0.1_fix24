import emailingAnalyticsTemplate from './templates/emailingAnalytics.html';
(function (ng) {
    

    const refetchFields = ['emailDateFrom', 'emailDateTo'];
    const EmailingAnalyticsCtrl = function ($http, $httpParamSerializer) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.fetch();
        };
        ctrl.$onChanges = function (changes) {
            const needRefetch = refetchFields.some((item) => changes[item] != null && changes[item].isFirstChange() === false && changes[item].previousValue !== changes[item].currentValue);
            if (needRefetch === true) {
                ctrl.fetch();
            }
        };
        ctrl.fetch = function () {
            ctrl.dataLoaded = false;
            $http
                .get(ctrl.emailDataUrl, {
                    params: {
                        
                        id: ctrl.emailingId,
                            dateFrom: ctrl.emailDateFrom,
                            dateTo: ctrl.emailDateTo,
                        ...ctrl.requestParams || {},
                    },
                })
                .then((response) => {
                    ctrl.chartData = response.data.obj.ChartData;
                    ctrl.statusesData = response.data.obj.StatusesData;
                    if (ctrl.onChangeDate != null) {
                        ctrl.onChangeDate({
                            dateFrom: ctrl.emailDateFrom,
                            dateTo: ctrl.emailDateTo,
                        });
                    }
                })
                .finally(() => {
                    ctrl.dataLoaded = true;
                });
        };
        ctrl.getStatusUrlParams = function (statusName) {
            let dateParams = '';
            if (ctrl.emailDateFrom != '' && ctrl.emailDateFrom != undefined) {
                if (ctrl.emailDateFrom instanceof Date) ctrl.emailDateFrom = ctrl.emailDateFrom.toISOString().split('T')[0];
                if (ctrl.hideFlatpickr) ctrl.emailDateFrom = ctrl.emailDateFrom.split('T')[0].replace('"', '');
                dateParams += `"DateFrom":"${  ctrl.emailDateFrom.split('.').reverse().join('-')  }"`;
            }
            if (ctrl.emailDateTo != '' && ctrl.emailDateTo != undefined) {
                if (ctrl.emailDateTo instanceof Date) ctrl.emailDateTo = ctrl.emailDateTo.toISOString().split('T')[0];
                if (ctrl.hideFlatpickr) ctrl.emailDateTo = ctrl.emailDateTo.split('T')[0].replace('"', '');
                dateParams += `${dateParams == '' ? '"DateFrom":"",' : ','  }"DateTo":"${  ctrl.emailDateTo.split('.').reverse().join('-')  }"`;
            }
            let statusParams = '';
            if (statusName) {
                statusParams = `"Statuses":"${  statusName  }"`;
            }
            if (dateParams != '' || statusParams != '') {
                //return '#?' + ctrl.gridName + '={' + dateParams + (dateParams == '' || statusParams == '' ? '' : ',') + statusParams + '}';
                return `{${  dateParams  }${dateParams == '' || statusParams == '' ? '' : ','  }${statusParams  }}`;
            }
            return '{}';
        };
        ctrl.getStatusUrlParamsForMVC = function (statusName) {
            const data = JSON.parse(ctrl.getStatusUrlParams(statusName));
            return $httpParamSerializer(data);
        };
    };
    EmailingAnalyticsCtrl.$inject = ['$http', '$httpParamSerializer'];
    ng.module('emailingAnalytics', [])
        .controller('EmailingAnalyticsCtrl', EmailingAnalyticsCtrl)
        .component('emailingAnalytics', {
            templateUrl: emailingAnalyticsTemplate,
            controller: 'EmailingAnalyticsCtrl',
            bindings: {
                emailingId: '@',
                emailSubject: '@',
                sendTime: '@',
                emailLogUrl: '<?',
                emailComeBackUrl: '<?',
                emailDataUrl: '@',
                emailDateFrom: '<?',
                emailDateTo: '<?',
                hideFlatpickr: '<',
                emailComeBackClick: '&',
                emailLogClick: '&',
                onChangeDate: '&',
                hideComeBackLink: '<',
                requestParams: '<?',
            },
        });
})(window.angular);
