import productViewModule from '../productView.module.js';
import lozadAdvModule from '../../../_common/lozad-adv/lozadAdv.module.js';
import '../../../../tests/mocks/globals.ts';
import { convertToDataAttrs } from '../../../../tests/utils/convertToDataAttrs.js';
import { getInitialPhotoStartJson, getPhotoObj } from '../__mocks__/photos.js';
import { productViewImageListMapperRequest } from '../controllers/productViewImageListController.js';
import { PRODUCT_VIEW_IMAGE_CONTAINER_CLASS } from '../controllers/productViewImageController.js';
import { createTestApp } from '../../../../tests/mocks/angularjs-mocks.ts';

describe('productViewImageListDirective', () => {
    const rnd = 0.123456789;

    angular.module('ngCookies', []).service('$cookies', function () {
        const cookies = {};
        this.put = (key, value) => (cookies[key] = value);
        this.get = (key) => cookies[key];
    });
    angular.module('dom', []).service('domService', vi.fn());
    angular.module('windowExt', []).service('windowService', vi.fn());
    angular.module('pascalprecht.translate', []).service('$translate', vi.fn());
    angular.module('urlHelper', []).service('urlHelper', vi.fn());
    angular.module('preOrder', []).service('preOrderService', vi.fn());

    const getTestApp = () =>
        createTestApp([productViewModule, lozadAdvModule, 'ngCookies', 'dom', 'windowExt', 'pascalprecht.translate', 'urlHelper']);

    const firstPhoto = getPhotoObj();
    const secondPhoto = getPhotoObj();
    const photoResult = [firstPhoto, secondPhoto];

    const initialPhotoStartPhotoJson = [getInitialPhotoStartJson(firstPhoto)];

    const data = {
        productId: 1,
        blockProductPhotoHeight: 300,
        productImageType: 'middle',
        photoWidth: 150,
        photoHeight: 150,
        isProductPhotoLazy: false,
        limitPhotoCount: 5,
        renderedPhotoId: firstPhoto.PhotoId,
        viewMode: 'single',
        colorInitialId: firstPhoto.ColorID,
    };

    const triggerProductImageList = (el, event) => {
        el[0].querySelector('[data-product-view-image-list]').dispatchEvent(event);
    };
    beforeEach(() => {
        vi.spyOn(Math, 'random').mockReturnValue(rnd);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should correct init', () => {
        const { render } = getTestApp();
        const { scope } = render(
            `
       <div class="mobile-product-view-item cs-t-1 mobile-product-view__item js-products-view-block"
                data-product-view-item=""
                data-offer-id="14510"
                data-product-id="${data.productId}"
                data-offer="{Amount: 10, RoundedPrice: 7990, OfferId: 14510}">
            <a data-product-view-image-list data-product-id="1" data-color-initial-id="22">
                <span id="initialPhoto">
                    <img src="photo.jpg"  onerror="this.src = 'error.png'"data-ng-src="photo.jpg">
                </span>
            </a>
        </div>`,
        );

        expect(scope.$$childHead.productViewItem.productId).toEqual(1);
    });

    it('should correct add html when dispatch mouseenter', async () => {
        const { render, $injector } = getTestApp();
        const $httpBackend = $injector.get('$httpBackend');
        $httpBackend
            .expectPOST('/mobile/product/ProductViewPhoto', productViewImageListMapperRequest(data))
            .respond(200, "<div id='hasItem'>TEST</div>");
        $httpBackend.expectGET(`productExt/getphotos?productId=${data.productId}&rnd=${rnd}`).respond(200, photoResult);

        const { element } = render(
            `
            <div class="mobile-product-view-item cs-t-1 mobile-product-view__item js-products-view-block"
                data-product-view-item=""
                data-offer-id="14510"
                data-product-id="${data.productId}"
                data-offer="{Amount: 10, RoundedPrice: 7990, OfferId: 14510}">
            <a data-product-view-image-list
                ${convertToDataAttrs(data).join('\n')}>
                <span id="initialPhoto">
                    <img src="photo.jpg"  onerror="this.src = 'error.png'" data-ng-src="photo.jpg">
                </span>
            </a>
        </div>`,
        );

        triggerProductImageList(element, new MouseEvent('mouseenter'));

        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 110);
        });

        $httpBackend.flush();
        expect(element[0].querySelector('#initialPhoto')).toBeTruthy();
        expect(element[0].querySelector('#hasItem')).toBeTruthy();
    });

    it('should correct add html when dispatch touchstart', async () => {
        const { render, $injector } = getTestApp();
        const $httpBackend = $injector.get('$httpBackend');

        $httpBackend
            .expectPOST('/mobile/product/ProductViewPhoto', productViewImageListMapperRequest(data))
            .respond(200, "<div id='hasItem'>TEST</div>");
        $httpBackend.expectGET(`productExt/getphotos?productId=${data.productId}&rnd=${rnd}`).respond(200, photoResult);

        const { element } = render(
            `
            <div class="mobile-product-view-item cs-t-1 mobile-product-view__item js-products-view-block"
                data-product-view-item=""
                data-offer-id="14510"
                data-product-id="${data.productId}"
                data-offer="{Amount: 10, RoundedPrice: 7990, OfferId: 14510}">
                <a data-product-view-image-list
                data-view-mode="'single'"
                ${convertToDataAttrs(data).join('\n')}>
                    <span id="initialPhoto">
                        <img src="photo.jpg"  onerror="this.src = 'error.png'"data-ng-src="photo.jpg">
                    </span>
                </a>
             </div>`,
        );

        triggerProductImageList(element, new TouchEvent('touchstart'));

        $httpBackend.flush();

        expect(element[0].querySelector('#initialPhoto')).toBeTruthy();
        expect(element[0].querySelector('#hasItem')).toBeTruthy();
    });

    it('should not send multiple requests', async () => {
        const { render, $injector } = getTestApp();
        const $httpBackend = $injector.get('$httpBackend');
        $httpBackend
            .expectPOST('/mobile/product/ProductViewPhoto', productViewImageListMapperRequest(data))
            .respond(200, "<div id='hasItem'>TEST</div>");
        $httpBackend.expectGET(`productExt/getphotos?productId=${data.productId}&rnd=${rnd}`).respond(200, photoResult);

        const { element } = render(
            `
        <div class="mobile-product-view-item cs-t-1 mobile-product-view__item js-products-view-block"
                data-product-view-item=""
                data-offer-id="14510"
                data-product-id="${data.productId}"
                data-offer="{Amount: 10, RoundedPrice: 7990, OfferId: 14510}">
                <a data-product-view-image-list
                    data-view-mode="'single'"
                ${convertToDataAttrs(data).join('\n')}>
                    <span id="initialPhoto">
                        <img src="photo.jpg"  onerror="this.src = 'error.png'" data-ng-src="photo.jpg">
                    </span>
                </a>
        </div>`,
        );

        triggerProductImageList(element, new TouchEvent('touchstart'));

        $httpBackend.flush();

        $httpBackend
            .expectPOST('/mobile/product/ProductViewPhoto', productViewImageListMapperRequest(data))
            .respond(200, "<div id='hasItem'>TEST</div>");

        triggerProductImageList(element, new TouchEvent('touchstart'));

        expect(() => $httpBackend.flush()).toThrow('No pending request to flush');

        expect(element[0].querySelector('#initialPhoto')).toBeTruthy();
        expect(element[0].querySelector('#hasItem')).toBeTruthy();
    });

    it('should changed picture src if change view mode from single to tile', async () => {
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 1000,
        });

        document.body.innerHTML = `
        <div data-product-view-mode
            data-default-view-mode="single"
            data-is-mobile="true"
            data-photo-height-by-view-mode-default="'180px'"
            data-photo-height-by-view-mode="{viewName: 'single', value: '300px'}">

            <div class="mobile-product-view-item cs-t-1 mobile-product-view__item js-products-view-block"
                data-product-view-item=""
                data-offer-id="14510"
                data-product-id="${data.productId}"
                data-offer="{Amount: 10, RoundedPrice: 7990, OfferId: 14510}">
                    <a data-product-view-image-list
                     data-lozad-adv="productViewImageList.filterPhotos({isVisible, colorId: productViewImageList.currentColorId})"
                     data-lozad-observer-mode="'observerAlways'"
                     lozad-adv-debounce="false"
                     data-view-mode="'single'"
                    ${convertToDataAttrs(data).join('\n')}>
                        <span id="initialPhoto" class="${PRODUCT_VIEW_IMAGE_CONTAINER_CLASS}">
                            <img id="target" src="${initialPhotoStartPhotoJson[0].PathBig}"  onerror="this.src = 'error.png'"
                            data-product-view-image
                             data-photo-size="'Small'"
                            data-start-photo-json='${JSON.stringify(initialPhotoStartPhotoJson)}'
                            data-photo-id="4328">
                        </span>
                    </a>
            </div>
        </div>`;

        new IntersectionObserver([
            {
                isIntersecting: true,
                boundingClientRect: {
                    top: 0,
                    height: 100,
                },
                target: document.querySelector('#target'),
            },
        ]);

        const { render, $injector } = getTestApp();
        const $cookies = $injector.get('$cookies');
        const $httpBackend = $injector.get('$httpBackend');
        $cookies.put('mobile_viewmode', 'single');
        $httpBackend
            .expectPOST('/mobile/product/ProductViewPhoto', productViewImageListMapperRequest(data))
            .respond(200, "<div id='hasItem'>TEST</div>");
        $httpBackend.expectGET(`productExt/getphotos?productId=${data.productId}&rnd=${rnd}`).respond(200, photoResult);

        const { element, scope } = render(document.body);

        expect(element[0].querySelector('#initialPhoto img').src).toEqual(initialPhotoStartPhotoJson[0].PathBig);
        triggerProductImageList(element, new TouchEvent('touchstart'));

        $httpBackend.flush();

        expect(Array.isArray(scope.$$childHead.$$childHead.$$childHead.productViewImageList.photosStorage)).toBeTruthy();
        const productViewService = $injector.get('productViewService');
        productViewService.setView('testName', 'tile', [], true);

        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 0);
        });

        expect(element[0].querySelector('#initialPhoto img').src).toEqual(initialPhotoStartPhotoJson[0].PathSmall);
    });
});
