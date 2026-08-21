import './addEditCategoryBooking.html';

(function (ng) {
    

    const ModalAddEditBookingCategoryCtrl = function ($http, toaster, $uibModalInstance, $translate, Upload) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.id = params.id != null ? params.id : 0;
            ctrl.affiliateId = params.affiliateId;
            ctrl.mode = ctrl.id != 0 ? 'edit' : 'add';

            if (ctrl.mode === 'add') {
                ctrl.enabled = false;
            } else {
                ctrl.getCategory();
            }
        };

        ctrl.getCategory = function () {
            $http.get('bookingCategory/getCategory', { params: { id: ctrl.id } }).then((result) => {
                const data = result.data;
                if (data.result === true) {
                    ctrl.affiliateId = data.obj.AffiliateId;
                    ctrl.name = data.obj.Name;
                    ctrl.image = data.obj.Image;
                    ctrl.enabled = data.obj.Enabled;
                    ctrl.photoSrc = data.obj.PhotoSrc;
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop(
                            'error',
                            $translate.instant('Admin.Js.BookingCategories.Error'),
                            $translate.instant('Admin.Js.BookingCategories.ErrorWhileUploading'),
                        );
                    }
                    ctrl.close();
                }
            });
        };

        ctrl.updateImage = function (params) {
            if (params != null) {
                ctrl.image = params.fileName;
                ctrl.photoSrc = ctrl.photoEncoded = params.base64String;
                ctrl.photoFile = params.file;
            }
        };

        ctrl.deleteImage = function () {
            $http.post('bookingCategory/deleteCategoryImage', { id: ctrl.id }).then((response) => {
                const data = response.data;

                if (data.result === true) {
                    ctrl.image = null;
                    ctrl.photoFile = null;
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop(
                            'error',
                            $translate.instant('Admin.Js.BookingCategories.Error'),
                            $translate.instant('Admin.Js.BookingCategories.ErrorWhileDeleting'),
                        );
                    }
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.save = function () {
            const params = {
                id: ctrl.id,
                affiliateId: ctrl.affiliateId ?? '',
                name: ctrl.name,
                image: ctrl.image,
                photoFile: ctrl.photoFile,
                enabled: ctrl.enabled,
            };
            const url = ctrl.mode === 'add' ? 'bookingCategory/addCategory' : 'bookingCategory/updateCategory';

            Upload.upload({
                url,
                data: params,
            }).then((result) => {
                const data = result.data;

                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.BookingCategories.ChangesSaved'));
                    $uibModalInstance.close(params);
                } else {
                    ctrl.btnLoading = false;
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop(
                            'error',
                            $translate.instant('Admin.Js.BookingCategories.Error'),
                            $translate.instant('Admin.Js.BookingCategories.ErrorWhileEditing'),
                        );
                    }
                }
            });
        };
    };

    ModalAddEditBookingCategoryCtrl.$inject = ['$http', 'toaster', '$uibModalInstance', '$translate', 'Upload'];

    ng.module('uiModal').controller('ModalAddEditBookingCategoryCtrl', ModalAddEditBookingCategoryCtrl);
})(window.angular);
