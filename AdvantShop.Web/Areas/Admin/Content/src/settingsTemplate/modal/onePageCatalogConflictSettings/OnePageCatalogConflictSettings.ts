import './onePageCatalogConflictSettings.scss';
import './onePageCatalogConflictSettings.html';
import type { IHttpService, IWindowService } from 'angular';

interface IOnePageCatalogConflictSettingsData {
    ShowSettingSearchBlockLocation: boolean;
    ShowSettingSearchByCategories: boolean;
    ShowSettingShowShippingsMethodsInDetails: boolean;
    ShowSettingDisplayCategoriesInBottomMenu: boolean;
    ShowSettingEnableCompareProducts: boolean;
    ShowSettingMainPageProductReviewsVisibility: boolean;
    ShowSettingBuyInOneClick: boolean;
    ShowSettingRelatedProduct: boolean;
    ShowSettingShowCategoryTreeInBrand: boolean;

    TurnOffSearchBlockLocation: boolean;
    TurnOffSearchByCategories: boolean;
    TurnOffShowShippingsMethodsInDetails: boolean;
    TurnOffDisplayCategoriesInBottomMenu: boolean;
    TurnOffEnableCompareProducts: boolean;
    TurnOffMainPageProductReviewsVisibility: boolean;
    TurnOffBuyInOneClick: boolean;
    TurnOffRelatedProduct: boolean;
    TurnOffShowCategoryTreeInBrand: boolean;
    IsExistConflictSettings: boolean;
}

export class OnePageCatalogConflictSettingsCtrl {
    private data: IOnePageCatalogConflictSettingsData | object | undefined;
    private inSaveProgress = false;
    private $resolve: { onePageCatalogData: IOnePageCatalogConflictSettingsData } | undefined;

    /* @ngInject */
    constructor(
        private readonly $http: IHttpService,
        private readonly $uibModalInstance,
        private readonly $window: IWindowService,
        onePageCatalogData: IOnePageCatalogConflictSettingsData,
    ) {
        this.data = onePageCatalogData;
    }

    save(needOff: boolean) {
        if (needOff === true) {
            this.inSaveProgress = true;
            this.$http
                .post<IOnePageCatalogConflictSettingsData>('settings/onePageCatalogConflictSettings', this.data)
                .then(() => {
                    this.$uibModalInstance.close();
                })
                .finally(() => {
                    this.inSaveProgress = false;
                });
        } else {
            this.$uibModalInstance.close();
        }
    }
}

angular.module('uiModal').controller('OnePageCatalogConflictSettingsCtrl', OnePageCatalogConflictSettingsCtrl);
