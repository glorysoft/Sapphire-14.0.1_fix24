(function (ng) {
    

    const ModalAddEditShippingReplaceGeoCtrl = function ($http, $uibModalInstance, toaster, $translate) {
        const ctrl = this;
        ctrl.model = {};

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.id = params != null && params.id != null ? params.id : 0;
            ctrl.mode = ctrl.id != 0 ? 'edit' : 'add';

            ctrl.getShippingTypes().then((result) => {
                if (result && ctrl.mode === 'edit') {
                    ctrl.getShippingReplaceGeo();
                }
            });
        };

        ctrl.getShippingTypes = function () {
            return $http.get('shippingMethods/getTypesList').then((response) => {
                ctrl.types = response.data;

                return true;
            });
        };

        ctrl.getShippingReplaceGeo = function () {
            return $http.post('shippingReplaceGeo/get', { id: ctrl.id }).then((response) => {
                const data = response.data;

                if (data.result === true) {
                    ctrl.model = data.obj;
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop('error', 'Ошибка', 'Ошибка при загрузке данных');
                    }
                    ctrl.dismiss();
                }
            });
        };

        ctrl.save = function () {
            const url = ctrl.mode === 'add' ? 'shippingReplaceGeo/add' : 'shippingReplaceGeo/update';
            $http.post(url, ctrl.model).then((result) => {
                const data = result.data;
                if (data.result === true) {
                    toaster.pop('success', '', ctrl.mode === 'add' ? 'Добавлено' : 'Сохранено');
                    $uibModalInstance.close();
                } else {
                    ctrl.btnLoading = false;
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });
                }
            });
        };

        ctrl.dismiss = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalAddEditShippingReplaceGeoCtrl.$inject = ['$http', '$uibModalInstance', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddEditShippingReplaceGeoCtrl', ModalAddEditShippingReplaceGeoCtrl);
})(window.angular);
