(function (ng) {
    

    const ModalChangePropertyGroupCtrl = function ($http, $uibModalInstance, urlHelper) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.getData().then(() => {
                ctrl.group = ctrl.groups[0];
            });
        };

        ctrl.getData = function () {
            return $http.get('properties/getPropertyData').then((response) => {
                const data = response.data;
                ctrl.groups = data.groups;
            });
        };

        ctrl.changeGroup = function () {
            const resolve = ctrl.$resolve;
            const params = resolve.params;
            const groupId = urlHelper.getUrlParamByName('groupId');

            $http
                .post('properties/changePropertyGroup', ng.extend(params || {}, { groupId, newid: ctrl.group.Value }))
                .then((response) => {
                    $uibModalInstance.close('changeGroup');
                });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalChangePropertyGroupCtrl.$inject = ['$http', '$uibModalInstance', 'urlHelper'];

    ng.module('uiModal').controller('ModalChangePropertyGroupCtrl', ModalChangePropertyGroupCtrl);
})(window.angular);
