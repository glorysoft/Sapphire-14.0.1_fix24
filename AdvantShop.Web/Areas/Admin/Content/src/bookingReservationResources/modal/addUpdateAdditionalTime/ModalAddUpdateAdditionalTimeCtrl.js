(function (ng) {
    

    const ModalAddUpdateReservationResourceAdditionalTimeCtrl = function ($uibModalInstance, $http, toaster, SweetAlert, $translate, bookingService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;

            ctrl.date = params.date;
            ctrl.affiliateId = params.affiliateId;
            ctrl.reservationResourceId = params.reservationResourceId;

            ctrl.mode = ctrl.date ? 'selected-day' : 'selecting-day';

            ctrl.canBeEditing = false;

            if (ctrl.mode === 'selected-day') {
                ctrl.getAdditionalTimeForm().then(() => {
                    ctrl.getAdditionalTime(ctrl.affiliateId, ctrl.reservationResourceId, ctrl.date);
                });
            } else {
                ctrl.getAdditionalTimeForm();
                ctrl.canBeEditing = true;
            }
        };

        ctrl.getAdditionalTimeForm = function () {
            if (!ctrl.date) {
                const now = new Date();
                ctrl.date = `${now.getFullYear()  }-${  now.getMonth() + 1  }-${  now.getDate()}`;
            }

            return $http
                .get('bookingResources/getAdditionalTimeFrom', {
                    params: {
                        affiliateId: ctrl.affiliateId,
                        reservationResourceId: ctrl.reservationResourceId,
                        date: ctrl.date,
                    },
                })
                .then((response) => {
                    const data = response.data;

                    if (data.result === true) {
                        ctrl.times = data.obj.Times;
                        ctrl.workTimes = data.obj.WorkTimes;
                        ctrl.canBeEditing = data.obj.CanBeEditing;
                        ctrl.existAdditionalTimes = data.obj.ExistAdditionalTimes;
                        if (typeof ctrl.freeDay === 'undefined') {
                            ctrl.freeDay = !data.obj.WorkTimes || !data.obj.WorkTimes.length;
                        }
                    } else if (data.errors && data.errors.length) {
                            data.errors.forEach((error) => {
                                toaster.pop('error', error);
                            });
                        } else {
                            toaster.pop('error', $translate.instant('Admin.Js.BookingUsers.FailedLoadData'));
                        }
                });
        };

        ctrl.getAdditionalTime = function (affiliateId, reservationResourceId, date) {
            return $http
                .get('bookingResources/getAdditionalTime', {
                    params: { affiliateId, reservationResourceId, date },
                })
                .then((response) => {
                    const data = response.data;

                    if (data.result === true) {
                        if (ctrl.existAdditionalTimes || (data.obj.Times && data.obj.Times.length)) {
                            ctrl.workTimes = data.obj.Times;
                            ctrl.freeDay = !data.obj.Times || !data.obj.Times.length;
                        }
                    } else if (data.errors && data.errors.length) {
                            data.errors.forEach((error) => {
                                toaster.pop('error', error);
                            });
                        } else {
                            toaster.pop('error', $translate.instant('Admin.Js.BookingUsers.FailedLoadData'));
                        }
                });
        };

        ctrl.changeDate = function () {
            ctrl.getAdditionalTimeForm();
        };

        ctrl.changeFreeDay = function () {
            ctrl.freeDay = !ctrl.freeDay;
        };

        ctrl.toLocaleDateString = function (date) {
            if (date instanceof Date) {
                return date.toLocaleDateString();
            }

            return new Date(date).toLocaleDateString();
        };

        ctrl.addUpdateAdditionalTime = function (userConfirmed) {
            const url = 'bookingResources/updateAdditionalTime'; // ctrl.mode === 'selecting-day' ? 'bookingResources/addAdditionalTime' : 'bookingResources/updateAdditionalTime';

            const workTimes = !ctrl.freeDay
                ? ctrl.workTimes.filter((value) => ctrl.times.indexOf(value) !== -1)
                : [];

            const params = {
                affiliateId: ctrl.affiliateId,
                reservationResourceId: ctrl.reservationResourceId,
                date: ctrl.date,
                times: workTimes,
                userConfirmed,
            };

            $http.post(url, params).then((result) => {
                const data = result.data;
                if (data.result === true) {
                    if (data.obj && data.obj.UserConfirmIsRequired) {
                        SweetAlert.confirm(data.obj.ConfirmMessage, {
                            title: $translate.instant('Admin.Js.BookingUsers.SavingTime'),
                            confirmButtonText: data.obj.ConfirmButtomText,
                        }).then(
                            (result) => {
                                if (result === true || result.value === true) {
                                    ctrl.addUpdateAdditionalTime(true);
                                } else {
                                    ctrl.btnLoading = false;
                                }
                            },
                            () => {
                                ctrl.btnLoading = false;
                            },
                        );
                    } else {
                        toaster.pop('success', '', $translate.instant('Admin.Js.BookingUsers.TimeSaved'));
                        $uibModalInstance.close();
                    }
                } else {
                    ctrl.btnLoading = false;

                    if (data.errors && data.errors.length) {
                        data.errors.forEach((error) => {
                            toaster.pop('error', error);
                        });
                    } else {
                        toaster.pop('error', $translate.instant('Admin.Js.BookingUsers.FailedToSave'));
                    }
                }
            });
        };

        ctrl.selectionStop = function (selected, model) {
            bookingService.selectableTimeEventStop(selected, model);
        };

        ctrl.deleteAdditionalTime = function () {
            SweetAlert.confirm($translate.instant('Admin.Js.BookingUsers.AreYouSureDelete'), {
                title: $translate.instant('Admin.Js.BookingUsers.Delete'),
            }).then(
                (result) => {
                    if (result === true || result.value === true) {
                        $http
                            .post('bookingResources/deleteAdditionalTime', {
                                date: ctrl.date,
                                affiliateId: ctrl.affiliateId,
                                reservationResourceId: ctrl.reservationResourceId,
                            })
                            .then((response) => {
                                const data = response.data;
                                if (data.result === true) {
                                    toaster.pop('success', '', $translate.instant('Admin.Js.BookingUsers.TimeDeleted'));
                                    $uibModalInstance.close();
                                } else {
                                    ctrl.btnDeleteLoading = false;

                                    if (data.errors && data.errors.length) {
                                        data.errors.forEach((error) => {
                                            toaster.pop('error', error);
                                        });
                                    } else {
                                        toaster.pop('error', $translate.instant('Admin.Js.BookingUsers.FailedToDelete'));
                                    }
                                }
                            });
                    }
                },
                () => {
                    ctrl.btnDeleteLoading = false;
                },
            );
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalAddUpdateReservationResourceAdditionalTimeCtrl.$inject = [
        '$uibModalInstance',
        '$http',
        'toaster',
        'SweetAlert',
        '$translate',
        'bookingService',
    ];

    ng.module('uiModal').controller('ModalAddUpdateReservationResourceAdditionalTimeCtrl', ModalAddUpdateReservationResourceAdditionalTimeCtrl);
})(window.angular);
