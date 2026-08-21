import catalogFilterTemplate from './../templates/catalogFilter.html';
(function (ng) {
    

    ng.module('catalogFilter').directive('catalogFilter', () => ({
            restrict: 'A',
            scope: {
                url: '@',
                urlCount: '@',
                parameters: '&',
                countVisibleCollapse: '&',
                onFilterInit: '&',
                advPopoverOptions: '<?',
                footerSticky: '<?',
                isMobile: '<?',
                filter: '&',
                onInit: '&',
                hideFilterByPrice: '<?',
                hideFilterByBrand: '<?',
                hideFilterByColor: '<?',
                hideFilterBySize: '<?',
                hideFilterByProperty: '<?',
            },
            replace: true,
            templateUrl: catalogFilterTemplate,
            controller: 'CatalogFilterCtrl',
            controllerAs: 'catalogFilter',
            bindToController: true,
        }));
    ng.module('catalogFilter').directive('catalogFilterSort', () => ({
            restrict: 'A',
            scope: {
                asc: '@',
                desc: '@',
            },
            replace: true,
            transclude: true,
            template: '<a data-ng-transclude data-ng-click="catalogFilterSort.sort()"></a>',
            controller: 'CatalogFilterSortCtrl',
            controllerAs: 'catalogFilterSort',
            bindToController: true,
        }));
    ng.module('catalogFilter').directive('catalogFilterSelectSort', () => ({
            restrict: 'A',
            scope: true,
            controller: 'CatalogFilterSortCtrl',
            controllerAs: 'catalogFilterSort',
            bindToController: true,
        }));
})(window.angular);
