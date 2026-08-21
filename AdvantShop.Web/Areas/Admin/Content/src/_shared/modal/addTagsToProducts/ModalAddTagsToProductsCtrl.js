(function (ng) {
    

    const ModalAddTagsToProductsCtrl = function ($uibModalInstance, $http, toaster, $translate, $timeout) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const resolve = ctrl.$resolve;
            ctrl.params = resolve.params;
            ctrl.isProcessGetTags = false;
            ctrl.bodyHeight = 0;
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.tagTransform = function (newTag) {
            return { value: newTag };
        };

        ctrl.getTags = function () {
            ctrl.isProcessGetTags = true;

            $http
                .get('catalog/GetTags')
                .then((response) => {
                    ctrl.tags = response.data.tags;
                    ctrl.onChange();

                    return response.data;
                })
                .then((data) => $timeout(() => {
                        ctrl.isProcessGetTags = false;
                        return data;
                    }, 500));
        };

        ctrl.onChange = function () {
            $timeout(() => {
                ctrl.bodyHeight = document.getElementById('body').clientHeight;
            }, 100);
        };

        ctrl.addTags = function () {
            ctrl.isProcessGetTags = true;

            const params = [];
            ctrl.selectedTags.forEach((element) => {
                params.push(element.value);
            });

            $http
                .post('catalog/AddTagsToProducts', ng.extend(ctrl.params || {}, { newTags: params }))
                .then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.AddTagsToProducts.TagsAddedSuccessfully'));

                        $uibModalInstance.close();
                    } else {
                        toaster.pop('error', '', $translate.instant('Admin.Js.AddTagsToProducts.Error'));
                    }
                })
                .finally(() => {
                    ctrl.isProcessGetTags = false;
                });
        };
    };

    ModalAddTagsToProductsCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate', '$timeout'];

    ng.module('uiModal').controller('ModalAddTagsToProductsCtrl', ModalAddTagsToProductsCtrl);
})(window.angular);
