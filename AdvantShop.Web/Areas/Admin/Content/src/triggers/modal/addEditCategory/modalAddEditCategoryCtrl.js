(function (ng) {
    

    const ModalAddEditCategoryCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;
        ctrl.formInited = false;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.id = params.id != null ? params.id : 0;
            ctrl.mode = ctrl.id != 0 ? 'edit' : 'add';

            if (ctrl.mode == 'add') {
                ctrl.name = '';
                ctrl.sortOrder = 0;
                ctrl.formInited = true;
            } else {
                ctrl.getCategory(ctrl.id);
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getCategory = function (id) {
            $http.post('triggers/getCategory', { id }).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    if (data.obj != null) {
                        ctrl.name = data.obj.Name;
                        ctrl.sortOrder = data.obj.SortOrder;
                        ctrl.formInited = true;
                    }
                } else {
                    ctrl.close();
                    if (data.errors) {
                        data.errors.forEach((error) => {
                            toaster.pop('error', error);
                        });
                    } else {
                        toaster.pop('error', 'Ошибка', 'Не удалось загрузить данные категории');
                    }
                }
            });
        };

        ctrl.save = function () {
            const params = {
                id: ctrl.id,
                name: ctrl.name,
                sortOrder: ctrl.sortOrder,
            };

            const url = ctrl.mode === 'add' ? 'triggers/addCategory' : 'triggers/updateCategory';

            $http.post(url, params).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    toaster.pop('success', '', 'Изменения сохранены');
                    $uibModalInstance.close(data.obj);
                } else if (data.errors) {
                        data.errors.forEach((error) => {
                            toaster.pop('error', error);
                        });
                    } else {
                        toaster.pop('error', 'Ошибка', 'Не удалось сохранить изменения');
                    }
            });
        };
    };

    ModalAddEditCategoryCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('triggers').controller('ModalAddEditCategoryCtrl', ModalAddEditCategoryCtrl);
})(window.angular);
