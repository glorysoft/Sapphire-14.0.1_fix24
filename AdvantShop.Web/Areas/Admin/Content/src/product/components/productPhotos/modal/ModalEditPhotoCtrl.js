import './editPhoto.html';
(function (ng) {
    

    const ModalEditPhotoCtrl = function ($uibModalInstance, $http, $window, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.PhotoId = params.PhotoId != null ? params.PhotoId : 0;

            $http.get('product/getPhoto', { params: { photoId: ctrl.PhotoId } }).then((response) => {
                const data = response.data;
                ctrl.Description = data.Description;
                ctrl.ColorId = data.ColorId;
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function () {
            $http.post('product/editPhoto', { photoId: ctrl.PhotoId, alt: ctrl.Description, colorId: ctrl.ColorId }).then((response) => {
                if (response.data == true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.Product.ChangesSuccessfullySaved'));
                    $uibModalInstance.close();
                }
            });
        };
    };

    ModalEditPhotoCtrl.$inject = ['$uibModalInstance', '$http', '$window', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalEditPhotoCtrl', ModalEditPhotoCtrl);
})(window.angular);
