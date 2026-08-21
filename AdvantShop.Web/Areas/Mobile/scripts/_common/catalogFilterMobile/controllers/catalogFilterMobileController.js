/*@ngInject*/
function CatalogFilterMobileCtrl($window, $cookies, catalogFilterService, sidebarsContainerService, $translate, urlHelper) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.getFiltersCount();
    };

    ctrl.changeSort = function (curSort) {
        const search = catalogFilterService.parseSearchString($window.location.search);
        const sortValue = curSort;
        delete search.page;
        const objForUrl = angular.extend({}, search, {}, { sort: sortValue });
        $window.location.search = catalogFilterService.buildUrl(objForUrl);
    };

    //classic mobile template
    ctrl.setView = function (viewmode) {
        $cookies.put('mobile_viewmode', viewmode);
        $window.location.reload();
    };

    ctrl.setFilterVisibility = function (visible) {
        ctrl.isFilterVisible = visible;
    };

    ctrl.openInSidebar = function (templateUrl) {
        sidebarsContainerService.open({
            sidebarClass: 'sidebar-catalog-filter',
            contentId: 'sidebarCatalogFilter',
            templateUrl,
            title: $translate.instant('Js.CatalogFilter.Filters'),
            hideFooter: true,
        });
    };

    ctrl.getFiltersCount = function () {
        let count = 0;

        if (urlHelper.getUrlParamByName('pricefrom') != null || urlHelper.getUrlParamByName('priceto') != null) {
            count++;
        }
        const brands = urlHelper.getUrlParamByName('brand');
        if (brands != null) {
            count += ctrl.getSplitCount(brands, ',');
        }

        const colors = urlHelper.getUrlParamByName('color');
        if (colors != null) {
            count += ctrl.getSplitCount(colors, ',');
        }

        const sizes = urlHelper.getUrlParamByName('size');
        if (sizes != null) {
            count += ctrl.getSplitCount(sizes, ',');
        }
        const warehouses = urlHelper.getUrlParamByName('warehouse');
        if (warehouses != null) {
            count += ctrl.getSplitCount(warehouses, ',');
        }

        let props = null;
        const paramsAsObject = urlHelper.getUrlParamsUniversalAsObject();
        if (paramsAsObject != null) {
            props = urlHelper.getUrlParamDictionaryByNameFunc((paramName) => paramName === 'prop' || (paramName.indexOf('prop_') === 0 && paramName.indexOf('_min') === -1), paramsAsObject);
        }

        if (props != null && props.length > 0) {
            if (props.length === 1 && props[0].value != null) {
                count += ctrl.getSplitCount(props[0].value, ',');
            } else {
                count += Object.keys(props).length;
            }
        }

        if (urlHelper.getUrlParamByName('available') != null) {
            count++;
        }

        ctrl.selectedFiltersCount = count;
    };

    ctrl.getSplitCount = function (props, separator) {
        let count = 0;
        const arr = props.split(separator);
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] != '') {
                count++;
            }
        }
        return count;
    };
}

export default CatalogFilterMobileCtrl;
