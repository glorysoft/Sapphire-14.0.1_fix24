import { IController, ISCEService } from 'angular';

export interface IProductButtonsContainerCtrl extends IController {
    productViewItem: any;
    content?: string;

    onChangeColor(): void;
}

export default class ProductButtonsContainerCtrl implements IProductButtonsContainerCtrl {
    productViewItem;
    content?: string;

    /* @ngInject */
    constructor(
        readonly $sce: ISCEService,
        readonly productViewService,
    ) {
    }

    $onInit() {
        this.productViewItem.registerChildOnChangeColor(this);
    };

    onChangeColor() {
        this.productViewService.getProductViewButtons(
            this.productViewItem.productId,
            this.productViewItem.offer.OfferId
        ).then((html) => {
            this.content = this.$sce.trustAsHtml(html);
        });
    }
}
