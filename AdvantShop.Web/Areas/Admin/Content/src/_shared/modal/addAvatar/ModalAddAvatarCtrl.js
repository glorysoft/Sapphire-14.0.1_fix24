import './addAvatar.html';
(function (ng) {
    

    /* @ngInject */
    const ModalAddAvatarCtrl = function ($uibModalInstance, Upload, toaster, $http, $window, urlHelper, Cropper, $scope, $timeout, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.showUploadByUrl = false;
            const params = ctrl.$resolve;
            ctrl.customerId = params.customer ? params.customer.Id : null;
        };

        ctrl.close = function () {
            ctrl.showUploadByUrl = false;

            $uibModalInstance.dismiss('cancel');
        };

        /* cropper */
        let file, fileName, data;

        //$scope.cropper = {};
        ctrl.cropperProxy = 'cropper.first';

        ctrl.cropOptions = {
            viewMode: 1,
            maximize: true,
            preview: '.preview-container',
            aspectRatio: 1 / 1,
            crop (dataNew) {
                data = dataNew;
            },
        };

        // save cropped image
        ctrl.saveCropedImg = function () {
            if (!file || !data) return;
            Cropper.crop(file, data.detail)
                .then(Cropper.encode)
                .then((dataUrl) => {
                    $http
                        .post('common/uploadAvatarCropped', {
                            name: file.name != null ? file.name : fileName,
                            base64String: dataUrl,
                            customerId: ctrl.customerId,
                        })
                        .then((response) => {
                            const data = response.data;
                            if (data.result === true) {
                                ctrl.avatarSrc = `${data.file  }?rnd=${  Math.random()}`;
                                $uibModalInstance.close(ctrl.avatarSrc);
                            } else {
                                toaster.pop('error', $translate.instant('Admin.Js.AddAvatar.ErrorLoadingAvatar'), data.error);
                            }
                        });
                });
        };

        ctrl.showEvent = 'show';
        ctrl.hideEvent = 'hide';

        function showCropper() {
            $scope.$broadcast(ctrl.showEvent);
        }
        function hideCropper() {
            $scope.$broadcast(ctrl.hideEvent);
        }

        /* end cropper */

        // upload avatar by file upload
        ctrl.uploadAvatar = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
            if (($event.type === 'change' || $event.type === 'drop') && $file != null) {
                Cropper.encode((file = $file)).then((dataUrl) => {
                    if (ctrl.avatarSrc != null) {
                        $timeout(hideCropper);
                    }
                    ctrl.avatarSrc = dataUrl;

                    $timeout(showCropper);
                });
            }
        };

        ctrl.addAvatarByUrl = function () {
            ctrl.showUploadByUrl = true;
        };

        // upload avatar by url
        ctrl.uploadAvatarByUrl = function () {
            if (ctrl.url == null || ctrl.url == '') return;

            $http.post('common/uploadavatarbyurl', { url: ctrl.url, customerId: ctrl.customerId }).then((response) => {
                const data = response.data;

                if (data.result === true) {
                    fileName = data.file;

                    $http.get(data.file, { responseType: 'blob' }).then((responseUploaded) => {
                        const blob = responseUploaded.data;

                        Cropper.encode((file = blob)).then((dataUrl) => {
                            ctrl.avatarSrc = dataUrl;
                            $timeout(showCropper);
                        });
                    });
                } else {
                    toaster.pop('error', $translate.instant('Admin.Js.AddAvatar.ErrorLoadingAvatar'), data.error);
                }
            });
        };

        ctrl.deleteAvatar = function () {
            $http.post('common/deleteavatar', { customerId: ctrl.customerId }).then(() => {
                ctrl.avatarSrc = null;
                $uibModalInstance.close(ctrl.avatarSrc);
            });
        };
    };

    ng.module('uiModal').controller('ModalAddAvatarCtrl', ModalAddAvatarCtrl);
})(window.angular);
