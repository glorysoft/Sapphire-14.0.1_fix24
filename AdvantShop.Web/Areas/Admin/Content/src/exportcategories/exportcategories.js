(function (ng) {
    

    const ExportCategoriesCtrl = function (
        $q,
        $location,
        $window,
        $interval,
        urlHelper,
        SweetAlert,
        toaster,
        $http,
        exportCategoriesService,
        $translate,
        isMobileService,
    ) {
        const ctrl = this;

        ctrl.defaultFields = [];

        ctrl.initExportFields = function (defaultFields) {
            ctrl.defaultFields = defaultFields;
            ctrl.settings = {
                exportCategoriesFields: [],
            };

            ctrl.setDefaultExportCategoriesFields();
        };

        ctrl.startExport = function () {
            console.log(ctrl.settings);
            return $http.post('exportcategories/SaveExportCategoriesSettings', ctrl.settings).then((response) => {
                if (response.data.result) {
                    exportCategoriesService.getCommonStatistic().then((response) => {
                        if (!response.IsRun) {
                            $window.location.assign('exportcategories/export/');
                        } else {
                            toaster.error(
                                '',
                                `${$translate.instant('Admin.Js.CommonStatistic.AlreadyRunning') 
                                    } <a href="${ 
                                    response.CurrentProcess 
                                    }">${ 
                                    response.CurrentProcessName || response.CurrentProcess 
                                    }</a>`,
                            );
                        }
                    });
                } else {
                    toaster.pop('error', response.data.errors[0]);
                }
            });
        };

        ctrl.interruptProcess = function () {
            exportCategoriesService.interruptProcess().then((response) => {
                toaster.pop('success', $translate.instant('Admin.Js.ExportCategories.ExportAborted'));
            });
        };

        ctrl.setNoneExportCategoriesFields = function () {
            for (let i = 0; i < ctrl.settings.exportCategoriesFields.length; i++) {
                ctrl.settings.exportCategoriesFields[i] = 'None';
            }
        };

        ctrl.setDefaultExportCategoriesFields = function () {
            for (let i = 0; i < ctrl.defaultFields.length; i++) {
                ctrl.settings.exportCategoriesFields[i] = ctrl.defaultFields[i];
            }
        };

        ctrl.progressValue = 0;
        ctrl.progressTotal = 0;
        ctrl.stop = 0;

        ctrl.progressCurrentProcess = '';
        ctrl.progressCurrentProcessName = '';
        ctrl.IsRun = true;
        ctrl.FileName = '';

        ctrl.initProgress = function () {
            ctrl.stop = $interval(() => {
                exportCategoriesService.getCommonStatistic().then((response) => {
                    ctrl.IsRun = response.IsRun;

                    if (!response.IsRun) {
                        $interval.cancel(ctrl.stop);
                        ctrl.FileName = response.FileName.indexOf('?') != -1 ? response.FileName : `${response.FileName  }?rnd=${  Math.random()}`;
                    }

                    ctrl.progressTotal = response.Total;
                    ctrl.progressValue = response.Processed;
                    ctrl.progressCurrentProcess = response.CurrentProcess;
                    ctrl.progressCurrentProcessName = response.CurrentProcessName;
                });
            }, 100);
        };
    };

    ExportCategoriesCtrl.$inject = [
        '$q',
        '$location',
        '$window',
        '$interval',
        'urlHelper',
        'SweetAlert',
        'toaster',
        '$http',
        'exportCategoriesService',
        '$translate',
        'isMobileService',
    ];

    ng.module('exportCategories', ['urlHelper', 'isMobile']).controller('ExportCategoriesCtrl', ExportCategoriesCtrl);
})(window.angular);
