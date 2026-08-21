(function (ng) {
    

    const SettingsCtrl = function (Upload, $http, toaster, $timeout, $translate, $location, isMobileService) {
        const ctrl = this;

        //ctrl.hasRegions = true;

        ctrl.init = function (langs) {
            ctrl.Langs = langs;
            const mass = langs.filter((item) => item.Selected === true);

            ctrl.langLocalization = mass.length > 0 ? mass[0] : null;
        };

        //start APi

        ctrl.generateApiKey = function () {
            $http.get('settingsApi/generate').then((response) => {
                ctrl.Key = response.data;
            });
        };

        ctrl.generateApiKeyAuth = function () {
            $http.get('settingsApi/generate').then((response) => {
                ctrl.KeyAuth = response.data;
            });
        };

        ctrl.showDetails = function (event) {
            angular.element(event.currentTarget).next('.details').toggle();
        };

        //end API

        ctrl.uploadLogo = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
            if (($event.type === 'change' || $event.type === 'drop') && $file != null) {
                Upload.upload({
                    url: '/settings/uploadlogo',
                    data: {
                        file: $file,
                        rnd: Math.random(),
                    },
                }).then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        ctrl.logoSrc = data.file;
                    } else {
                        toaster.pop('error', $translate.instant('Admin.Js.Settings.Settings.ErrorLoadingLogo'), data.error);
                    }
                });
            } else if ($invalidFiles.length > 0) {
                toaster.pop(
                    'error',
                    $translate.instant('Admin.Js.Settings.Settings.ErrorLoadingLogo'),
                    $translate.instant('Admin.Js.Settings.Settings.FileNotMeetRequirements'),
                );
            }
        };

        ctrl.uploadFavicon = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
            if (($event.type === 'change' || $event.type === 'drop') && $file != null) {
                Upload.upload({
                    url: '/settings/uploadfavicon',
                    data: {
                        file: $file,
                        rnd: Math.random(),
                    },
                }).then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        ctrl.faviconSrc = data.file;
                    } else {
                        toaster.pop('error', $translate.instant('Admin.Js.Settings.Settings.ErrorLoadingFaveicon'), data.error);
                    }
                });
            } else if ($invalidFiles.length > 0) {
                toaster.pop(
                    'error',
                    $translate.instant('Admin.Js.Settings.Settings.ErrorLoadingFaveicon'),
                    $translate.instant('Admin.Js.Settings.Settings.FileNotMeetRequirements'),
                );
            }
        };

        ctrl.uploadStamp = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
            if (($event.type === 'change' || $event.type === 'drop') && $file != null) {
                Upload.upload({
                    url: '/settings/uploadbankstamp',
                    data: {
                        file: $file,
                        rnd: Math.random(),
                    },
                }).then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        ctrl.stampSrc = data.file;
                    } else {
                        toaster.pop('error', $translate.instant('Admin.Js.Settings.Settings.ErrorLoadingStamp'), data.error);
                    }
                });
            } else if ($invalidFiles.length > 0) {
                toaster.pop(
                    'error',
                    $translate.instant('Admin.Js.Settings.Settings.ErrorLoadingStamp'),
                    $translate.instant('Admin.Js.Settings.Settings.FileNotMeetRequirements'),
                );
            }
        };

        ctrl.deleteLogo = function () {
            $http.post('/settings/deletelogo').then((response) => {
                ctrl.logoSrc = response.data.file;
            });
        };

        ctrl.deleteFavicon = function () {
            $http.post('/settings/deletefavicon').then((response) => {
                ctrl.faviconSrc = response.data.file;
            });
        };

        ctrl.deleteStamp = function () {
            $http.post('/settings/deletebankstamp').then((response) => {
                ctrl.stampSrc = response.data.file;
            });
        };

        ctrl.loadRegions = function (currentRegion) {
            ctrl.hasRegions = true;

            $http
                .post('/settings/GetRegions', { countryId: ctrl.countryId })
                .then((response) => {
                    ctrl.regions = response.data.obj;
                    if (response.data.obj.length) {
                        if (currentRegion == '') {
                            ctrl.regionId = response.data.obj[0].Value;
                        } else {
                            ctrl.regionId = currentRegion;
                        }
                        ctrl.hasRegions = true;
                    } else {
                        ctrl.hasRegions = false;
                    }
                })
                .finally(() => {
                    if (ctrl.isFirstLoadRegions !== true) {
                        ctrl.form.$setPristine();
                    }

                    ctrl.isFirstLoadRegions = true;

                    $timeout(() => {
                        ctrl.regionsLoaded = true;
                    }, 0);
                });
        };

        let debounceFormatMobilePhone;
        ctrl.formatMobilePhone = function (phone) {
            if (debounceFormatMobilePhone != null) {
                clearTimeout(debounceFormatMobilePhone);
            }

            debounceFormatMobilePhone = setTimeout(() => {
                $http.post('settings/convertToStandardPhone', { phone }).then((response) => {
                    ctrl.mobilePhone = response.data.obj;
                });
            }, 300);
        };

        ctrl.scrollIntoView = function (elementId) {
            if (!elementId) return;

            setTimeout(() => {
                document.getElementById(elementId).scrollIntoView();
            }, 10);
        };

        ctrl.onSelectTab = function (indexTab) {
            ctrl.tabActiveIndex = indexTab;
        };
    };

    SettingsCtrl.$inject = ['Upload', '$http', 'toaster', '$timeout', '$translate', '$location', 'isMobileService'];

    ng.module('settings', [
        'ngFileUpload',
        'toaster',
        'as.sortable',
        'paymentMethodsList',
        'settingsUsers',
        'settingsApiWebhooks',
        'shippingMethod',
        'uiModal',
        'productsSelectvizr',
        'autocompleter',
        'isMobile',
    ]).controller('SettingsCtrl', SettingsCtrl);
})(window.angular);
