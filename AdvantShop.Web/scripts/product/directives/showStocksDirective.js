/* @ngInject */
function showStocksDirective(isMobileService) {
    return {
        restrict: 'A',
        controller () {},
        bindToController: true,
        link (scope, element, attrs, ctrl) {
            element.on('click', () => {
                const isMobile = isMobileService.getValue();
                let stocksTab;

                if (isMobile) {
                    stocksTab = document.querySelector('.product-stocks-data .product-data__header label');
                } else {
                    stocksTab = document.querySelector('#tabStocks .tabs-header-item-link');
                }

                if (stocksTab) {
                    stocksTab.click();
                    stocksTab.scrollIntoView();
                }
            });
        },
    };
}

export { showStocksDirective };
