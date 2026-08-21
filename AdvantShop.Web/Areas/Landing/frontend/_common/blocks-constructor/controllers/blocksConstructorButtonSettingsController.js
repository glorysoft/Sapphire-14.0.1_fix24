(function (ng) {


    /* @ngInject */
    const BlocksConstructorButtonSettingsCtrl = function (
        blocksConstructorService,
        modalService,
        toaster,
        uiGridCustomConfig,
        uiGridConstants,
        $http,
        domService,
        $translate,
        lpSettingsService,
        $q,
        $scope,
    ) {
        const ctrl = this;
        const offerCache = {};

        ctrl.$onInit = function () {
            ctrl.isMobile = window.matchMedia('(max-width: 768px)').matches;

            ctrl.buttonActions = [];

            if (ctrl.linkExclude !== true) {
                ctrl.buttonActions.push({
                    label: $translate.instant('Admin.Js.Landings.BlocksConstructor.Controllers.BlocksConstructorButton.URL'),
                    value: 'Url',
                });

                ctrl.buttonActions.push({
                    label: $translate.instant('Admin.Js.Landings.BlocksConstructor.Controllers.BlocksConstructorButton.GoToBlock'),
                    value: 'Section',
                });
            }

            if (ctrl.commonOptions.Type === 'exit') {
                ctrl.buttonActions.push({
                    label: $translate.instant('Admin.Js.Landings.BlocksConstructor.Controllers.BlocksConstructorButton.ClosingModalWindow'),
                    value: 'ModalClose',
                });
            }
            if (ctrl.formExclude !== true) {
                ctrl.buttonActions.push({
                    label: $translate.instant('Admin.Js.Landings.BlocksConstructor.Controllers.BlocksConstructorButton.ShowPopup'),
                    value: 'Form',
                });
            }

            if (ctrl.paymentExclude !== true) {
                ctrl.buttonActions.push({
                    label: $translate.instant('Admin.Js.Landings.BlocksConstructor.Controllers.BlocksConstructorButton.ProceedToPayment'),
                    value: 'Checkout',
                });

                ctrl.buttonActions.push({
                    label: $translate.instant('Admin.Js.Landings.BlocksConstructor.Controllers.BlocksConstructorButton.ProceedToPaymentUpsell'),
                    value: 'CheckoutUpsell',
                });
            }

            ctrl.showShippingsMethodsList = [
                {
                    label: $translate.instant('Admin.Js.Landings.BlocksConstructor.Controllers.BlocksConstructorButton.Never'),
                    value: 'Never',
                },
                {
                    label: $translate.instant('Admin.Js.Landings.BlocksConstructor.Controllers.BlocksConstructorButton.ByClick'),
                    value: 'ByClick',
                },
                {
                    label: $translate.instant('Admin.Js.Landings.BlocksConstructor.Controllers.BlocksConstructorButton.Always'),
                    value: 'Always',
                },
            ];
        };

        ctrl.selectBlock = function (blockSelected) {
            ctrl.buttonOptions.action_section = `#${  blockSelected.id}`;
        };

        ctrl.changeAction = function (action) {
            ctrl.buttonOptions.action_form = action === 'Form' ? ctrl.commonOptions.Form.Id : null;
            ctrl.buttonOptions.action_upsell_lp_id = null;
        };

        ctrl.selectOffer = function (buttonsOptions, isOne) {
            const parentData = {
                modalData: {
                    selectvizrGridOptions: ng.extend({}, uiGridCustomConfig, {
                        columnDefs: [
                            {
                                name: 'ArtNo',
                                displayName: $translate.instant('Admin.Js.OfferSelect.VendorCode'),
                                width: 100,
                                enableSorting: false,
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
                            },
                            {
                                name: 'SizeName',
                                displayName: $translate.instant('Admin.Js.OffersSelect.Size'),
                                width: 100,
                                enableSorting: false,
                            },
                            {
                                name: 'PriceFormatted',
                                displayName: $translate.instant('Admin.Js.OffersSelect.Price'),
                                width: 120,
                                enableSorting: false,
                            },
                        ],

                        showTreeExpandNoChildren: false,
                        uiGridCustom: {
                            rowClick ($event, row, grid) {
                                if (
                                    row.treeNode.children &&
                                    row.treeNode.children.length > 0 &&
                                    domService.closest($event.target, '.ui-grid-tree-base-row-header-buttons') == null
                                ) {
                                    grid.gridApi.treeBase.toggleRowTreeState(row);
                                }
                            },
                            rowClasses (row) {
                                const classes = [];

                                if (row.treeNode.children == null || row.treeNode.children.length === 0) {
                                    classes.push('ui-grid-custom-prevent-pointer');
                                }

                                if (!row.entity.Enabled) {
                                    classes.push('ui-grid-custom-disabled-item-row');
                                }

                                return classes.join(' ');

                                //return row.treeNode.children == null || row.treeNode.children.length === 0 ? 'ui-grid-custom-prevent-pointer' : '';
                            },
                        },
                    }),
                    gridOnFetch (grid) {
                        if (grid != null && grid.gridOptions != null && grid.gridOptions.data != null && grid.gridOptions.data.length > 0) {
                            for (let i = 0, len = grid.gridOptions.data.length; i < len; i++) {
                                if (grid.gridOptions.data[i].Main === true) {
                                    grid.gridOptions.data[i].$$treeLevel = 0;
                                }
                            }
                        }
                    },
                    onChange (categoryId, ids, selectMode) {
                        ctrl.data = {
                            categoryId,
                            ids,
                            selectMode,
                        };
                    },
                    async select () {
                        if (ctrl.data.selectMode == 'all') {
                            await $http
                                .get('adminv3/catalog/getCatalogOfferIds', { params: ctrl.data })
                                .then((response) => {
                                    if (response.data != null) {
                                        ctrl.data.selectMode = 'none';
                                        ctrl.data.ids = response.data.ids.filter((item) => ctrl.data.ids.indexOf(item) === -1);
                                    }
                                    buttonsOptions.use_many_offers = true;
                                    buttonsOptions.action_offer_id = null;
                                    buttonsOptions.action_offer_items = ctrl.getActionOfferItems(buttonsOptions.action_offer_items, ctrl.data.ids);
                                    return ctrl.data;
                                })
                                .then(async (data) => {
                                    await ctrl.getActionOfferItemsPrepared(buttonsOptions);
                                    modalService.close('modalSelectOffer');
                                    return data;
                                });
                        } else {
                            buttonsOptions.use_many_offers = true;
                            buttonsOptions.action_offer_id = null;
                            buttonsOptions.action_offer_items = ctrl.getActionOfferItems(buttonsOptions.action_offer_items, ctrl.data.ids);

                            if (
                                isOne != null &&
                                isOne == true &&
                                buttonsOptions.action_offer_items != null &&
                                buttonsOptions.action_offer_items.length > 0
                            ) {
                                if (ctrl.buttonOptions.show_options && buttonsOptions.action_offer_items.length > 1) {
                                    buttonsOptions.action_offer_items = [buttonsOptions.action_offer_items[1]];
                                } else {
                                    buttonsOptions.action_offer_items = [buttonsOptions.action_offer_items[0]];
                                }
                            }
                            await ctrl.getActionOfferItemsPrepared(buttonsOptions);
                            modalService.close('modalSelectOffer');
                            return ctrl.data;
                        }
                    },
                },
            };

            modalService.renderModal(
                'modalSelectOffer',
                '{{\'Admin.Js.Landings.BlocksConstructor.Controllers.ButtonSettings.SelectProduct\'|translate}}',
                '<div class="blocks-constructor-settings-col--vertical"><offers-selectvizr selectvizr-tree-url="\'adminv3/catalog/categoriestree\'" ' +
                    'selectvizr-grid-url="\'adminv3/catalog/getOffersCatalog\'" ' +
                    'selectvizr-grid-options="modalData.selectvizrGridOptions" ' +
                    'selectvizr-grid-on-fetch="modalData.gridOnFetch(grid)" ' +
                    'selectvizr-on-change="modalData.onChange(categoryId, ids, selectMode)"' +
                    '>' +
                    '</offers-selectvizr></div>',
                '<input type="button" class="blocks-constructor-btn-confirm" data-ng-click="modalData.select()" value="{{\'Admin.Js.Landings.BlocksConstructor.Controllers.ButtonSettings.Apply\'|translate}}" />' +
                    '<input type="button" class="blocks-constructor-btn-cancel blocks-constructor-btn-mar" data-modal-close="modalSelectOffer" value="{{\'Admin.Js.Landings.BlocksConstructor.Controllers.ButtonSettings.Cancel\'|translate}}" />',
                {
                    modalClass: 'blocks-constructor-modal',
                    modalOverlayClass: 'blocks-constructor-modal-floating-wrap blocks-constructor-modal--settings',
                    isFloating: true,
                    backgroundEnable: false,
                    destroyOnClose: true,
                },
                parentData,
            );

            modalService.getModal('modalSelectOffer').then((modal) => {
                modal.modalScope.open();
            });
        };

        ctrl.getActionOfferItems = function (items, ids) {
            items ||= [];
            const res = items;
            for (let i = 0; i < ids.length; i++) {
                var offerId = ids[i];
                const finded = items.filter((x) => x.offerId == offerId);

                if (finded == null || finded.length == 0) {
                    res.push({ offerId, offerPrice: '' });
                }
            }
            return res;
        };

        ctrl.getActionOfferItemsPrepared = async function (buttonOptions) {
            return (ctrl.action_offer_items_prepared = await blocksConstructorService.getOfferDataFromId(buttonOptions.action_offer_items || []));
        };

        ctrl.getActionOfferItemsPreparedForOne = async function (buttonOptions) {
            if (buttonOptions.action_offer_items != null && buttonOptions.action_offer_items.length > 1) {
                buttonOptions.action_offer_items = [buttonOptions.action_offer_items[0]];
            }

            await ctrl.getActionOfferItemsPrepared(buttonOptions);

            $scope.$digest();

            return ctrl.action_offer_items_prepared;
        };

        ctrl.getPreparedActionOfferItem = function (offerId) {
            if (offerCache[offerId] != null) {
                return offerCache[offerId];
            }

            if (ctrl.action_offer_items_prepared == null) {
                return null;
            }

            const items = ctrl.action_offer_items_prepared.filter((x) => x.offerId == offerId);

            if (items != null && items.length > 0) {
                offerCache[offerId] = items[0];
                return items[0];
            }
                return null;


            //return items != null && items.length > 0 ? items[0] : {};
        };

        ctrl.deleteActionOfferItem = function (actionOfferItems, preparedItem) {
            actionOfferItems.splice(actionOfferItems.indexOf(preparedItem), 1);

            const items = ctrl.action_offer_items_prepared.filter((x) => x.offerId === preparedItem.offerId);
            if (items != null && items.length > 0) {
                ctrl.action_offer_items_prepared.splice(ctrl.action_offer_items_prepared.indexOf(items[0]), 1);
            }
        };

        ctrl.getProductNameByOfferId = function (offerId, setPrice) {
            if (offerId == null || offerId.length == 0 || offerId == 0) {
                return;
            }

            blocksConstructorService.getProductNameByOfferId({ offerId }).then((response) => {
                const {data} = response;
                if (data != null) {
                    ctrl.productId = data.ProductId;
                    ctrl.productName = `[${  data.ArtNo  }] ${  data.Name}`;
                    ctrl.productEnabled = data.Enabled;
                    //if (setPrice && (ctrl.buttonOptions.action_offer_price == null || ctrl.buttonOptions.action_offer_price.length == 0)) {
                    //    ctrl.buttonOptions.action_offer_price = data.Price;
                    //}
                }
            });
        };

        ctrl.setDefaultMinAmount = function (item) {
            if (item.offerId == null || item.offerId === '' || (item.offerAmount != null && item.offerAmount !== '')) {
                if (item.offerAmount != null && item.offerAmount !== '') {
                    item.offerAmount = parseFloat(item.offerAmount);
                }
                return;
            }

            blocksConstructorService.getProductNameByOfferId(item).then((data) => {
                if (data != null) {
                    item.offerAmount = parseFloat(data.MinAmount);
                }
            });
        };

        ctrl.deleteProduct = function (buttonsOptions) {
            buttonsOptions.action_offer_id = null;
            ctrl.productId = null;
            ctrl.productName = null;
            ctrl.productEnabled = null;
        };

        ctrl.initUseManyOffers = function (buttonOptions, isForm) {
            if (buttonOptions.use_many_offers == true) {
                buttonOptions.action_offer_id = null;
                buttonOptions.action_offer_items = buttonOptions.action_offer_items.filter((x) => x.offerId != null && x.offerId !== '');
            } else {
                buttonOptions.use_many_offers = true;
                buttonOptions.action_offer_items = [];

                if (buttonOptions.action_offer_id != null && buttonOptions.action_offer_id != '') {
                    buttonOptions.action_offer_items.push({ offerId: buttonOptions.action_offer_id, offerPrice: '' });
                }
                buttonOptions.action_offer_id = null;
            }
        };
    };

    ng.module('blocksConstructor').controller('BlocksConstructorButtonSettingsCtrl', BlocksConstructorButtonSettingsCtrl);
})(window.angular);
