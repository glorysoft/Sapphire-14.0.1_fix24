/* @ngInject */
const modulesController = function (modulesService, toaster, $window, $translate, SweetAlert, advTrackingService) {
    const ctrl = this;

    const _validateFilter = {
        range: (term, value, key) => !(typeof term.from !== 'undefined' && term.from !== null && term.from > value[key] && term.to < value[key]),

        select: (term, value, _key) => value === term,

        input: (term, value, key) =>
            !(
                term !== '' &&
                value[key].toLowerCase().indexOf(term.toLowerCase()) === -1 &&
                value.StringId.toLowerCase().indexOf(term.toLowerCase()) === -1
            ),

        category: (term, value, key) => !(!value[key] || value[key].toLowerCase().indexOf(term.toLowerCase()) === -1),
    };

    ctrl.gridParams = {};
    ctrl.columns = [];
    ctrl.dataLoaded = false;
    ctrl.gridSearchPlaceholder ||= $translate.instant('Admin.Js.Modules.EnterTextToSearch');
    ctrl.filterColumnDefs = [
        {
            filter: {
                placeholder: $translate.instant('Admin.Js.Modules.Name'),
                type: 'input',
                name: 'Name',
            },
        },
        {
            filter: {
                name: 'Enabled',
                placeholder: $translate.instant('Admin.Js.Modules.Activity'),
                type: 'select',
                selectOptions: [
                    { label: $translate.instant('Admin.Js.Modules.TheyActive'), value: true },
                    { label: $translate.instant('Admin.Js.Modules.TheyInactive'), value: false },
                ],
            },
        },
    ];

    ctrl.onInit = function () {
        ctrl.getModules().then(() => {
            ctrl.filterApply([{ name: 'search', value: ctrl.filterStart }]);
            ctrl.changeShowLabelActivity();
            ctrl.needUpdateModules = ctrl.modulesData.some((item) => item.Version !== item.CurrentVersion);
        });
        ctrl.filterParams = {};
    };

    ctrl.filterModal = function (value) {
        let result = true;

        for (const key in ctrl.filterParams) {
            if (!Object.hasOwn(ctrl.filterParams, key)) {
                continue;
            }

            const term = ctrl.filterParams[key].filter.term;
            const type = ctrl.filterParams[key].filter.type;

            if (typeof term === 'undefined' || term === null) {
                continue;
            }

            if (typeof _validateFilter[type] !== 'undefined' && !_validateFilter[type](term, value, key)) {
                result = false;
                break;
            }
        }

        return result;
    };

    ctrl.getFiltersMarket = function (_) {
        return [
            {
                filter: {
                    placeholder: $translate.instant('Admin.Js.Modules.Name'),
                    type: 'input',
                    name: 'Name',
                },
            },
        ];
    };

    ctrl.filterApply = function (params, item) {
        if (typeof params === 'undefined' || params === null) return;

        const obj = params.filter((x) => x.name === 'search')[0];

        if (typeof obj !== 'undefined' && obj !== null && obj.name === 'search') {
            ctrl.filterParams.Name = {
                filter: {
                    placeholder: $translate.instant('Admin.Js.Modules.Name'),
                    type: 'input',
                    term: obj.value,
                    name: 'Name',
                },
            };
        } else if (typeof item !== 'undefined' && item !== null) {
            //ctrl.filterParams[item.filter.type === 'range' ? item.filter.name : name] = item;
            ctrl.filterParams[item.filter.name] = item;
        }

        ctrl.modulesData = ctrl.modulesMaster.filter(ctrl.filterModal);
    };

    ctrl.filterRemove = function (name, item) {
        if (item.filter.type === 'range') {
            Reflect.deleteProperty(ctrl.gridParams, item.filter.rangeOptions.from.name);
            Reflect.deleteProperty(ctrl.gridParams, item.filter.rangeOptions.to.name);
        }
        if (item.filter.type === 'datetime') {
            Reflect.deleteProperty(ctrl.gridParams, item.filter.datetimeOptions.from.name);
            Reflect.deleteProperty(ctrl.gridParams, item.filter.datetimeOptions.to.name);
        } else {
            Reflect.deleteProperty(ctrl.gridParams, name);
        }

        ctrl.modulesData = ctrl.modulesMaster.filter(ctrl.filterModal);
    };

    ctrl.getModules = function () {
        return modulesService[ctrl.pageType ? 'getLocalModules' : 'getMarketModules']().then((modulesData) => {
            ctrl.dataLoaded = true;

            if (!ctrl.pageType) {
                ctrl.categories = modulesData.map((mod) => mod.CategoryName).filter((val, ind, arr) => arr.indexOf(val) === ind && Boolean(val));
            } else {
                modulesData.sort((firstModule, secondModule) => new Date(firstModule.DateAdded) - new Date(secondModule.DateAdded));
            }

            ctrl.modulesMaster = angular.copy(modulesData);
            ctrl.modulesData = angular.copy(modulesData);
            return modulesData;
        });
    };

    ctrl.installModule = function (module) {
        SweetAlert.info(null, {
            title: `<i class="fa fa-spinner fa-spin"></i>&nbsp;${$translate.instant('Admin.Js.Modules.ModuleInstalling')}`,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
        });

        modulesService
            .installModule(module.StringId, module.Id, module.Version)
            .then((url) => {
                $window.location = url;
                toaster.pop('success', '', $translate.instant('Admin.Js.Modules.ModuleIsInstalled'));
            })
            .catch((_error) => {
                swal.close();
                toaster.pop('error', '', $translate.instant('Admin.Js.Modules.ErrorInstallingModule'));
            })
            .finally(() => {
                if (ctrl.previewPage === true) {
                    advTrackingService.trackEvent('SalesChannels_Interest', module.StringId);
                }
            });
    };

    ctrl.setPreviewShowed = function (module) {
        modulesService.setPreviewShowed(module.StringId).then((url) => {
            if (typeof url !== 'undefined' && url !== null) {
                $window.location = url;
            }
        });
    };

    ctrl.updateModule = function (module) {
        SweetAlert.info(null, {
            title: `<i class="fa fa-spinner fa-spin"></i>&nbsp;${$translate.instant('Admin.Js.Modules.ModuleUpdating')}`,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
        });

        modulesService
            .updateModule(module.StringId, module.Id, module.Version)
            .then(() => {
                $window.location.reload(true);
            })
            .catch((error) => {
                if (error === 'Forbidden')
                    SweetAlert.confirm(null, {
                        title: $translate.instant('Admin.Js.Modules.ModuleUpdating.ErrorTitle'),
                        html: $translate.instant('Admin.Js.Modules.ModuleUpdating.ErrorBody'),
                        showConfirmButton: true,
                        showCancelButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                    }).then(() => {
                        swal.close();
                        $window.location.reload(true);
                    });
            });
    };

    ctrl.updateAllModules = function () {
        SweetAlert.info(null, {
            title: $translate.instant('Admin.Js.Modules.UpdatingAllModules'),
            html: '<i class="fa fa-spinner fa-spin"></i>',
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
        });

        modulesService
            .updateAllModules(ctrl.modulesData)
            .then(() => {
                $window.location.reload(true);
            })
            .catch(() => {
                swal.close();
            });
    };

    ctrl.changeEnabled = function (state, name) {
        modulesService
            .changeEnabled(name, state)
            .then((data) => {
                ctrl.changeShowLabelActivity();

                if (!data.saasAndPaid || state) {
                    const message = state
                        ? $translate.instant('Admin.Js.Modules.ModuleIsActivated')
                        : $translate.instant('Admin.Js.ModuleIsNotActive');

                    toaster.pop('success', '', message);
                } else {
                    SweetAlert.info('', {
                        title: '',
                        html: $translate.instant('Admin.Js.Modules.DeactivatedAndPayable'),
                    });
                }
            })
            .catch((_error) => {
                toaster.pop('error', '', $translate.instant('Admin.Js.Modules.ErrorChangingActivity'));
            });
    };

    ctrl.uninstallModule = function (module, isRedirect) {
        if (typeof ctrl.moduleInProcess !== 'undefined' && ctrl.moduleInProcess !== null) {
            return;
        }

        ctrl.moduleInProcess = module;

        modulesService
            .uninstallModule(module.StringId)
            .then(() => {
                toaster.pop('success', '', $translate.instant('Admin.Js.Modules.ModuleWasDeleted'));

                if (isRedirect) {
                    const basePath = document.getElementsByTagName('base')[0].getAttribute('href');
                    $window.location.assign(basePath);
                } else {
                    $window.location.reload(true);
                }
            })
            .catch((error) => toaster.pop('error', '', error))
            .finally(() => {
                ctrl.moduleInProcess = null;
            });
    };

    ctrl.IsVisibleUpdateAll = function () {
        for (let i = 0; ctrl.modulesData.length > i; i++) {
            if (
                !ctrl.modulesData[i].IsLocalVersion &&
                !ctrl.modulesData[i].IsCustomVersion &&
                ctrl.modulesData[i].IsInstall &&
                ctrl.modulesData[i].Active &&
                ctrl.modulesData[i].Version !== ctrl.modulesData[i].CurrentVersion
            ) {
                return true;
            }
        }
        return false;
    };

    ctrl.selectCategory = function (category) {
        ctrl.selectedCategory = category;
        ctrl.filterParams.CategoryName = {
            filter: {
                type: 'category',
                term: category,
                name: 'CategoryName',
            },
        };
        ctrl.modulesData = ctrl.modulesMaster.filter(ctrl.filterModal);
    };

    ctrl.changeShowLabelActivity = function () {
        ctrl.haveEnabledModules = ctrl.modulesData.some((mod) => mod.Enabled);
        ctrl.haveDisabledModules = ctrl.modulesData.some((mod) => !mod.Enabled && mod.IsInstall);
    };
};

export default modulesController;
