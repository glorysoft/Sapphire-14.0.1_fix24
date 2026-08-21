import addUpdateBookingTemplate from './../bookingJournal/modal/addUpdateBooking/addUpdateBooking.html';
(function (ng) {
    

    const bookingService = function ($http, $uibModal, Upload, $ocLazyLoad, $q) {
        const service = this;
        service.getBooking = function (id) {
            return $http
                .get('booking/get', {
                    params: {
                        id,
                    },
                })
                .then((response) => {
                    if (service.isSafariBrowser()) {
                        return $q.when(moment == null ? import('moment') : true).then(() => {
                            response.data.obj.BeginDate = moment(response.data.obj.BeginDate.replace('T', ' ')).toDate();
                            response.data.obj.EndDate = moment(response.data.obj.EndDate.replace('T', ' ')).toDate();
                            return response.data;
                        });
                    } 
                        return response.data;
                    
                });
        };
        service.changeStatus = function (id, status) {
            return $http
                .post('booking/changeStatus', {
                    id,
                    status,
                })
                .then((response) => response.data);
        };
        service.createOrder = function (id) {
            return $http
                .post('booking/createOrder', {
                    id,
                })
                .then((response) => response.data);
        };
        service.updateBookingAfterDrag = function (id, reservationResourceId, beginDate, endDate, userConfirmed) {
            return $http
                .post('booking/updateAfterDrag', {
                    id,
                    reservationResourceId,
                    beginDate,
                    endDate,
                    userConfirmed,
                })
                .then((response) => response.data);
        };
        service.delete = function (id) {
            return $http
                .post('booking/delete', {
                    Id: id,
                })
                .then((result) => result.data);
        };
        service.showBookingModal = function (id, affiliateId, beginDate, endDate, reservationResourceId) {
            return $uibModal.open({
                bindToController: true,
                controller: 'ModalAddUpdateBookingCtrl',
                controllerAs: 'ctrl',
                size: 'xs-11',
                backdrop: 'static',
                windowClass: 'modal--panel modal-booking-sheduler',
                openedClass: 'modal-open--panel',
                templateUrl: addUpdateBookingTemplate,
                resolve: {
                    params: {
                        id,
                        affiliateId,
                        beginDate,
                        endDate,
                        reservationResourceId,
                    },
                },
            });
        };
        service.getAttachments = function (bookingId) {
            return $http
                .get('booking/getAttachments', {
                    params: {
                        bookingId,
                    },
                })
                .then((response) => response.data);
        };
        service.uploadAttachment = function (bookingId, $files) {
            return Upload.upload({
                url: 'booking/uploadAttachments',
                data: {
                    bookingId,
                },
                file: $files,
            }).then((response) => response.data);
        };
        service.deleteAttachment = function (bookingId, id) {
            return $http
                .post('booking/deleteAttachment', {
                    bookingId,
                    id,
                })
                .then((response) => response.data);
        };
        service.selectableTimeEventStop = function (selected, model) {
            const instenceModel = ng.copy(model);
            const deactivateTime = selected.filter((time) => {
                if (instenceModel.indexOf(time) === -1) {
                    instenceModel.push(time);
                    return false;
                }
                return true;
            });
            if (deactivateTime.length > 0) {
                model.length = 0;
                instenceModel.forEach((time) => {
                    if (deactivateTime.indexOf(time) === -1) {
                        model.push(time);
                    }
                });
            } else {
                model = selected.forEach((time) => {
                    model.push(time);
                });
            }
        };
        service.isSafariBrowser = function () {
            return (
                navigator.vendor &&
                navigator.vendor.indexOf('Apple') > -1 &&
                navigator.userAgent &&
                navigator.userAgent.indexOf('CriOS') == -1 &&
                navigator.userAgent.indexOf('FxiOS') == -1
            );
        };
        service.transformDate = function (date, asString, checkSafariBrowser) {
            //checkSafariBrowser в некоторых местах не требуется проверка SAFARI так как с проверкой работает некорректно
            if (checkSafariBrowser && service.isSafariBrowser()) {
                return moment(date.utc().toDate().toISOString().slice(0, -5).replace('T', ' ')).toDate(); //для старых версий сафари
            }
            const transformedDate = date.utc().toDate().toISOString().slice(0, -5);
            if (asString) {
                return transformedDate;
            }
            return new Date(transformedDate);
        };
    };
    bookingService.$inject = ['$http', '$uibModal', 'Upload', '$ocLazyLoad', '$q'];
    ng.module('booking').service('bookingService', bookingService);
})(window.angular);
