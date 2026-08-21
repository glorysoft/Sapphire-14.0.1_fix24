(function (ng) {


    const OffersSelectvizrCtrl = function () {
        const ctrl = this;

        ctrl.ids = [];

        ctrl.$onInit = function () {
            ctrl.selectvizrGridParams ??= {};
            ctrl.selectvizrGridParams.categoryId ??= 0;
            ctrl.selectvizrGridParams.showMethod ??= 'AllProducts';
            ctrl.selectvizrTreeSearch ??= {
                ajax: {
                    url: '/adminv2/catalog/categoriesTreeBySearchRequest',
                },
            };
            ctrl.property = ctrl.selectvizrProperty ?? 'OfferId';
        };

        ctrl.treeCallbacks = {
            // eslint-disable-next-line camelcase
            select_node(_event, data) {
                data.instance.open_node(data.node);

                updateOnSelectCategory(data.node.id);
            },
        };

        ctrl.onSelectCategory = function (result) {
            if (result != null) {
                const category = result.categoryIds[0];
                updateOnSelectCategory(category.categoryId);
                ctrl.categoryNameSelected = category.name;
            }
        };

        ctrl.gridOnInit = function (grid) {
            ctrl.grid = grid;
        };

        ctrl.gridSelectionOnInit = function (selectionCustom) {
            ctrl.selectionCustom = selectionCustom;

            ctrl.selectvizrOnChange(
                ng.extend(
                    {
                        categoryId: ctrl.selectvizrGridParams.categoryId,
                    },
                    ctrl.selectionCustom.getSelectedParams(ctrl.property),
                ),
            );
        };

        ctrl.gridSelectionOnChange = function () {
            if (ctrl.selectvizrOnChange != null && ctrl.selectionCustom != null) {
                ctrl.selectvizrOnChange(
                    ng.extend(
                        {
                            categoryId: ctrl.selectvizrGridParams.categoryId,
                            //ids: ctrl.ids
                        },
                        ctrl.selectionCustom.getSelectedParams(ctrl.property),
                    ),
                );
            }
        };

        ctrl.gridOnFetch = function (grid) {
            if (ctrl.selectvizrGridOnFetch != null) {
                ctrl.selectvizrGridOnFetch({ grid });
            }
        };

        function updateOnSelectCategory(categoryId) {
            ctrl.selectvizrGridParams.categoryId = categoryId;

            if (ctrl.selectvizrGridParams.categoryId === 0) {
                ctrl.selectvizrGridParams.showMethod = 'AllProducts';
            } else {
                ctrl.selectvizrGridParams.showMethod = null;
            }

            ctrl.selectvizrGridParams.Page = 1;

            if (ctrl.grid != null) {
                ctrl.grid.setParams(ctrl.selectvizrGridParams);
                ctrl.grid.fetchData();
            }

            if (ctrl.selectvizrOnChange != null) {
                ctrl.selectvizrOnChange({
                    categoryId: ctrl.selectvizrGridParams.categoryId,
                    ids: [],
                });
            }
        }

        ctrl.gridSelectionItemsSelectedFnWrap = function (rowEntity) {
            return ctrl.selectvizrGridSelectionItemsSelectedFn({ rowEntity });
        };

        ctrl.getSelectionStoragePrivateId = () => ctrl.selectvizrGridParams.categoryId;
    };

    ng.module('offersSelectvizr', ['uiGridCustom', 'ui.grid']).controller('OffersSelectvizrCtrl', OffersSelectvizrCtrl);
})(window.angular);
