import reservationResourcesTemplate from './reservationResources.html';
import servicesTemplate from './../../modal/services/services.html';
import modalReservationResourceShedulerTemplate from './../../../bookingJournal/modal/reservationResourceSheduler/ModalReservationResourceSheduler.html';
import addUpdateReservationResourceTemplate from './../../../bookingReservationResources/modal/addUpdateReservationResource/addUpdateReservationResource.html';
(function (ng) {
    

    const ReservationResourcesCtrl = function ($http, uiGridCustomConfig, $uibModal) {
        const ctrl = this;
        ctrl.gridOptions = ng.extend({}, uiGridCustomConfig, {
            useExternalSorting: false,
            enableSorting: true,
            columnDefs: [
                {
                    name: 'Name',
                    displayName: 'Ресурс',
                    cellTemplate:
                        '<div class="ui-grid-cell-contents"><div>' +
                        '<button type="button" class="btn-icon ui-grid-custom-service-icon" ng-click="grid.appScope.$ctrl.gridExtendCtrl.showReservationResourceSheduler(row.entity.Id); $event.preventDefault();">{{COL_FIELD}}</button>' +
                        ' <button type="button" ng-click="grid.appScope.$ctrl.gridExtendCtrl.loadReservationResource(row.entity.Id); $event.preventDefault();" class="btn-icon ui-grid-custom-service-icon fas fa-pencil-alt" aria-label="Редактировать"></button>' +
                        '</div></div>',
                },
                {
                    name: 'BookingsCount',
                    displayName: 'Кол-во броней',
                    width: 100,
                    cellTemplate:
                        '<div class="ui-grid-cell-contents"><div>' +
                        '<button type="button" class="btn-icon ui-grid-custom-service-icon" ng-click="grid.appScope.$ctrl.gridExtendCtrl.showBookings(row.entity.Id); $event.preventDefault();">{{COL_FIELD}}</button>' +
                        '</div></div>',
                    sortingAlgorithm (a, b, rowA, rowB, direction) {
                        return ctrl.sortAlg(a, b, rowA, rowB, direction);
                    },
                },
                {
                    name: 'BookingsSum',
                    displayName: 'Сумма броней',
                    width: 100,
                    sortingAlgorithm (a, b, rowA, rowB, direction) {
                        return ctrl.sortAlg(a, b, rowA, rowB, direction);
                    },
                },
                {
                    name: 'AvgCheck',
                    displayName: 'Средний чек',
                    width: 100,
                    sortingAlgorithm (a, b, rowA, rowB, direction) {
                        return ctrl.sortAlg(a, b, rowA, rowB, direction);
                    },
                },
                {
                    name: 'FillingPlace',
                    displayName: 'Востребованность %',
                    width: 150,
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.FillingPlace != null ? row.entity.FillingPlace : "-"}}</div>',
                    sortingAlgorithm (a, b, rowA, rowB, direction) {
                        return ctrl.sortAlg(a, b, rowA, rowB, direction);
                    },
                },
                {
                    name: '_serviceColumn',
                    displayName: '',
                    width: 100,
                    enableSorting: false,
                    cellTemplate:
                        '<div class="ui-grid-cell-contents"><div>' +
                        '<a href=\'\' ng-click="grid.appScope.$ctrl.gridExtendCtrl.showServicesAnalytics(row.entity.Id); $event.preventDefault();">Оказанные услуги</a>' +
                        '</div></div>',
                },
            ],
        });
        ctrl.gridOnInit = function (grid) {
            ctrl.gridReservationResources = grid;
            ctrl.gridReservationResources.gridOptions.data = ctrl.ReservationResources;
        };
        ctrl.$onInit = function () {
            ctrl.groupFormatString = 'dd';
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    reservationResources: ctrl,
                });
            }
        };
        ctrl.recalc = function (dateFrom, dateTo, paid, status) {
            ctrl.fetch(dateFrom, dateTo, paid, status);
        };
        ctrl.fetch = function (dateFrom, dateTo, paid, status) {
            ctrl.dateFrom = dateFrom;
            ctrl.dateTo = dateTo;
            ctrl.paid = paid;
            ctrl.status = status;
            ctrl.gridOptions.columnDefs.forEach((col) => {
                if (col.name === 'FillingPlace') {
                    col.visible = (!ctrl.paid || ctrl.paid === 'null') && (!ctrl.status || ctrl.status === 'null');
                }
            });
            $http
                .get('bookingAnalytics/getReservationResources', {
                    params: {
                        dateFrom,
                        dateTo,
                        isPaid: paid,
                        status,
                        affiliateId: ctrl.affiliateId,
                    },
                })
                .then((result) => {
                    ctrl.ReservationResources = result.data;
                    if (ctrl.gridReservationResources != null) {
                        ctrl.gridReservationResources.gridOptions.data = ctrl.ReservationResources;
                    }
                });
        };
        ctrl.sortAlg = function (a, b, rowA, rowB, direction) {
            const nulls = ctrl.gridReservationResourcesApi.core.sortHandleNulls(a, b);
            if (nulls !== null) {
                if (nulls === 1) {
                    return -1;
                }
                if (nulls === -1) {
                    return 1;
                }
                return nulls;
            } 
                if (a > b) {
                    return 1;
                }
                if (a < b) {
                    return -1;
                }
                // a должно быть равным b
                return 0;
            
        };
        ctrl.loadReservationResource = function (reservationResourceId) {
            $uibModal
                .open({
                    bindToController: true,
                    controller: 'ModalAddUpdateReservationResourceCtrl',
                    controllerAs: 'ctrl',
                    size: 'lg',
                    backdrop: 'static',
                    templateUrl: addUpdateReservationResourceTemplate,
                    resolve: {
                        params: {
                            id: reservationResourceId,
                            affiliateId: ctrl.affiliateId,
                        },
                    },
                })
                .result.then(
                    (result) => {
                        ctrl.fetch(ctrl.dateFrom, ctrl.dateTo, ctrl.paid, ctrl.status);
                        return result;
                    },
                    (result) => {
                        ctrl.fetch(ctrl.dateFrom, ctrl.dateTo, ctrl.paid, ctrl.status);
                        return result;
                    },
                );
        };
        ctrl.showReservationResourceSheduler = function (reservationResourceId) {
            const fnModalShedulerClose = function (result) {
                if (result && result.reservationResourcesChanged) {
                    ctrl.fetch(ctrl.dateFrom, ctrl.dateTo, ctrl.paid, ctrl.status);
                }
            };
            $uibModal
                .open({
                    bindToController: true,
                    controller: 'ModalReservationResourceShedulerCtrl',
                    controllerAs: 'ctrl',
                    size: 'xs-11',
                    //backdrop: 'static',
                    templateUrl: modalReservationResourceShedulerTemplate,
                    resolve: {
                        params: {
                            affiliateId: ctrl.affiliateId,
                            reservationResourceId,
                            date: ctrl.dateFrom,
                            //slotHeightPx: null,
                            mode: 'edit',
                        },
                    },
                })
                .result.then(
                    (result) => {
                        fnModalShedulerClose(result);
                        return result;
                    },
                    (result) => {
                        fnModalShedulerClose(result);
                        return result;
                    },
                );
        };
        ctrl.showServicesAnalytics = function (reservationResourceId) {
            // грид фильтрует ДО даты, не ПО дату
            let dateTo = new Date(ctrl.dateTo);
            dateTo.setDate(dateTo.getDate() + 1); // add one day
            dateTo = `${dateTo.getFullYear()  }-${  (`0${  dateTo.getMonth() + 1}`).slice(-2)  }-${  (`0${  dateTo.getDate()}`).slice(-2)}`;
            $uibModal.open({
                bindToController: true,
                controller: 'ModalBookingServicesAnalyticsCtrl',
                controllerAs: 'ctrl',
                size: 'lg',
                //backdrop: 'static',
                templateUrl: servicesTemplate,
                resolve: {
                    params: {
                        affiliateId: ctrl.affiliateId,
                        reservationResourceId,
                        dateFrom: ctrl.dateFrom,
                        dateTo,
                        paid: ctrl.paid,
                        status: ctrl.status,
                        noStatus: !ctrl.status || ctrl.status === 'null' ? '3' : undefined,
                    },
                },
            });
        };
        ctrl.showBookings = function (reservationResourceId) {
            if (ctrl.showBookingsFn) {
                ctrl.showBookingsFn({
                    params: {
                        reservationResourceId: reservationResourceId.toString(),
                        nostatus: !ctrl.status || ctrl.status === 'null' ? '3' : undefined,
                    },
                });
            }
        };
    };
    ReservationResourcesCtrl.$inject = ['$http', 'uiGridCustomConfig', '$uibModal'];
    ng.module('bookingAnalytics')
        .controller('ReservationResourcesCtrl', ReservationResourcesCtrl)
        .component('reservationResources', {
            templateUrl: reservationResourcesTemplate,
            controller: ReservationResourcesCtrl,
            bindings: {
                onInit: '&',
                affiliateId: '<?',
                showBookingsFn: '&',
            },
        });
})(window.angular);
