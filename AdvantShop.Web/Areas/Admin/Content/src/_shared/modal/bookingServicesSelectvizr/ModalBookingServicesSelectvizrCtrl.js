import './bookingServicesSelectvizr.html';
(function (ng) {
    

    const ModalBookingServicesSelectvizrCtrl = function ($uibModalInstance, uiGridCustomConfig, uiGridConstants, $http, $q, $translate) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const params = ctrl.$resolve.params;
            ctrl.affiliateId = params.affiliateId;
            ctrl.reservationResourceId = params.reservationResourceId;
            ctrl.selectvizrTreeUrl = `bookingCategory/getCategoriesTree?affiliateId=${  ctrl.affiliateId}`;
            if (ctrl.reservationResourceId) {
                ctrl.selectvizrTreeUrl = `${ctrl.selectvizrTreeUrl  }&reservationResourceId=${  ctrl.reservationResourceId}`;
            }
            ctrl.selectvizrGridUrl = 'bookingService/getServices';
            ctrl.data = [];
            ctrl.itemsSelected = params != null && params.value != null ? ng.copy(params.value.itemsSelected) : null;

            const columnDefsServices = [
                {
                    name: 'ArtNo',
                    displayName: $translate.instant('Admin.Js.BookingServices.ArtNo'),
                    cellTemplate: '<div class="ui-grid-cell-contents"><span class="link">{{COL_FIELD}}</span></div>',
                    width: 80,
                    filter: {
                        placeholder: $translate.instant('Admin.Js.BookingServices.ArtNo'),
                        type: uiGridConstants.filter.INPUT,
                        name: 'ArtNo',
                    },
                },
                {
                    name: 'PhotoSrc',
                    headerCellCalss: 'ui-grid-custom-header-cell-center',
                    displayName: $translate.instant('Admin.Js.BookingServicesSelectvizr.Photo'),
                    cellTemplate:
                        '<div class="ui-grid-cell-contents"><span class="ui-grid-custom-flex-center ui-grid-custom-link-for-img">' +
                        '<img class="ui-grid-custom-col-img" ng-src="{{COL_FIELD}}"></span></div>',
                    width: 80,
                    enableSorting: false,
                    filter: {
                        placeholder: $translate.instant('Admin.Js.BookingServicesSelectvizr.Photo'),
                        type: uiGridConstants.filter.SELECT,
                        name: 'HasPhoto',
                        selectOptions: [
                            { label: $translate.instant('Admin.Js.BookingServicesSelectvizr.WithPhoto'), value: true },
                            {
                                label: $translate.instant('Admin.Js.BookingServicesSelectvizr.WithoutPhoto'),
                                value: false,
                            },
                        ],
                    },
                },
                {
                    name: 'Name',
                    displayName: $translate.instant('Admin.Js.BookingServicesSelectvizr.Name'),
                    cellTemplate: '<div class="ui-grid-cell-contents"><span class="link">{{COL_FIELD}}</span></div>',
                    //filter: {
                    //    placeholder: 'Название',
                    //    type: uiGridConstants.filter.INPUT,
                    //    name: 'Name'
                    //}
                },
                {
                    name: 'Price',
                    displayName: $translate.instant('Admin.Js.BookingServicesSelectVizr.Price'),
                    cellTemplate: '<div class="ui-grid-cell-contents"><span class="link">{{row.entity.PriceString}}</span></div>',
                    width: 100,
                },
                {
                    visible: false,
                    name: 'Enabled',
                    displayName: $translate.instant('Admin.Js.BookingServicesSelectVizr.Active'),
                    cellTemplate: '<ui-grid-custom-switch row="row" class="js-grid-not-clicked" field-name="Enabled"></ui-grid-custom-switch>',
                    width: 90,
                    filter: {
                        name: 'Enabled',
                        placeholder: $translate.instant('Admin.Js.BookingServicesSelectVizr.Activity'),
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            { label: $translate.instant('Admin.Js.BookingServicesSelectVizr.AreActive'), value: true },
                            { label: $translate.instant('Admin.Js.BookingServicesSelectVizr.Inactive'), value: false },
                        ],
                    },
                },
            ];

            ctrl.selectvizrGridOptions = ng.extend({}, uiGridCustomConfig, {
                columnDefs: columnDefsServices,
                enableFullRowSelection: true,
            });

            if (params != null && params.multiSelect === false) {
                ng.extend(ctrl.selectvizrGridOptions, {
                    multiSelect: false,
                    modifierKeysToMultiSelect: false,
                    enableRowSelection: true,
                    enableRowHeaderSelection: false,
                });
            }
        };

        ctrl.onChange = function (categoryId, servicesIds, selectMode) {
            let itemIndex;

            for (let i = 0, len = ctrl.data.length; i < len; i++) {
                if (ctrl.data[i].categoryId === categoryId) {
                    itemIndex = i;
                    break;
                }
            }

            if (itemIndex != null) {
                ctrl.data[itemIndex].ids = servicesIds;
                ctrl.data[itemIndex].selectMode = selectMode;
            } else {
                ctrl.data.push({
                    categoryId,
                    ids: servicesIds,
                    selectMode,
                });
            }
        };

        ctrl.select = function () {
            let promiseArray;

            ctrl.data.forEach((dataItem) => {
                if (dataItem.selectMode == 'all') {
                    const promise = $http
                        .get('bookingService/getServicesIds', {
                            params: {
                                affiliateId: ctrl.affiliateId,
                                categoryFilterId: dataItem.categoryId,
                                ids: dataItem.ids,
                                selectMode: dataItem.selectMode,
                            },
                        })
                        .then((response) => {
                            if (response.data != null) {
                                dataItem.selectMode = 'none';
                                dataItem.ids = response.data.ids.filter((item) => dataItem.ids.indexOf(item) === -1);
                            }

                            return dataItem;
                        });

                    promiseArray ||= [];

                    promiseArray.push(promise);
                }
            });

            $q.all(promiseArray || ctrl.data).then((data) => {
                const allIds = data.reduce((previousValue, currentValue) => previousValue.concat(currentValue.ids), []);

                const uniqueItems = [];

                allIds.concat(ctrl.itemsSelected || []).forEach((item) => {
                    uniqueItems.indexOf(item) === -1 ? uniqueItems.push(item) : null;
                });

                $uibModalInstance.close({ servicesIds: uniqueItems });
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalBookingServicesSelectvizrCtrl.$inject = ['$uibModalInstance', 'uiGridCustomConfig', 'uiGridConstants', '$http', '$q', '$translate'];

    ng.module('uiModal').controller('ModalBookingServicesSelectvizrCtrl', ModalBookingServicesSelectvizrCtrl);
})(window.angular);
