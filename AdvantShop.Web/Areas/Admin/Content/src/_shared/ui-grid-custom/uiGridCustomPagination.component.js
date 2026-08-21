import uiGridCustomPaginationTemplate from './templates/ui-grid-custom-pagination.html';
(function (ng) {
    

    ng.module('uiGridCustomPagination').component('uiGridCustomPagination', {
        templateUrl: uiGridCustomPaginationTemplate,
        controller: 'UiGridCustomPaginationCtrl',
        bindings: {
            gridTotalItems: '<',
            gridPaginationPageSize: '<',
            gridPaginationPageSizes: '<',
            gridPaginationCurrentPage: '<',
            gridPagesCount: '<',
            onChange: '&',
        },
        transclude: true,
    });
})(window.angular);
