import productVideosTemplate from './productVideos.html';
import addEditVideoTemplate from './modal/addEditVideo/AddEditVideo.html';

const ProductVideosCtrl = /* @ngInject */ function(uiGridCustomConfig, $translate) {
    const ctrl = this;

    ctrl.$onInit = function() {
        ctrl.showGridVideos = true;
    };

    ctrl.gridOptions = angular.extend({}, uiGridCustomConfig, {
        columnDefs: [
            {
                name: 'Name',
                displayName: $translate.instant('Admin.Js.Product.Name'),
                enableCellEdit: true,
                enableSorting: false,
                cellTemplate:
                    '<div class="ui-grid-cell-contents" ng-bind="row.entity[\'Name\'] || (\'Admin.Js.ProductVideos.NameNotSpecified\'|translate)"><div>',
                uiGridCustomEdit: {
                    replaceNullable: false,
                    customViewValue: 'videoName',
                    customModel: 'nameEdit',
                    onInit(rowEntity, _colDef, _newValue, uiGridEditCustom) {
                        uiGridEditCustom.nameEdit = rowEntity.Name || $translate.instant('Admin.Js.ProductVideos.NameNotSpecified');
                        uiGridEditCustom.videoName = rowEntity.Name || $translate.instant('Admin.Js.ProductVideos.NameNotSpecified');
                    },
                    onActive(rowEntity, _colDef, _newValue, uiGridEditCustom) {
                        uiGridEditCustom.nameEdit = rowEntity.Name;
                        uiGridEditCustom.videoName = rowEntity.Name || $translate.instant('Admin.Js.ProductVideos.NameNotSpecified');
                    },
                    onDeactive(rowEntity, _colDef, _newValue, uiGridEditCustom) {
                        uiGridEditCustom.nameEdit = rowEntity.Name || $translate.instant('Admin.Js.ProductVideos.NameNotSpecified');
                        uiGridEditCustom.videoName = rowEntity.Name || $translate.instant('Admin.Js.ProductVideos.NameNotSpecified');
                    },
                    onChange(rowEntity, _colDef, newValue) {
                        rowEntity.Name = newValue;
                    },
                },
            },
            {
                name: 'VideoSortOrder',
                displayName: $translate.instant('Admin.Js.Product.SortingOrder'),
                enableCellEdit: true,
                enableSorting: false,
                width: 100,
            },
            {
                name: '_serviceColumn',
                displayName: '',
                width: 80,
                enableSorting: false,
                useInSwipeBlock: true,
                cellTemplate:
                    `<div ng-if="!grid.appScope.$ctrl.isMobile" class="ui-grid-cell-contents"><div>` +
                    `<ui-modal-trigger data-controller="'ModalAddEditVideoCtrl'" controller-as="ctrl" ` +
                    `template-url="${
                        addEditVideoTemplate
                    }" ` +
                    `data-resolve="{'productVideoId': row.entity.ProductVideoId, 'productId': row.entity.ProductId}" ` +
                    `window-class ="product-modal-video"` +
                    `data-on-close="grid.appScope.$ctrl.fetchData()"> ` +
                    `<button type="button" class="btn-icon link-invert ui-grid-custom-service-icon fas fa-pencil-alt" aria-label="Редактировать"></button> ` +
                    `</ui-modal-trigger>` +
                    `<ui-grid-custom-delete url="product/deleteVideo" params="{'productVideoId': row.entity.ProductVideoId }"></ui-grid-custom-delete>` +
                    `</div></div>` +
                    `<ui-grid-custom-delete ng-if="grid.appScope.$ctrl.isMobile" url="product/deleteVideo" params="{'productVideoId': row.entity.ProductVideoId }" class="btn btn-sm btn-danger btn--as-swipe-line flex center-xs middle-xs">Удалить</ui-grid-custom-delete>`,
            },
        ],
    });

    ctrl.gridOnInit = function(grid) {
        ctrl.gridVideos = grid;
    };
};

angular.module('productVideos', ['uiGridCustom'])
    .controller('ProductVideosCtrl', ProductVideosCtrl)
    .component('productVideos', {
        templateUrl: productVideosTemplate,
        controller: ProductVideosCtrl,
        controllerAs: 'ctrl',
        bindings: {
            productId: '=',
            isMobileMode: '<?',
        },
    });
