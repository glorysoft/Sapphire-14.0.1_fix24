(function (ng) {


    const ModalAddEditReviewCtrl = function ($uibModalInstance, $http, toaster, Upload, $translate, $document, $window) {
        const ctrl = this;

        ctrl.ckeditor = {
            height: 150,
            extraPlugins: 'ace,lineheight,autogrow',
            bodyClass: 'm-n textarea-padding',
            toolbar: {},
            toolbarGroups: {},
            resize_enabled: false,
            toolbar_emptyToolbar: { name: 'empty', items: [] },
            autoGrow_minHeight: 150,
            autoGrow_onStartup: true,
            on: {
                instanceReady (event) {
                    $document[0].getElementById(`${event.editor.id  }_top`).style.display = 'none';
                },
            },
            disableNativeSpellChecker: false,
            browserContextMenuOnCtrl: false,
            removePlugins: 'language,liststyle,tabletools,scayt,menubutton,contextmenu,tableselection,elementspath',
        };

        ctrl.$onInit = function () {
            const params = ctrl.$resolve;
            if (params.isAnswer && params.reviewId) {
                ctrl.parentId = params.reviewId;
                ctrl.mode = 'add';
            } else {
                ctrl.reviewId = params.reviewId ?? 0;
                ctrl.mode = ctrl.reviewId !== 0 ? 'edit' : 'add';
            }

            ctrl.addArticulIsSelect = false;

            ctrl.isLoading = true;

            ctrl.getFormData()
                .then((data) => {
                    ctrl.filesHelpText = data.filesHelpText;
                    ctrl.reviewImageHeight = data.reviewImageHeight;
                    ctrl.reviewImageWidth = data.reviewImageWidth;
                    if (ctrl.mode === 'add') {
                        const date = new Date(Date.now());
                        ctrl.AddDate =
                            `${date.getFullYear()  }.${  date.getMonth() + 1  }.${  date.getDate()  } ${  date.getHours()  }:${  date.getMinutes()}`;
                        ctrl.Checked = true;
                        ctrl.Photos = [];
                        if (ctrl.parentId) ctrl.getReviewProduct(ctrl.parentId);
                        return data;
                    }
                        ctrl.deletedPhotoIds = [];
                        return ctrl.getReview();

                })
                .then(() => {
                    ctrl.isLoading = false;
                });
        };

        ctrl.answer = function () {
            $uibModalInstance.close({ parentId: ctrl.reviewId });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getFormData = function () {
            return $http.post('reviews/getFormData').then((response) => response.data);
        };

        ctrl.getReviewProduct = function (reviewId) {
            return $http.get('reviews/getReview', { params: { reviewId } }).then((response) => {
                if (response.data !== null && response.data.result) {
                    const data = response.data.obj;

                    ctrl.ArtNo = data.ArtNo;
                    ctrl.productName = data.ProductName;
                    ctrl.productUrl = data.ProductUrl;

                    return data;
                } else if (response.data.errors !== null) {
                    response.data.errors.forEach((error) => {
                        toaster.pop('error', '', error);
                    });
                    $window.location.assign('reviews');
                }
            });
        };

        ctrl.getReview = function () {
            return $http.get('reviews/getReview', { params: { reviewId: ctrl.reviewId } }).then((response) => {
                if (response.data !== null && response.data.result) {
                    const data = response.data.obj;

                    ctrl.Name = data.Name;
                    ctrl.Email = data.Email;
                    ctrl.Text = data.Text;
                    ctrl.Checked = data.Checked;
                    ctrl.AddDate = data.AddDate;
                    ctrl.Ip = data.Ip;
                    //ctrl.Photo = data.PhotoSrc;
                    //ctrl.PhotoName = data.PhotoName;
                    ctrl.Photos = data.Photos;
                    ctrl.ArtNo = data.ArtNo;
                    ctrl.productName = data.ProductName;
                    ctrl.productUrl = data.ProductUrl;
                    ctrl.showOnMain = data.ShowOnMain;
                    ctrl.LikesCount = data.LikesCount;
                    ctrl.DislikesCount = data.DislikesCount;
                    ctrl.Rating = data.Rating;

                    return data;
                } else if (response.data.errors !== null) {
                    response.data.errors.forEach((error) => {
                        toaster.pop('error', '', error);
                    });
                    $window.location.assign('reviews');
                }
            });
        };

        ctrl.uploadImage = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
            if ($event.type === 'change' || $event.type === 'drop') {
                if ($files && $files.length) {
                    for (let i = 0; i < $files.length; i++) {
                        ctrl.pushImages($files[i]);
                    }
                }
            }

            if ($invalidFiles.length > 0) {
                toaster.pop('error', '', $translate.instant('Admin.Js.Reviews.FileDoesNotMeet'));
            }
        };

        ctrl.pushImages = function (image) {
            ctrl.Photos.push(image);
        };

        ctrl.deletePhoto = function (photoId, index) {
            if (photoId) ctrl.deletedPhotoIds.push(photoId);
            ctrl.Photos.splice(index, 1);
        };

        ctrl.save = function () {

            if (ctrl.Rating !== null) {
                const rating = parseInt(ctrl.Rating, 10);
                if (rating < 1 || rating > 5) {
                    toaster.pop('error', '', $translate.instant('Admin.Js.Reviews.RatingHint'));
                    return;
                }
            }

            ctrl.isLoading = true;

            const params = {
                reviewId: ctrl.reviewId,
                Name: ctrl.Name,
                Email: ctrl.Email,
                Text: ctrl.Text || '',
                Checked: ctrl.Checked,
                AddDate: ctrl.AddDate,
                ArtNo: ctrl.ArtNo,
                ShowOnMain: ctrl.showOnMain,
                DeletedPhotoIds: ctrl.deletedPhotoIds,
                ParentId: ctrl.parentId,
                Rating: ctrl.Rating
            };

            const url = ctrl.mode === 'add' ? 'reviews/addReview' : 'reviews/updateReview';

            Upload.upload({
                url,
                data: ng.extend(params, {
                    rnd: Math.random(),
                }),
                file: ctrl.Photos.filter((image) => image.name), // or list of files (files) for html5 only
            })
                .then((response) => {
                    const {data} = response;
                    if (data.result === true) {
                        toaster.pop('success', '', $translate.instant('Admin.Js.Reviews.ChangesSaved'));
                        $uibModalInstance.close('success');
                    } else if (data.error !== null) {
                            toaster.pop('error', '', data.error);
                        } else if (data.errors !== null) {
                            data.errors.forEach((error) => {
                                toaster.pop('error', '', error);
                            });
                        } else {
                            toaster.pop('error', '', $translate.instant('Admin.Js.Reviews.ErrorWhileCreatingEditing'));
                        }
                })
                .finally(() => (ctrl.isLoading = false));
        };

        ctrl.validateCkeditor = function (text) {
            if (ctrl.Photos) {
                if (ctrl.Photos.length !== 0) return true;
                return ctrl.validateText(text);
            }
            return true;
        };

        ctrl.addArticul = function (result) {
            if (result.ids !== null && result.ids.length > 0) {
                ctrl.addArticulIsSelect = true;
                ctrl.ArtNo = result.artNo;
            }
        };

        ctrl.validateText = function (text) {
            if (text) {
                const re1 = /&nbsp;/giu;

                const newText = text.replace(re1, '').trim();
                if (newText.length === 0) {
                    ctrl.Text = '';
                    return false;
                }
                return true;
            }
            return true;
        };

        ctrl.checkSelectedItem = function (rowEntity) {
            return ctrl.ArtNo === rowEntity.ProductArtNo;
        };
    };

    ModalAddEditReviewCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', 'Upload', '$translate', '$document', '$window'];

    ng.module('uiModal').controller('ModalAddEditReviewCtrl', ModalAddEditReviewCtrl);
})(window.angular);
