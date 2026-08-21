/* @ngInject */
function priceAmountListDirective() {
    return {
        restrict: 'A',
        scope: {
            productId: '<',
            offerId: '<',
            startOfferId: '<',
            initFn: '&',
            showHead: '<?',
            lazy: '<?',
            source: '@',
        },
        controller: 'PriceAmountListCtrl',
        controllerAs: 'priceAmountList',
        bindToController: true,
    };
}

export { priceAmountListDirective };
