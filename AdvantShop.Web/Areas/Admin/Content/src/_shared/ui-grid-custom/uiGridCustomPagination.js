(function (ng) {
    

    const UiGridCustomPaginationCtrl = function ($element, domService) {
        const ctrl = this;

        ctrl.change = function (paginationCurrentPage, paginationPageSize, paginationPageSizes, $event) {
            const gridElement = domService.closest($element[0], 'ui-grid-custom');

            //if (ctrl.gridTotalItems < paginationCurrentPage * paginationPageSize) {
            //    paginationCurrentPage = 1;
            //}

            if (gridElement != null) {
                gridElement.scrollIntoView();
            }

            ctrl.onChange({
                paginationCurrentPage,
                paginationPageSize,
                paginationPageSizes,
            });
        };
    };

    UiGridCustomPaginationCtrl.$inject = ['$element', 'domService'];

    ng.module('uiGridCustomPagination', ['dom']).controller('UiGridCustomPaginationCtrl', UiGridCustomPaginationCtrl);
})(window.angular);
