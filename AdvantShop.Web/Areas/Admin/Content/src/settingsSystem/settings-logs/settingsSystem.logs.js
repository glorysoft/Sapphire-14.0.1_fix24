(function (ng) {
    

    const SettingsSystemLogsCtrl = function (
        $location,
        settingsSystemLogsService,
        SweetAlert,
        $translate,
        $window,
        uiGridCustomConfig,
        uiGridConstants,
    ) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.enumViewMode = {
                list: 'list',
                details: 'details',
            };

            ctrl.enumTypes = {
                err500: 'err500',
                errHTTP: 'errHTTP',
                info: 'info',
                errModule: 'errModule',
                warn: 'warn',
            };

            ctrl.enumFields = {
                exception: 'ExceptionData',
                request: 'RequestData',
                browser: 'BrowserData',
                session: 'SessionData',
            };

            ctrl.enumJobsTypes = {
                scheduler: 'scheduler',
                runs: 'runs',
                runLogs: 'runLogs',
            };

            let paramsFromUrl = $location.search(),
                paramsFromUrlParsed;

            if (paramsFromUrl != null && paramsFromUrl.settingsLogs != null) {
                paramsFromUrlParsed = JSON.parse(paramsFromUrl.settingsLogs);

                if (paramsFromUrlParsed.viewMode != null) {
                    if (paramsFromUrlParsed.viewMode) {
                        ctrl.viewMode = paramsFromUrlParsed.viewMode;
                    }

                    if (paramsFromUrlParsed.type) {
                        ctrl.type = paramsFromUrlParsed.type;
                    }

                    if (paramsFromUrlParsed.viewMode === ctrl.enumViewMode.list) {
                        ctrl.changeType(paramsFromUrlParsed.type);
                    } else if (paramsFromUrlParsed.viewMode === ctrl.enumViewMode.details) {
                        if (paramsFromUrlParsed.time) {
                            ctrl.itemDatetime = paramsFromUrlParsed.time;
                        }

                        if (paramsFromUrlParsed.field) {
                            ctrl.field = paramsFromUrlParsed.field;
                        }

                        if (paramsFromUrlParsed.page) {
                            ctrl.page = paramsFromUrlParsed.page;
                        }

                        ctrl.goToDetails(ctrl.type, ctrl.itemDatetime, ctrl.page, ctrl.field);
                    }
                }
            } else {
                ctrl.viewMode = ctrl.enumViewMode.list;
                ctrl.type = ctrl.enumTypes.err500;
                ctrl.getLogs(ctrl.enumTypes.err500);
            }
        };

        ctrl.changeType = function (type) {
            ctrl.type = type;
            ctrl.page = 1;

            if (type !== 'jobs') {
                ctrl.getLogs(type).then(() => {
                    ctrl.setUrlParams(ctrl.viewMode, type, ctrl.page);
                });
            } else {
                ctrl.changeLogsViewType(ctrl.enumJobsTypes.scheduler);
                ctrl.getSchedulerJobs();
            }
        };

        ctrl.getSchedulerJobs = function () {
            return settingsSystemLogsService.getSchedulerJobs().then((result) => {
                ctrl.jobs = result;
            });
        };

        ctrl.getLogs = function (type, page) {
            return settingsSystemLogsService.getLogs(type, page).then((result) => (ctrl.data = result.obj));
        };

        ctrl.goToList = function () {
            ctrl.viewMode = ctrl.enumViewMode.list;

            ctrl.getLogs(ctrl.type, ctrl.page).then(() => {
                ctrl.setUrlParams(ctrl.viewMode, ctrl.type, ctrl.page);
            });

            ctrl.dataDetails = null;

            //ctrl.setUrlParams(ctrl.viewMode, ctrl.type, ctrl.page);
        };

        ctrl.changeField = function (field) {
            ctrl.field = field;
            ctrl.setUrlParams(ctrl.viewMode, ctrl.type, ctrl.page, field, ctrl.itemDatetime);
        };

        ctrl.goToDetails = function (type, datetime, page, field) {
            ctrl.viewMode = ctrl.enumViewMode.details;

            ctrl.field = field || ctrl.enumFields.exception;

            ctrl.itemDatetime = datetime;

            settingsSystemLogsService.getLogsItem(type, datetime, page).then((result) => {
                const exceptionColectionData = {};

                if (result.obj != null && result.obj.ExceptionData != null) {
                    for (const key in result.obj.ExceptionData) {
                        if (Object.hasOwn(result.obj.ExceptionData, key)) {
                            exceptionColectionData[key] = result.obj.ExceptionData[key];
                            delete result.obj.ExceptionData[key];
                        }
                    }

                    result.obj.ExceptionData.ColectionData = exceptionColectionData;
                }

                ctrl.dataDetails = result.obj;

                ctrl.setUrlParams(ctrl.viewMode, type, page, ctrl.field, datetime);
            });
        };

        ctrl.changePagination = function (page) {
            ctrl.page = page;
            ctrl.getLogs(ctrl.type, page);
        };

        ctrl.serializeFieldValue = function (value) {
            return ng.isObject(value) ? JSON.stringify(value) : value;
        };

        ctrl.setUrlParams = function (viewMode, type, page, field, itemDatetime) {
            const params = JSON.stringify({
                viewMode,
                type,
                page,
                field,
                time: itemDatetime,
            });

            $location.search('settingsLogs', params);
        };

        ctrl.removeLogs = function (type) {
            SweetAlert.confirm($translate.instant('Admin.Js.Partials.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.Partials.Deleting'),
            }).then((result) => {
                if (result === true || result.value) {
                    settingsSystemLogsService.removeLogs(type).then((response) => {
                        ctrl.getLogs(type, 0);
                    });
                }
            });
        };

        ctrl.changeLogsViewType = function (logViewType) {
            ctrl.logViewType = logViewType;
        };

        ctrl.jobRunsGridColumnDefs = [
            {
                name: 'Id',
                displayName: 'Id',
                width: 150,
                enableCellEdit: false,
                enableSorting: true,
            },
            {
                name: 'NameFormatted',
                displayName: 'Название',
                enableCellEdit: false,
                enableSorting: true,
                filter: {
                    placeholder: 'Название',
                    type: uiGridConstants.filter.INPUT,
                    name: 'Name',
                },
            },
            {
                name: 'Group',
                displayName: 'Группа',
                width: 150,
                enableCellEdit: false,
                enableSorting: true,
                filter: {
                    placeholder: 'Группа',
                    type: uiGridConstants.filter.INPUT,
                    name: 'Group',
                },
            },
            {
                name: 'Initiator',
                displayName: 'Инициатор',
                width: 100,
                enableCellEdit: false,
                enableSorting: true,
                filter: {
                    placeholder: 'Инициатор',
                    type: uiGridConstants.filter.INPUT,
                    name: 'Initiator',
                },
            },
            {
                name: 'Status',
                displayName: 'Статус',
                width: 150,
                enableCellEdit: false,
                enableSorting: true,
                filter: {
                    placeholder: 'Статус',
                    type: uiGridConstants.filter.SELECT,
                    name: 'Status',
                    fetch: 'settingsSystem/GetJobRunStatuses',
                },
            },
            {
                name: 'StartDateFormatted',
                displayName: 'Дата начала',
                width: 200,
                enableCellEdit: false,
                enableSorting: true,
                filter: {
                    placeholder: 'Дата начала',
                    type: 'datetime',
                    term: {
                        from: new Date(new Date().setDate(new Date().getDate() - 1)),
                        to: new Date(),
                    },
                    datetimeOptions: {
                        from: { name: 'StartDateFrom' },
                        to: { name: 'StartDateTo' },
                    },
                },
            },
            {
                name: 'EndDateFormatted',
                displayName: 'Дата окончания',
                width: 200,
                enableCellEdit: false,
                enableSorting: true,
                filter: {
                    placeholder: 'Дата окончания',
                    type: 'datetime',
                    term: {
                        from: new Date(new Date().setDate(new Date().getDate() - 1)),
                        to: new Date(),
                    },
                    datetimeOptions: {
                        from: { name: 'EndDateFrom' },
                        to: { name: 'EndDateTo' },
                    },
                },
            },
            {
                name: 'ExecutionTime',
                displayName: 'Время выполнения',
                width: 100,
                enableCellEdit: false,
                enableSorting: true,
                filter: {
                    placeholder: 'Время выполнения',
                    type: 'range',
                    rangeOptions: {
                        from: {
                            name: 'ExecutionTimeFrom',
                        },
                        to: {
                            name: 'ExecutionTimeTo',
                        },
                    },
                },
                cellTemplate: '<div class="ui-grid-cell-contents">{{COL_FIELD}} сек.</div>',
            },
            {
                name: '_serviceColumn',
                displayName: '',
                width: 50,
                enableSorting: false,
                cellTemplate:
                    '<div class="ui-grid-cell-contents" ng-if="row.entity.HasLogs"><div>' +
                    '<a href="" ng-click="grid.appScope.$ctrl.gridExtendCtrl.jobRunsGridDetails(row.entity)">' +
                    'Log' +
                    '</a>' +
                    '</div></div>',
            },
        ];
        ctrl.jobRunsGridOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs: ctrl.jobRunsGridColumnDefs,
            paginationPageSize: 100,
            paginationPageSizes: [100, 200, 500],
        });

        ctrl.jobRunsGridOnInit = function (jobRunsGrid) {
            ctrl.jobRunsGrid = jobRunsGrid;
        };

        ctrl.jobRunsGridExport = function () {
            ctrl.jobRunsGrid.export();
        };

        ctrl.jobRunsGridDetails = function (entity) {
            ctrl.jobRunsGridParams = ctrl.jobRunsGrid.getParams();
            ctrl.selectedJobRun = entity;
            ctrl.changeLogsViewType(ctrl.enumJobsTypes.runLogs);
        };

        ctrl.jobRunLogGridColumnDefs = [
            {
                name: 'Id',
                displayName: 'Id',
                width: 50,
                enableCellEdit: false,
                enableSorting: true,
            },
            {
                name: 'Event',
                displayName: 'Событие',
                width: 150,
                enableCellEdit: false,
                enableSorting: true,
                filter: {
                    placeholder: 'Событие',
                    type: uiGridConstants.filter.SELECT,
                    name: 'Event',
                    fetch: 'settingsSystem/GetJobRunLogEvents',
                },
            },
            {
                name: 'Message',
                displayName: 'Сообщение',
                enableCellEdit: false,
                enableSorting: true,
            },
            {
                name: 'AddDateFormatted',
                displayName: 'Дата события',
                width: 200,
                enableCellEdit: false,
                enableSorting: true,
                filter: {
                    placeholder: 'Дата события',
                    type: 'datetime',
                    term: {
                        from: new Date(new Date().setDate(new Date().getDate() - 1)),
                        to: new Date(),
                    },
                    datetimeOptions: {
                        from: { name: 'AddDateFrom' },
                        to: { name: 'AddDateTo' },
                    },
                },
            },
        ];
        ctrl.jobRunLogGridOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs: ctrl.jobRunLogGridColumnDefs,
        });

        ctrl.jobRunLogGridOnInit = function (jobRunLogGrid) {
            ctrl.jobRunLogGrid = jobRunLogGrid;
        };

        ctrl.jobRunLogGridExport = function () {
            ctrl.jobRunLogGrid.export();
        };
    };

    SettingsSystemLogsCtrl.$inject = [
        '$location',
        'settingsSystemLogsService',
        'SweetAlert',
        '$translate',
        '$window',
        'uiGridCustomConfig',
        'uiGridConstants',
    ];

    ng.module('settingsSystem').controller('SettingsSystemLogsCtrl', SettingsSystemLogsCtrl);
})(window.angular);
