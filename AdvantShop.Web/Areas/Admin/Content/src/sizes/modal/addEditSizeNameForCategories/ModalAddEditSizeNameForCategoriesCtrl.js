import mobileModalEditSizeNameForCategory from './mobileModalEditSizeNameForCategory.html';
(function (ng) {
    

    const ModalAddEditSizeNameForCategoriesCtrl = function (
        uiGridCustomConfig,
        uiGridConstants,
        $translate,
        $uibModalInstance,
        $uibModal,
        $http,
        toaster,
    ) {
        const ctrl = this,
            columnDefs = [
                {
                    name: 'SizeName',
                    displayName: $translate.instant('Admin.Js.SizeForCategory.SizeName'),
                    enableCellEdit: false,
                    filter: {
                        placeholder: $translate.instant('Admin.Js.SizeForCategory.SizeName'),
                        type: uiGridConstants.filter.INPUT,
                        name: 'SizeName',
                    },
                },
                {
                    name: 'SizeNameForCategory',
                    displayName: $translate.instant('Admin.Js.SizeForCategory.NameForCategory'),
                    enableCellEdit: true,
                    uiGridCustomEdit: {
                        replaceNullable: false,
                    },
                    filter: {
                        placeholder: $translate.instant('Admin.Js.SizeForCategory.NameForCategory'),
                        type: uiGridConstants.filter.INPUT,
                        name: 'SizeNameForCategory',
                    },
                },
            ];

        ctrl.gridOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs,
        });

        ctrl.gridOnInit = function (grid) {
            grid.setParams({
                CategoryId: ctrl.selectedCategory || 0,
            });
            ctrl.grid = grid;
        };

        ctrl.selectCategory = function (event, data) {
            ctrl.selectedCategory = data.node.id;
            ctrl.grid.setParams({
                CategoryId: data.node.id,
            });
            ctrl.grid.fetchData(true);
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.modalEditSizeNameForCategory = function (entity) {
            let objParams = {
                CategoryId: entity.CategoryId,
                SizeId: entity.SizeId,
                SizeName: entity.SizeName,
                SizeNameForCategory: entity.SizeNameForCategory,
            };

            objParams = Object.assign(objParams, ctrl.grid._params);

            $uibModal
                .open({
                    bindToController: true,
                    controller: 'ModalAddEditSizeNameForCategoriesCtrl',
                    controllerAs: 'ctrl',
                    backdrop: 'static',
                    templateUrl: mobileModalEditSizeNameForCategory,
                    resolve: {
                        params: objParams,
                    },
                })
                .result.then((result) => {
                    ctrl.grid.fetchData(true);
                });
        };

        ctrl.saveSizeNameForCategory = function (params) {
            $http.post('sizes/inplaceCategorySizeName', params).then((response) => {
                const data = response.data;
                if (data.result == true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.Sizes.ChangesSaved'));
                    $uibModalInstance.close('saveSize');
                } else {
                    toaster.pop('error', $translate.instant('Admin.Js.Sizes.Error'), $translate.instant('Admin.Js.Sizes.ErrorAddingEditing'));
                }
            });
        };
    };

    ModalAddEditSizeNameForCategoriesCtrl.$inject = [
        'uiGridCustomConfig',
        'uiGridConstants',
        '$translate',
        '$uibModalInstance',
        '$uibModal',
        '$http',
        'toaster',
    ];

    ng.module('uiModal').controller('ModalAddEditSizeNameForCategoriesCtrl', ModalAddEditSizeNameForCategoriesCtrl);
})(window.angular);
