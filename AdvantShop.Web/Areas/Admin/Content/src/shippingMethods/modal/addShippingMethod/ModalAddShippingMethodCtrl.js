(function (ng) {
    

    const ModalAddShippingMethodCtrl = function ($uibModalInstance, $http, toaster, $translate, SweetAlert) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.getTypes().then(() => {
                ctrl.type = ctrl.types[0];
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getTypes = function () {
            return $http.get('shippingMethods/getTypesList').then((response) => {
                ctrl.types = response.data;
            });
        };

        ctrl.save = function () {
            if (ctrl.isProgress === true) {
                return;
            }
            ctrl.isProgress = true;

            if (ctrl.type.type === 'not-exist-module') {
                SweetAlert.info(null, {
                    title: `<i class="fa fa-spinner fa-spin"></i>&nbsp;${  $translate.instant('Admin.Js.Modules.ModuleInstalling')}`,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                });

                const data = {
                    stringId: ctrl.type.moduleStringId,
                    id: ctrl.type.moduleId,
                    version: ctrl.type.moduleVersion,
                    active: true,
                };

                $http
                    .post('modules/installModule', data)
                    .then((response) => {
                        if (response.data.result === true) {
                            if (new RegExp('InstallModuleInDb', 'i').test(response.data.url)) {
                                $http
                                    .get(`${response.data.url  }&notRedirect=true`)
                                    .then((response) => {
                                        if (response.data.result === true) {
                                            ctrl.addShippingMethod();
                                        } else {
                                            toaster.error('', $translate.instant('Admin.Js.Modules.ErrorInstallingModule'));
                                            ctrl.isProgress = false;
                                        }
                                        SweetAlert.close();
                                    })
                                    .catch(() => {
                                        SweetAlert.close();
                                    });
                            } else {
                                ctrl.addShippingMethod();
                                SweetAlert.close();
                            }
                        } else {
                            toaster.error('', $translate.instant('Admin.Js.Modules.ErrorInstallingModule'));
                            ctrl.isProgress = false;
                            SweetAlert.close();
                        }
                    })
                    .catch(() => {
                        SweetAlert.close();
                    });
            } else {
                ctrl.addShippingMethod();
            }
        };

        ctrl.addShippingMethod = function () {
            return $http
                .post('shippingMethods/addShippingMethod', {
                    name: ctrl.name,
                    type: ctrl.type.value,
                    description: ctrl.description,
                })
                .then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.ShippingMethods.DeliveryMethodsAdded'));

                        window.location = `shippingmethods/edit/${  data.id}`;
                    } else {
                        toaster.pop('error', '', data.error || $translate.instant('Admin.Js.ShippingMethods.ErrorAddingShippingMethods'));
                        ctrl.isProgress = false;
                    }
                });
        };
    };

    ModalAddShippingMethodCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate', 'SweetAlert'];

    ng.module('uiModal').controller('ModalAddShippingMethodCtrl', ModalAddShippingMethodCtrl);
})(window.angular);
