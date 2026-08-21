(function (ng) {
    
    const CustomerTagsModalCtrl = function ($http, $uibModalInstance, toaster) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const id = ctrl.$resolve != null && ctrl.$resolve.value != null ? ctrl.$resolve.value : null;
            ctrl.isNew = id == null;
            ctrl.item = {};
            if (!ctrl.isNew) {
                ctrl.item.Id = id;
                ctrl.IsEditMode = true;
            }
        };

        ctrl.save = function () {
            $http.post(ctrl.isNew ? 'customertags/add' : `customertags/edit/${  ctrl.item.Id}`, ctrl.item).then((response) => {
                if (response.data.result) {
                    toaster.pop('success', 'Данные успешно сохранены');
                    $uibModalInstance.close();
                    ctrl.item;
                } else {
                    toaster.pop('error', 'Ошибка при сохранении');
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    CustomerTagsModalCtrl.$inject = ['$http', '$uibModalInstance', 'toaster'];

    ng.module('customerTags').controller('CustomerTagsModalCtrl', CustomerTagsModalCtrl);
})(window.angular);
