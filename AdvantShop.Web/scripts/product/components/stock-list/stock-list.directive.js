import stockListTemplate from './stock-list.html';

export default function StockListDirective() {
    return {
        scope: {
            offerId: '<?',
            isMobile: '<',
        },
        controller: [
            'productService',
            function (productService) {
                const ctrl = this;
                ctrl.$onInit = () => {
                    ctrl.isLoadingStocks = true;
                };
                ctrl.getStockList = (offerId) => {
                    productService
                        .getOfferStocks(offerId)
                        .then((data) => {
                            if (data.result === true) {
                                ctrl.stockListData = data.obj.Stocks;
                            } else {
                                data.errors.forEach((error) => {
                                    console.error(error);
                                });
                            }
                        })
                        .finally(() => {
                            ctrl.isLoadingStocks = false;
                        });
                };
            },
        ],
        bindToController: true,
        controllerAs: '$ctrl',
        templateUrl: stockListTemplate,
        link: (scope, _element, _attr, ctrl) => {
            scope.$watch('$ctrl.offerId', (newValue, _oldValue, _scope) => {
                if (newValue != null) {
                    ctrl.getStockList(newValue);
                }
            });
        },
    };
}
