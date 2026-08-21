export class CartFullSummaryCtrl {
    onRefresh!: () => void;
    refresh = (): void => {
        this.onRefresh();
    };
}

angular.module('cart').controller('CartFullSummaryCtrl', CartFullSummaryCtrl);
