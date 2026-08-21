import './descriptionTemplate.html';

(function (ng) {
    

    const DescriptionTemplateCtrl = function ($http, $uibModalInstance, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.type = params.type;
            ctrl.profiMode = params.profiMode;

            ctrl.getTemplateDescription();
        };

        ctrl.getTemplateDescription = function () {
            return $http.post('settingsTemplatesDocx/getDescription', { type: ctrl.type }).then((response) => {
                const data = response.data;

                if (data.result === true) {
                    ctrl.Childs = data.obj.Fields;
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

        ctrl.dismiss = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    DescriptionTemplateCtrl.$inject = ['$http', '$uibModalInstance', 'toaster', '$translate'];

    ng.module('uiModal').controller('DescriptionTemplateCtrl', DescriptionTemplateCtrl);
})(window.angular);
