/* @ngInject */
const ModalAddLandingSiteCtrl = function($uibModalInstance, $translate, $http, toaster, $q, SweetAlert) {
    const ctrl = this;

    ctrl.$onInit = function() {
        const params = ctrl.$resolve.data || { data: {} };

        ctrl.productId = params.productId || null;
        ctrl.type = ctrl.productId != null ? 'oneproduct' : '';
        ctrl.showStepZero = params.showStepZero || false;

        ctrl.template = params.template;
        if (ctrl.template == null) {
            ctrl.template = 'Default';
        }

        ctrl.additionalSalesProductId = params.additionalSalesProductId || null;
        if (ctrl.additionalSalesProductId != null) {
            ctrl.getProduct(ctrl.additionalSalesProductId).then((data) => {
                ctrl.name = `Воронка допродаж к ${data.Name}`;
            });
        }

        ctrl.postActions = [
            { label: $translate.instant('Admin.Js.Content.ModalAddLandingSite.OnlineStoreCategory'), value: 1 },
            { label: $translate.instant('Admin.Js.Content.ModalAddLandingSite.Funnel'), value: 2 },
            { label: $translate.instant('Admin.Js.Content.ModalAddLandingSite.YourURL'), value: 3 },
        ];
        ctrl.postAction = ctrl.postActions[0].value;

        ctrl.checkBoxDownsellUpsselModel = {
            showCrossSells: ctrl.showCrossSells,
        };

        ctrl.changeLpType(params.lpType);

        ctrl.trackEventCreateFunnelShow();
    };

    ctrl.close = function() {
        $uibModalInstance.dismiss('cancel');
    };

    ctrl.changeLpType = function(type) {
        ctrl.lpType = type;
        ctrl.step = 10;

        if (ctrl.lpType != null) {
            switch (ctrl.lpType) {
                case 'Default':
                case 'LeadMagnet':
                case 'VideoLeadMagnet':
                case 'Booking':
                case 'Events':
                case 'Conference':
                case 'EventAction':
                case 'Course':
                case 'Consulting':
                case 'ServicesOnline':
                case 'QuizFunnel':
                    ctrl.step = 10;
                    break;

                default:
                    ctrl.step = 1;
                    break;
            }
        }

        if (ctrl.template === 'Article' || ctrl.template === 'CompanySiteWithCatalog') {
            ctrl.step = 1;
        }

        if (ctrl.lpType === 'ProductCrossSellDownSell') {
            if (ctrl.showStepZero) {
                ctrl.step = 0;
            } else {
                ctrl.notRedirect = true;
                ctrl.checkBoxDownsellUpsselModel.showCrossSells = true;

                ctrl.getProduct(ctrl.productId).then((data) => {
                    ctrl.productCrossSell = data;
                });
            }
        }
    };

    ctrl.changeStep = function() {
        ctrl.step += 1;
    };

    ctrl.setStep = function(step, func) {
        if (step != null) {
            ctrl.step = step;
        }
        if (func != null) {
            func();
        }
    };

    ctrl.addProductModal = function(result) {
        if (result != null && result.ids != null && result.ids.length > 0) {
            ctrl.productId = result.ids;
            ctrl.product = [];
            ctrl.getProduct(result.ids[0]).then((data) => {
                ctrl.product.push(data);
                ctrl.name = data.Name;
            });
        }
    };

    ctrl.addProduct = function(result, func) {
        if (result != null && result.ids != null && result.ids.length > 0) {
            ctrl.productId = result.ids[0];
            ctrl.product = [];
            ctrl.getProduct(ctrl.productId).then((data) => {
                ctrl.product.push(data);
                ctrl.name = data.Name;

                if (func != null) {
                    func();
                }

                //ctrl.setStep(step, func);
            });
        }
    };

    ctrl.addProductList = function(result) {
        ctrl.categoryIds = null;
        ctrl.categories = null;

        ctrl.productIds = result != null ? result.ids : null;

        if (result != null && result.ids != null && result.ids.length > 0) {
            const promises = [];
            for (const productId of ctrl.productIds) {
                const promise = ctrl.getProduct(productId).then((data) => data);
                promises.push(promise);
            }

            return $q.all(promises).then((data) => (ctrl.products = data));
        }
        return $q.resolve();

    };

    ctrl.addCategories = function(result) {
        ctrl.productIds = null;
        ctrl.products = null;

        ctrl.categoryIds = result != null ? result.categoryIds : null;

        if (result != null && result.categoryIds != null) {
            ctrl.getCategories(ctrl.categoryIds).then((data) => {
                ctrl.categories = data;
            });
        }
    };

    ctrl.addCategoriesWithoutSubCats = function(result, _step) {
        ctrl.productIds = null;
        ctrl.products = null;
        ctrl.categoryIds = result != null ? result.categories : null;

        if (ctrl.categoryIds != null) {
            ctrl.getCategories(ctrl.categoryIds).then((data) => {
                ctrl.categories = data;
            });
        }
    };

    ctrl.removeCategory = function(id) {
        ctrl.categoryIds = ctrl.categoryIds.filter((x) => x !== id);
        ctrl.categories = ctrl.categories.filter((x) => x.CategoryId !== id);
    };

    ctrl.setMultyFunnelMode = function() {
        if (ctrl.multyFunnelMode === 'products') {
            ctrl.categoryIds = null;
            ctrl.categories = null;
        } else {
            ctrl.productIds = null;
            ctrl.products = null;
        }
    };

    ctrl.addOfferList = function(result) {
        if (result != null && result.ids != null && result.ids.length > 0) {
            ctrl.offerIds = result.ids;
            const promises = [];
            for (const offerId of ctrl.offerIds) {
                const promise = ctrl.getProductByOffer(offerId).then((data) => data);
                promises.push(promise);
            }

            return $q.all(promises).then(
                (data) => (ctrl.offers = data),
                //ctrl.setStep(step, func);
            );
        }
        return $q.resolve();

    };

    ctrl.addUpsellProductWithDelay = function(result, step, func) {
        if (result != null && result.ids != null) {
            if (result.ids.length > 0) {
                ctrl.upsellProductId = result.ids[0];
                ctrl.getProduct(ctrl.upsellProductId).then((data) => {
                    ctrl.upsellProduct = [data];

                    ctrl.setStep(step, func);
                });
            } else {
                ctrl.upsellProductId = null;
            }
        }
    };

    ctrl.addUpsellProduct = function(result, _step, func) {
        if (result != null && result.ids != null) {
            if (result.ids.length > 0) {
                ctrl.upsellProductId = result.ids[0];
                ctrl.getProduct(ctrl.upsellProductId).then((data) => {
                    ctrl.upsellProduct = [data];

                    if (func != null) {
                        func();
                    }
                });
            } else {
                ctrl.upsellProductId = null;
            }
        }
    };

    ctrl.addUpsell2ProductWithDelay = function(result, step, func) {
        if (result != null && result.ids != null && result.ids.length > 0) {
            ctrl.upsell2ProductId = result.ids[0];
            ctrl.getProduct(ctrl.upsell2ProductId).then((data) => {
                ctrl.upsell2Product = [data];

                ctrl.setStep(step, func);
            });
        }
    };

    ctrl.addDownsellProductWithDelay = function(result, step, func) {
        if (result != null && result.ids != null) {
            if (result.ids.length > 0) {
                ctrl.downsellProductId = result.ids[0];
                ctrl.getProduct(ctrl.downsellProductId).then((data) => {
                    ctrl.downsellProduct = [data];

                    ctrl.setStep(step, func);
                });
            } else {
                ctrl.downsellProductId = null;
            }
        }
    };

    ctrl.addDownsellProduct = function(result, _step, func) {
        if (result != null && result.ids != null) {
            if (result.ids.length > 0) {
                ctrl.downsellProductId = result.ids[0];
                ctrl.getProduct(ctrl.downsellProductId).then((data) => {
                    ctrl.downsellProduct = [data];

                    if (func != null) {
                        func();
                    }
                });
            } else {
                ctrl.downsellProductId = null;
            }
        }
    };

    ctrl.onKeydownAddLandingSite = function(event, name, step) {
        if (event.keyCode === 13 && name != null) {
            ctrl.addLandingSite();
            ctrl.step = step;
        }
    };

    ctrl.changeCategory = function(result) {
        ctrl.postActionCategoryId = result.categoryId;
        ctrl.postActionCategoryName = result.categoryName;
    };

    ctrl.getFunnels = function() {
        return $http.get('funnels/getLandingSitesList').then((response) => {
            ctrl.funnels = response.data;
        });
    };

    ctrl.getPostActionFunnels = function() {
        ctrl.getFunnels().then(() => {
            ctrl.postActionFunnelSiteId = ctrl.funnels != null && ctrl.funnels.length > 0 ? ctrl.funnels[0].value : null;
        });
    };

    ctrl.changePostAction = function() {
        ctrl.postActionCategoryId = null;
        ctrl.postActionFunnelSiteId = null;
        ctrl.postActionUrl = null;
    };

    ctrl.selectPostActionCategory = function(_event, data) {
        ctrl.postActionCategoryId = data.node.id;
    };

    ctrl.validateAndGo = function(step) {
        if (ctrl.lpType === 'ProductCrossSellDownSell' && ctrl.downsellProductId == null && ctrl.upsellProductId == null) {
            toaster.pop('error', '', 'Выберите товар допродажи');
        } else if (ctrl.downsellProductId != null && ctrl.upsellProductId == null) {
            toaster.pop('error', '', 'Выберите допродажу 1 (Upsell)');
        } else {
            ctrl.step = step;
        }
    };

    ctrl.addLandingSite = function() {
        const dataPost = {
            name: ctrl.name,
            lpType: ctrl.lpType,
            template: ctrl.template,
            productId: ctrl.productId,
            additionalSalesProductId: ctrl.additionalSalesProductId,
            upsellProductIdFirst: ctrl.upsellProductId,
            upsellProductIdSecond: ctrl.upsell2ProductId,
            downSellProductId: ctrl.downsellProductId,
            productIds:
                ctrl.products != null && ctrl.products.length > 0
                    ? ctrl.products.map((x) => x.ProductId)
                    : ctrl.productIds,
            categoryIds: ctrl.categoryIds,
            offerIds: ctrl.offerIds,
            postAction: {
                postActionType: ctrl.postAction,
                postActionCategoryId: ctrl.postActionCategoryId,
                postActionFunnelSiteId: ctrl.postActionFunnelSiteId,
                postActionUrl: ctrl.postActionUrl,
            },
        };

        $http.post('funnels/addLandingSiteIsAllowed', dataPost).then((response) => {
            const data = response.data;

            if (data.result) {
                $http.post('funnels/addLandingSite', dataPost).then((responseAddLandingSite) => {
                    const dataAddLandingSite = responseAddLandingSite.data;

                    $uibModalInstance.close();

                    if (dataAddLandingSite.result) {
                        if (ctrl.notRedirect !== true) {
                            window.location.href = dataAddLandingSite.obj.AdminUrl;
                        }
                    } else {
                        dataAddLandingSite.errors.forEach((error) => {
                            toaster.pop('error', error);
                        });
                    }
                });
            } else {
                let alert = null;
                if (data.errors != null) {
                    alert = data.errors.reduce((prev, error) => prev + error, '');
                }

                $uibModalInstance.close();

                SweetAlert.alert(alert || 'Нельзя создать шаблон', {
                    title: 'Новая воронка',
                    html: alert || 'Нельзя создать шаблон',
                });
            }
        });
    };

    ctrl.getProduct = function(id) {
        return $http.get(`product/getProductInfoByProductId?id=${id}`).then((response) => response.data);
    };

    ctrl.getProductByOffer = function(id) {
        return $http.get(`product/getProductNameByOfferId?offerId=${id}`).then((response) => response.data);
    };

    ctrl.getCategories = function(ids) {
        return $http.post('category/GetCategoriesByCategoryIds', { categoryIds: ids }).then((response) => response.data);
    };

    ctrl.trackEventCreateFunnelShow = function() {
        return $http.post('funnels/TrackCreateFunnelShow').then((response) => response.data);
    };

    ctrl.trackEventCreateEmptyFunnelStep1 = function() {
        return $http.post('funnels/TrackCreateEmptyFunnelStep1').then((response) => response.data);
    };

    ctrl.trackEventCreateFreeShippingFunnelStep0 = function() {
        return $http.post('funnels/CreateFreeShippingFunnel_Step0').then((response) => response.data);
    };

    ctrl.trackEventCreateFreeShippingFunnelStep1 = function() {
        return $http.post('funnels/CreateFreeShippingFunnel_Step1').then((response) => response.data);
    };

    ctrl.trackEventCreateFreeShippingFunnelStep2 = function() {
        return $http.post('funnels/CreateFreeShippingFunnel_Step2').then((response) => response.data);
    };
    ctrl.trackEventCreateFreeShippingFunnelStep3 = function() {
        return $http.post('funnels/CreateFreeShippingFunnel_Step3').then((response) => response.data);
    };
    ctrl.trackEventCreateFreeShippingFunnelStep4 = function() {
        return $http.post('funnels/CreateFreeShippingFunnel_Step4').then((response) => response.data);
    };
    ctrl.trackEventCreateFreeShippingFunnelStep5 = function() {
        return $http.post('funnels/CreateFreeShippingFunnel_Step5').then((response) => response.data);
    };

    ctrl.trackEventCreateFreeShippingFunnelStepFinal = function() {
        return $http.post('funnels/CreateFreeShippingFunnel_StepFinal').then((response) => response.data);
    };

    ctrl.onChangeSwitcher = function(state) {
        ctrl.checkBoxDownsellUpsselModel.showCrossSells = state;
    };
};


angular.module('uiModal').controller('ModalAddLandingSiteCtrl', ModalAddLandingSiteCtrl);
