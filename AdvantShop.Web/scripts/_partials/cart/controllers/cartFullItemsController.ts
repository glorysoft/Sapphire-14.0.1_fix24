export class CartFullItemsCtrl {
    onUpdateAmount!: ({ value, itemId }: { value: number; itemId: number }) => void;
    onRemove!: ({ event, shoppingCartItemId }: { event: JQuery.Event; shoppingCartItemId: number }) => void;
    updateAmount = (value: number, itemId: number): void => {
        this.onUpdateAmount({ value, itemId });
    };

    remove = (event: JQuery.Event, shoppingCartItemId: number) => {
        event?.preventDefault();
        this.onRemove({ event, shoppingCartItemId });
    };
}

angular.module('cart').controller('CartFullItemsCtrl', CartFullItemsCtrl);
