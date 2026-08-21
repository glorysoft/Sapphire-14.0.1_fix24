(function (ng) {
    

    const lpFormCtrl = function ($q, $window, toaster, trackingService, Upload) {
        const ctrl = this;

        ctrl.init = function (
            id,
            blockId,
            ngForm,
            modal,
            entityId,
            entityType,
            yaMetrikaEventName,
            gaEventCategory,
            gaEventAction,
            offerId,
            offerIds,
        ) {
            ctrl.id = id;
            ctrl.blockId = blockId;
            ctrl.form = {};
            ctrl.form.files = {};
            ctrl.form.entityId = entityId;
            ctrl.form.entityType = entityType;
            ctrl.form.offerId = offerId;
            ctrl.form.offerIds = offerIds;

            ctrl.yaMetrikaEventName = yaMetrikaEventName;
            ctrl.gaEventCategory = gaEventCategory;
            ctrl.gaEventAction = gaEventAction;

            ctrl.ngForm = ngForm;

            ctrl.formSubmitInProcess = false;

            if (modal != null) {
                modal.lpForm = ctrl;
            }
        };

        ctrl.submit = function () {
            ctrl.formSubmitInProcess = true;

            const url = ctrl.form.entityType == 'booking' ? 'landing/landing/updateBookingCustomer' : 'landing/landing/submitForm';
            let delay = false;

            if (ctrl.yaMetrikaEventName != null && ctrl.yaMetrikaEventName.length > 0) {
                trackingService.trackYaEvent(ctrl.yaMetrikaEventName);
                delay = true;
            }

            if (ctrl.gaEventAction != null && ctrl.gaEventAction.length > 0) {
                trackingService.trackGaEvent(ctrl.gaEventCategory, ctrl.gaEventAction);
                delay = true;
            }

            const defer = $q.defer();

            setTimeout(
                () => {
                    ctrl.submitForm(url).then(defer.resolve).catch(defer.reject);
                },
                delay ? 500 : 0,
            );

            return defer.promise;
        };

        ctrl.submitForm = function (url) {
            return Upload.upload({
                url,
                data: ng.extend(ctrl.form, {
                    id: ctrl.id,
                    blockId: ctrl.blockId,
                    offerId: ctrl.form.offerId,
                    colorId: ctrl.form.colorId,
                    amount: ctrl.form.amount,
                    offerIds: ctrl.form.offerIds,
                }),
            })
                .then((response) => {
                    const data = response.data;
                    if (data.result) {
                        ctrl.resultData = data.obj;

                        if (data.obj.RedirectUrl != null && data.obj.RedirectUrl != '') {
                            if (data.obj.Message != null && data.obj.RedirectDelay != 0) {
                                setTimeout(() => {
                                    $window.location.assign(data.obj.RedirectUrl);
                                }, data.obj.RedirectDelay * 1000);
                            } else {
                                $window.location.assign(data.obj.RedirectUrl);
                            }
                        }
                    } else {
                        data.errors.forEach((err) => {
                            toaster.pop('error', '', err);
                        });
                    }

                    return data;
                })
                .finally(() => {
                    ctrl.formSubmitInProcess = false;
                });
        };

        ctrl.openModal = function (dataAdditional) {
            ctrl.ngForm.$setPristine();

            if (ctrl.ngForm.$$parentForm != null) {
                ctrl.ngForm.$$parentForm.$setPristine();
            }

            ctrl.form = ng.extend(ctrl.form, dataAdditional);
        };

        ctrl.closeModal = function () {
            ctrl.resultData = null;
        };

        ctrl.removePicture = function (item, indexPicture, indexField) {
            ctrl.form.files[indexField].splice(indexPicture, 1);

            if (ctrl.form.files[indexField].length === 0) {
                ctrl.form.files[indexField] = null;
            }

            return ctrl.form.files[indexField];
        };

        ctrl.selectPicture = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $invalidFile, $event, indexField) {
            let resultErrorMessage = '';

            for (let i = 0; i < $files.length; i++) {
                if ($files[i].$error != null) {
                    resultErrorMessage += ctrl.buildErrorMessage($files[i]);
                    ctrl.form.files[indexField].splice(i, 1);

                    i -= 1;

                    if (ctrl.form.files[indexField].length === 0) {
                        ctrl.form.files[indexField] = null;
                    }
                }
            }

            // max files count = 10
            if (ctrl.form.files[indexField] != null && ctrl.form.files[indexField].length > 10) {
                resultErrorMessage += 'Можно загрузить не больше 10 файлов';
                ctrl.form.files[indexField].splice(10, ctrl.form.files[indexField].length - 10);
            }

            if (resultErrorMessage.length > 0) {
                toaster.pop({
                    type: 'error',
                    title: 'Ошибка при выборе файлов',
                    body: resultErrorMessage,
                    bodyOutputType: 'html',
                });
            }

            return resultErrorMessage.length > 0;
        };

        ctrl.buildErrorMessage = function (item) {
            let result = '';

            switch (item.$error) {
                case 'maxSize':
                    result = `Изображение ${  item.name  } превышает лимит по размеру в ${  item.$errorParam  }<br><br>`;
                    break;
                case 'pattern':
                    result = `Файл ${  item.name  } имеет некорректное расширение.<br>Допустимые расширения:${  item.$errorParam  }<br><br>`;
                    break;
            }

            return result;
        };
    };

    ng.module('lp-form').controller('lpFormCtrl', lpFormCtrl);

    lpFormCtrl.$inject = ['$q', '$window', 'toaster', 'trackingService', 'Upload'];
})(window.angular);
