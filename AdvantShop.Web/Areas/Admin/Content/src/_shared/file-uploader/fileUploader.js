(function (ng) {
    

    const FileUploaderCtrl = function ($http, Upload, toaster, SweetAlert, $translate, $q) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.src = ctrl.startSrc;
            ctrl.step = 'uploadStep';

            if (ctrl.onInit != null) {
                ctrl.onInit({ fileUploader: ctrl });
            }
        };

        ctrl.upload = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
            if (ctrl.uploadParams == null) {
                ctrl.uploadParams = {};
            }

            if (($event.type === 'change' || $event.type === 'drop') && $file != null) {
                ctrl.file = $file;

                if (ctrl.notSendImmediately) {
                    return;
                }

                ctrl.send($file);
            } else if ($invalidFiles.length > 0) {
                toaster.pop(
                    'error',
                    $translate.instant('Admin.Js.FileUploader.ErrorLoading'),
                    $translate.instant('Admin.Js.FileUploader.FileDoesNotMeet'),
                );
            }
        };

        ctrl.uploadByLink = function (result) {
            if (ctrl.uploadbylinkParams == null) {
                ctrl.uploadbylinkParams = {};
            }

            ctrl.uploadbylinkParams.fileLink = result;

            if (ctrl.onBeforeSend != null) {
                ctrl.onBeforeSend({ data: ctrl.uploadbylinkParams });
            }

            $http.post(ctrl.uploadbylinkUrl, ctrl.uploadbylinkParams).then((response) => {
                const data = response.data;

                if (data.Result === true) {
                    ctrl.src = data.FilePath;
                    //toaster.pop('success', 'Файл сохранен');
                    if (ctrl.onSuccess != null) {
                        ctrl.onSuccess({ result: data });
                    }
                } else {
                    toaster.pop('error', $translate.instant('Admin.Js.FileUploader.ErrorLoading'), data.error);
                }

                if (ctrl.onUpdate != null) {
                    $q.when(ctrl.onUpdate({ result: data }))
                        .then((data) => data)
                        .catch((data) => data);
                }
            });
        };

        ctrl.delete = function () {
            SweetAlert.confirm($translate.instant('Admin.Js.FileUploader.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.FileUploader.Delete'),
            }).then((result) => {
                if (result === true || result.value) {
                    return $http.post(ctrl.deleteUrl, ctrl.deleteParams).then((response) => {
                        const data = response.data;
                        if (data.Result === true) {
                            ctrl.file = null;
                            toaster.pop('success', $translate.instant('Admin.Js.FileUploader.FileWasDeleted'));
                        } else {
                            toaster.pop('error', $translate.instant('Admin.Js.FileUploader.ErrorWhileDeleting'), data.error);
                        }
                        ctrl.step = 'uploadStep';
                    });
                }
            });
        };

        ctrl.send = function (file) {
            ctrl.progressPercentage = 0;
            ctrl.step = 'progressStep';

            ctrl.showAfterUpload = false;

            const data = ng.extend(ctrl.uploadParams, {
                file,
                rnd: Math.random(),
            });

            if (ctrl.onBeforeSend != null) {
                ctrl.onBeforeSend({ data });
            }

            return Upload.upload({
                url: ctrl.uploadUrl,
                data,
            }).then(
                (response) => {
                    ctrl.showAfterUpload = false;

                    const data = response.data;

                    if (data.Result === true || data.result === true) {

                        ctrl.src = data.FilePath;
                        //toaster.pop('success', 'Файл сохранен');
                        if (ctrl.onSuccess != null) {
                            ctrl.onSuccess({ result: data });
                        }
                        ctrl.step = 'resultStep';

                        if (ctrl.goToFirstStepAfterSucces == true) {
                            ctrl.step = 'uploadStep';
                        }
                    } else {
                        ctrl.step = 'uploadStep';
                        if (data.errors != null && data.errors.length > 0) {
                            toaster.pop({
                                type: 'error',
                                body: data.errors.join('</br>'),
                                bodyOutputType: 'trustedHtml',
                            });
                        } else {
                            toaster.pop('error', $translate.instant('Admin.Js.FileUploader.ErrorLoading'), data.Error != null ? data.Error : '', 5000);
                        }
                    }
                    if (ctrl.onUpdate != null) {
                        $q.when(ctrl.onUpdate({ result: data }))
                            .then((data) => {
                                if (data != null && data.result !== true) {
                                    ctrl.step = 'uploadStep';
                                    toaster.pop({
                                        type: 'error',
                                        body: data.errors.join('</br>'),
                                        bodyOutputType: 'trustedHtml',
                                    });
                                }
                                return data;
                            })
                            .catch((data) => data);
                    }
                },
                (response) => {
                    toaster.pop('error', $translate.instant('Admin.Js.FileUploader.ErrorLoading'), response.status.toString());
                },
                (evt) => {
                    ctrl.progressPercentage = parseInt((100.0 * evt.loaded) / evt.total);
                    if (ctrl.progressPercentage >= 100) {
                        ctrl.showAfterUpload = true;
                    }
                },
            );
        };

        ctrl.onSend = function () {
            ctrl.send(ctrl.file);
        };
    };

    FileUploaderCtrl.$inject = ['$http', 'Upload', 'toaster', 'SweetAlert', '$translate', '$q'];

    ng.module('fileUploader', ['uiModal', 'toaster', 'ngFileUpload']).controller('FileUploaderCtrl', FileUploaderCtrl);
})(window.angular);
