import './couponOffersSelectvizrModal.html';

(function (ng) {
    const ModalCouponOffersSelectvizrCtrl = /* @ngInject */ function (
        $uibModalInstance,
        uiGridCustomConfig,
        uiGridConstants,
        $http,
        domService,
        $translate
    ) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const resolve = ctrl.$resolve;
            ctrl.couponId = resolve != null && resolve.value != null ? ng.copy(ctrl.$resolve.value.couponId) : null;

            ctrl.selectvizrProperty = resolve?.options?.selectvizrProperty;
            ctrl.selectvizrTreeUrl = 'catalog/categoriestree';
            ctrl.selectvizrGridUrl = 'coupons/getOffersCatalog';
            ctrl.inplaceProducts = 'coupons/inplaceApplyCouponToOffer';

            ctrl.selectvizrGridParams = { couponId: ctrl.couponId }; // , isProductSelector: true

            const columns = [
                    {
                        name: 'ArtNo',
                        displayName: $translate.instant('Admin.Js.OfferSelect.VendorCode'),
                        width: 100,
                        enableSorting: false,
                        visible: 500,
                    },
                    {
                        name: 'Name',
                        displayName: $translate.instant('Admin.Js.OffersSelect.Name'),
                        enableSorting: false,
                    },
                    {
                        name: 'ColorName',
                        displayName: $translate.instant('Admin.Js.OffersSelect.Color'),
                        width: 100,
                        enableSorting: false,
                        visible: 900,
                    },
                    {
                        name: 'SizeNameFormatted',
                        displayName: $translate.instant('Admin.Js.OffersSelect.Size'),
                        width: 100,
                        enableSorting: false,
                        visible: 1210,
                    },
                    {
                        name: 'PriceFormatted',
                        displayName: $translate.instant('Admin.Js.OffersSelect.Price'),
                        width: 120,
                        enableSorting: false,
                    },
                    {
                        name: 'Amount',
                        displayName: $translate.instant('Admin.Js.OffersSelect.ProductCount'),
                        width: 100,
                        enableSorting: false,
                        visible: 1250,
                    },


                    {
                        name: 'ApplyCoupon',
                        displayName: $translate.instant('Admin.Js.SettingsCoupon.ApplyCoupon'),
                        //width: 80,
                        enableCellEdit: true,
                        type: 'checkbox',
                        cellTemplate:
                            '<div class="ui-grid-cell-contents js-grid-not-clicked"><label class="ui-grid-custom-edit-field adv-checkbox-label" data-e2e="switchOnOffLabel"><input type="checkbox" class="adv-checkbox-input" ng-model="MODEL_COL_FIELD " data-e2e="switchOnOffSelect" /><span class="adv-checkbox-emul" data-e2e="switchOnOffInput"></span></label></div>',
                        filter: {
                            placeholder: $translate.instant('Admin.Js.SettingsCoupon.ApplyCoupon'),
                            type: uiGridConstants.filter.SELECT,
                            name: 'ApplyCoupon',
                            selectOptions: [
                                { label: $translate.instant('Admin.Js.Properties.Yes'), value: true },
                                { label: $translate.instant('Admin.Js.Properties.No'), value: false },
                            ],
                        },
                    },

                    {
                        name: '_noopColumnArtNo',
                        visible: false,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.OfferSelect.VendorCode'),
                            type: uiGridConstants.filter.INPUT,
                            name: 'ArtNo',
                        },
                    },
                    {
                        name: '_noopColumnName',
                        visible: false,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.OffersSelect.Name'),
                            type: uiGridConstants.filter.INPUT,
                            name: 'Name',
                        },
                    },
                    {
                        name: '_noopColumnBrandId',
                        visible: false,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.ProductSelect.Manufacturer'),
                            type: uiGridConstants.filter.SELECT,
                            name: 'BrandId',
                            fetch: 'catalog/getBrandList',
                            dynamicSearch: true,
                        },
                    },
                    {
                        name: '_noopColumnColorId',
                        visible: false,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.ProductSelect.Color'),
                            type: uiGridConstants.filter.SELECT,
                            name: 'ColorId',
                            fetch: 'catalog/GetColorList',
                            dynamicSearch: true,
                        },
                    },
                    {
                        name: '_noopColumnSizeId',
                        visible: false,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.ProductSelect.Size'),
                            type: uiGridConstants.filter.SELECT,
                            name: 'SizeId',
                            fetch: 'catalog/GetSizeList',
                            dynamicSearch: true,
                        },
                    },
                    {
                        name: '_noopColumnPropertyId',
                        visible: false,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.ProductSelect.Property'),
                            type: uiGridConstants.filter.SELECT,
                            name: 'PropertyId',
                            fetch: 'catalog/GetPropertyList',
                            dynamicSearch: true,
                            change(_params, item, filterCtrl) {
                                let colPropertyValue;

                                if (typeof filterCtrl.blocks !== 'undefined' && filterCtrl.blocks !== null) {
                                    for (let i = 0, len = filterCtrl.blocks.length; i < len; i++) {
                                        if (filterCtrl.blocks[i].name === 'PropertyValueId') {
                                            colPropertyValue = filterCtrl.blocks[i];
                                            break;
                                        }
                                    }
                                }
                                if (typeof colPropertyValue !== 'undefined') {
                                    colPropertyValue.filter.term = null;
                                    filterCtrl.fill(item.filter.type, colPropertyValue, null, 'PropertyValueId');
                                }
                            },
                        },
                    },
                    {
                        name: '_noopColumnPropertyValueId',
                        visible: false,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.ProductSelect.PropertyValue'),
                            type: uiGridConstants.filter.SELECT,
                            name: 'PropertyValueId',
                            fetch: 'catalog/GetPropertyValueList',
                            dynamicSearch: true,
                            dynamicSearchRelations: ['PropertyId'],
                        },
                    },
                    {
                        name: '_noopColumnPrice',
                        visible: false,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.ProductSelect.Price'),
                            type: 'range',
                            rangeOptions: {
                                from: {
                                    name: 'PriceFrom',
                                },
                                to: {
                                    name: 'PriceTo',
                                },
                            },
                            fetch: 'catalog/GetOfferPriceRangeForPaging',
                        },
                    },
                    {
                        name: '_noopColumnAmount',
                        visible: false,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.ProductSelect.Quantity'),
                            type: 'range',
                            rangeOptions: {
                                from: {
                                    name: 'AmountFrom',
                                },
                                to: {
                                    name: 'AmountTo',
                                },
                            },
                            fetch: 'catalog/getamountrangeforpaging',
                        },
                    },
                    {
                        name: '_noopColumnEnabled',
                        visible: false,
                        filter: {
                            name: 'Enabled',
                            placeholder: $translate.instant('Admin.Js.ProductSelect.Activity'),
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [
                                { label: $translate.instant('Admin.Js.ProductSelect.TheyActive'), value: true },
                                { label: $translate.instant('Admin.Js.ProductSelect.Inactive'), value: false },
                            ],
                        },
                    },
                    {
                        name: '_noopColumnBarCode',
                        visible: false,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.Catalog.BarCode'),
                            type: uiGridConstants.filter.INPUT,
                            name: 'BarCode',
                        },
                    }
                ];

            ctrl.selectvizrGridOptions = ng.extend({}, uiGridCustomConfig, {
                columnDefs: columns,
                enableFullRowSelection: true,
                showTreeExpandNoChildren: false,
                uiGridCustom: {
                    selectionOptions: [
                        {
                            text: 'Применять купон к товарам',
                            url: 'coupons/ApplyCouponToOffers',
                            field: 'OfferId',
                        },
                        {
                            text: 'Не применять купон к товарам',
                            url: 'coupons/NotApplyCouponToOffers',
                            field: 'OfferId',
                        },
                    ],
                    rowClick($event, row, grid) {
                        if (
                            row.treeNode.children &&
                            row.treeNode.children.length > 0 &&
                            domService.closest($event.target, '.ui-grid-tree-base-row-header-buttons') === null
                        ) {
                            grid.gridApi.treeBase.toggleRowTreeState(row);
                        }
                    },
                    rowClasses(row) {
                        return typeof row.treeNode.children === 'undefined' ||
                        row.treeNode.children === null ||
                        row.treeNode.children.length === 0
                            ? 'ui-grid-custom-prevent-pointer'
                            : '';
                    },
                },
            });

            uiGridCustomConfig.enableHorizontalScrollbar = 1;

            if (ctrl.$resolve.multiSelect === false) {
                ng.extend(ctrl.selectvizrGridOptions, {
                    multiSelect: false,
                    modifierKeysToMultiSelect: false,
                    enableRowSelection: true,
                    enableRowHeaderSelection: true,
                });
            }
        };

        ctrl.onChange = function (categoryId, ids, selectMode) {
            ctrl.data = {
                categoryId,
                ids,
                selectMode,
            };
        };

        ctrl.gridOnFetch = function (grid) {
            if (typeof grid !== 'undefined' && grid?.gridOptions?.data?.length > 0) {
                for (let i = 0, len = grid.gridOptions.data.length; i < len; i++) {
                    if (grid.gridOptions.data[i].Main === true) {
                        grid.gridOptions.data[i].$$treeLevel = 0;
                    }
                }
            }
        };

        ctrl.select = function () {
            if (ctrl.data.selectMode === 'all') {
                $http.get('coupons/getCouponOfferIds', { params: ctrl.data }).then((response) => {
                    if (typeof response.data !== 'undefined' && response.data !== null) {
                        ctrl.data.selectMode = 'none';
                        ctrl.data.ids = response.data.ids.filter((item) => ctrl.data.ids.indexOf(item) === -1);
                    }
                    $uibModalInstance.close(ctrl.data);
                });
            } else {
                $uibModalInstance.close(ctrl.data);
            }
        };

        ctrl.close = function () {
            $uibModalInstance.close('close');
        };

        ctrl.gridSelectionItemsSelectedFn = function (rowEntity) {
            if (typeof ctrl.$resolve?.gridSelectionItemsSelectedFn?.fn !== 'undefined') {
                return ctrl.$resolve.gridSelectionItemsSelectedFn.fn(rowEntity);
            }
            return undefined;
        };
    };

    ng.module('uiModal').controller('ModalCouponOffersSelectvizrCtrl', ModalCouponOffersSelectvizrCtrl);
})(window.angular);
