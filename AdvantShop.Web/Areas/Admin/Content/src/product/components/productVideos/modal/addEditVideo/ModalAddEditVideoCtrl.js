import './AddEditVideo.html';
(function (ng) {
    

    const ModalAddEditVideoCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            ctrl.productVideoId = params.productVideoId != null ? params.productVideoId : 0;
            ctrl.productId = params.productId != null ? params.productId : 0;
            ctrl.mode = ctrl.productVideoId != 0 ? 'edit' : 'add';

            if (ctrl.mode == 'add') {
                ctrl.showLink = true;
                ctrl.videoSortOrder = 0;
            } else {
                ctrl.showLink = false;
                ctrl.getVideo(ctrl.productVideoId);
            }
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getVideo = function (productVideoId) {
            $http.get('product/getvideo', { params: { productVideoId } }).then((response) => {
                const data = response.data;
                if (data != null) {
                    ctrl.productVideoId = data.ProductVideoId;
                    ctrl.productId = data.ProductId;
                    ctrl.name = data.Name;
                    ctrl.playerCode = data.PlayerCode;
                    ctrl.description = data.Description;
                    ctrl.videoSortOrder = data.VideoSortOrder;
                }
            });
        };

        ctrl.save = function () {
            if (ctrl.showLink && (ctrl.link == null || ctrl.link.trim() === '')) {
                toaster.pop('error', '', $translate.instant('Admin.Js.Product.EnterLinkToVideo'));
                return;
            }
            if (!ctrl.showLink && (ctrl.playerCode == null || ctrl.playerCode.trim() === '')) {
                toaster.pop('error', '', $translate.instant('Admin.Js.Product.EnterThePlayerCode'));
                return;
            }

            const params = {
                productVideoId: ctrl.productVideoId,
                productId: ctrl.productId,
                name: ctrl.name,
                link: ctrl.link,
                playerCode: ctrl.playerCode,
                description: ctrl.description,
                videoSortOrder: ctrl.videoSortOrder,
            };
            const url = ctrl.mode === 'add' ? 'product/addVideo' : 'product/updateVideo';

            $http.post(url, params).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.Product.ChangesSuccessfullySaved'));
                    $uibModalInstance.close();
                } else {
                    toaster.pop('error', '', data.error);
                }
            });
        };
    };

    ModalAddEditVideoCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalAddEditVideoCtrl', ModalAddEditVideoCtrl);
})(window.angular);
