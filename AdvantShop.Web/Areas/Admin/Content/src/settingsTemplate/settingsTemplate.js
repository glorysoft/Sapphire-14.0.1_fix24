import onePageCatalogConflictTemplate from './modal/onePageCatalogConflictSettings/onePageCatalogConflictSettings.html';

(function (ng) {
    const SettingsTemplateCtrl = /* @ngInject */ function (
        SweetAlert,
        toaster,
        $translate,
        designService,
        cmStatService,
        $http,
        $location,
        isMobileService,
        zoneService,
        $timeout,
        $uibModal,
        $window,
    ) {
        const ctrl = this;
        const isMobile = isMobileService.getValue();

        ctrl.$onInit = function () {
            ctrl.getData();
        };

        ctrl.getData = function () {
            return designService.getThemes().then((designData) => {
                ctrl.designData = designData;

                ctrl.CurrentTheme = ctrl.designData.Themes.find((theme) => theme.Name === ctrl.designData.CurrentTheme);
                ctrl.CurrentBackGround = ctrl.designData.BackGrounds.find((backGround) => backGround.Name === ctrl.designData.CurrentBackGround);
                ctrl.CurrentColorScheme = ctrl.designData.ColorSchemes.find((colorScheme) => colorScheme.Name === ctrl.designData.CurrentColorScheme);

                if (typeof ctrl.form !== 'undefined') {
                    ctrl.form.$setPristine();
                }
            });
        };

        ctrl.changeDesign = function (designType, name) {
            designService.saveDesign(designType, name).then((result) => {
                if (result === true) {
                    ctrl.getData().then(() => {
                        toaster.pop('success', '', $translate.instant('Admin.Js.Design.ChangesSaved'));
                    });
                } else {
                    toaster.pop('error', '', $translate.instant('Admin.Js.Design.ErrorWhileSavingDesign'));
                }
            });
        };

        ctrl.addDesign = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event, designType) {
            if (($event.type === 'change' || $event.type === 'drop') && typeof $file !== 'undefined') {
                designService.uploadDesign($file, designType).then((data) => {
                    const result = data.obj;
                    if (result === true) {
                        ctrl.getData().then(() => {
                            toaster.pop('success', '', $translate.instant('Admin.Js.Design.ArchiveSuccessfullyUploaded'));
                        });
                    } else if (typeof data.errors !== 'undefined') {
                        data.errors.forEach((error) => {
                            toaster.pop('error', '', error);
                        });
                    } else {
                        toaster.pop('error', '', $translate.instant('Admin.Js.Design.ErrorWhileLoading'));
                    }
                });
            } else if ($invalidFiles.length > 0) {
                toaster.pop('error', $translate.instant('Admin.Js.Design.ErrorWhileLoading'), $translate.instant('Admin.Js.Design.FileDoesNotMeet'));
            }
        };

        ctrl.deleteDesign = function (designType, designName) {
            SweetAlert.confirm($translate.instant('Admin.Js.Design.AreYouSureDelete'), { title: '' }).then((result) => {
                if (result === true || (result.value && !result.isDismissed)) {
                    designService.deleteDesign(designName, designType).then(
                        (resultDelete) => {
                            if (resultDelete === true) {
                                ctrl.getData().then(() => {
                                    toaster.pop('success', '', $translate.instant('Admin.Js.Design.SuccessfullyDeleted'));
                                });
                            } else {
                                toaster.pop('error', '', $translate.instant('Admin.Js.Design.ErrorWhileDeleting'));
                            }
                        },
                        () => {
                            toaster.pop('error', '', $translate.instant('Admin.Js.Design.ErrorWhileDeleting'));
                        },
                    );
                }
            });
        };

        // resize product pictures

        ctrl.resizePictures = function () {
            SweetAlert.confirm($translate.instant('Admin.Js.Design.DoYouWantSqueezePhotos'), {
                title: $translate.instant('Admin.Js.Design.SqueezePhotosOfProducts'),
            }).then((result) => {
                if (result === true || result.value === true) {
                    designService.resizePictures()
                        .then((response) => {
                            if (response.result) {
                                toaster.pop('success', '', $translate.instant('Admin.Js.Design.StartResize'));

                                if (response.obj) {
                                    ctrl.startResizePictures = true;
                                }
                            } else {
                                response.errors.forEach((error) => toaster.pop('error', '', error));
                            }
                        });
                }
            });
        };

        ctrl.cmStatOnTick = function (data) {
            if (data.IsRun === false && data.ProcessedPercent === 100) {
                ctrl.startResizePictures = false;
                cmStatService.deleteObsevarable();
            }
        };

        // resize big category pictures

        ctrl.resizeCategoryPictures = function (type) {
            SweetAlert.confirm($translate.instant('Admin.Js.Design.DoYouWantResizeCategoryPhotosText'), {
                title: $translate.instant('Admin.Js.Design.DoYouWantResizeCategoryPhotosTitle'),
            }).then((result) => {
                if (result === true || result.value === true) {
                    designService.resizeCategoryPictures(type)
                        .then((response) => {
                            if (response.result) {
                                toaster.pop('success', '', $translate.instant('Admin.Js.Design.StartResize'));

                                if (response.obj) {
                                    if (!ctrl.startResizeCategoryPictures) {
                                        ctrl.startResizeCategoryPictures = {};
                                    }
                                    ctrl.startResizeCategoryPictures[type] = true;
                                }
                            } else {
                                response.errors.forEach((error) => toaster.pop('error', '', error));
                            }
                        });
                }
            });
        };

        ctrl.cmResizeCategoryStatOnTick = function (data, type) {
            if (data.IsRun === false && data.ProcessedPercent === 100) {
                ctrl.startResizeCategoryPictures[type] = false;
                cmStatService.deleteObsevarable();
            }
        };

        ctrl.setAllProductsManualRatio = function () {
            if (typeof ctrl.ManualRatio === 'undefined') return;
            if (ctrl.ManualRatio < 0 || ctrl.ManualRatio > 5) {
                toaster.pop('error', '', 'Значение рейтинга может быть от 0 до 5');
                return;
            }
            $http.post('product/setAllProductsManualRatio', { manualRatio: ctrl.ManualRatio }).then((response) => {
                if (response.data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.ChangesSaved'));
                } else {
                    toaster.pop('error', '', $translate.instant('Admin.Js.ErrorWhileSaving'));
                }
            });
        };

        ctrl.memoryForm = function (form) {
            ctrl.form = form;
        };

        ctrl.isHidden = function (setting) {
            return typeof ctrl.HiddenSettings !== 'undefined' && ctrl.HiddenSettings.length > 0 && ctrl.HiddenSettings.indexOf(setting) > -1;
        };

        ctrl.scrollIntoView = function () {
            if (isMobile) {
                setTimeout(() => {
                    angular.element('li.active')[0].scrollIntoView({
                        inline: 'center',
                        block: 'nearest',
                        behavior: 'smooth',
                    });
                }, 10);
            }
        };

        ctrl.processCity = function (zone) {
            if (zone && zone.CityId) {
                ctrl.DefaultCityIdIfNotAutodetect = zone.CityId;

                if (zone.Name) {
                    ctrl.DefaultCityIfNotAutodetect = zone.Name;
                    ctrl.DefaultCityDescription = `${zone.Country}, ${zone.Region}`;
                    if (zone.District) {
                        ctrl.DefaultCityDescription += `, ${zone.District}`;
                    }
                }

                ctrl.changeCityName();
            }
        };

        ctrl.changeCityName = function () {
            if (ctrl.DefaultCityIfNotAutodetect) {
                zoneService.setCurrentZone(ctrl.DefaultCityIfNotAutodetect).then((response) => {
                    if (response) {
                        if (response.CityId === 0) {
                            ctrl.DefaultCityIdIfNotAutodetect = 0;
                        }
                    }
                });
            }
        };

        ctrl.toggleSettingOnePageCatalog = function (isEnabled) {
            if (isEnabled) {
                $http.get('./settings/onePageCatalogConflictSettings').then((response) => {
                    if (response.data.result === true) {
                        if (response.data.obj.IsExistConflictSettings) {
                            $uibModal
                                .open({
                                    templateUrl: onePageCatalogConflictTemplate,
                                    controller: 'OnePageCatalogConflictSettingsCtrl',
                                    controllerAs: '$ctrl',
                                    bindToController: true,
                                    resolve: { onePageCatalogData: response.data.obj },
                                })
                                .result.then(() =>
                                    $http.post('./settings/onePageCatalogSetActive', { isActive: true }).then(() => {
                                        $window.location.reload();
                                    }),
                                );
                        }
                    }
                });
            }
        };
    };

    ng.module('settingsTemplate', ['design', 'csseditor', 'isMobile']).controller('SettingsTemplateCtrl', SettingsTemplateCtrl);
})(window.angular);
