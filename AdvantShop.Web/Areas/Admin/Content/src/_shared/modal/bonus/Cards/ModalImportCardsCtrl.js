(function (ng) {
    

    const ModalImportCardsCtrl = function ($uibModalInstance, $http, $window, toaster, $q, $translate) {
        const ctrl = this;
        ctrl.exportNotStarted = false;

        ctrl.params = {
            accrueBonuses: false,
        };

        ctrl.isStartExport = false;

        ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.close = function () {
            $uibModalInstance.close('close');
        };

        ctrl.onBeforeSend = function () {
            $http.post('ExportImportCommon/GetCommonStatistic').then((response) => {
                const data = response.data;

                if (data.IsRun) {
                    ctrl.exportNotStarted = true;
                    toaster.error(
                        '',
                        `${$translate.instant('Admin.Js.CommonStatistic.AlreadyRunning') 
                            } <a href="${ 
                            data.CurrentProcess 
                            }">${ 
                            data.CurrentProcessName || data.CurrentProcess 
                            }</a>`,
                    );
                }
            });
        };

        ctrl.onSuccess = function () {
            if (ctrl.exportNotStarted) {
                $uibModalInstance.dismiss('cancel');
                return;
            }
            ctrl.btnLoading = true;
            ctrl.isStartExport = true;
            toaster.pop('success', $translate.instant('Admin.Js.Cards.CardsImportStarted'));
        };

        ctrl.getLogFile = function () {
            $http({
                url: 'ExportImportCommon/GetLogFile',
                method: 'POST',
                params: {},
                headers: {
                    'Content-type': 'application/txt',
                },
                responseType: 'arraybuffer',
            }).then((response) => {
                const data = response.data;
                const file = new Blob([data], {
                    type: 'application/txt',
                });

                ctrl.logFile = URL.createObjectURL(file);
            });
        };
    };

    ModalImportCardsCtrl.$inject = ['$uibModalInstance', '$http', '$window', 'toaster', '$q', '$translate'];

    ng.module('uiModal').controller('ModalImportCardsCtrl', ModalImportCardsCtrl);
})(window.angular);
