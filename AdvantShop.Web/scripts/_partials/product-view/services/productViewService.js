/* @ngInject */
function productViewService($http, $q, $cookies, $window) {
    const service = this,
        productViewTransformers = {},
        queue = {},
        callbacks = {};

    service.getPhotos = function (productId) {
        return $http.get('productExt/getphotos', { params: { productId, rnd: Math.random() } }).then((response) => response.data);
    };

    service.getView = function (name) {
        const defer = $q.defer();

        if (productViewTransformers[name] == null) {
            queue[name] = defer;
        } else {
            defer.resolve(productViewTransformers[name]);
        }

        return defer.promise.finally(() => {
            delete queue[name];
        });
    };

    service.addCallback = function (name, func) {
        callbacks[name] = callbacks[name] || [];
        callbacks[name].push(func);
    };

    service.pricessCallback = function (name, data) {
        if (callbacks[name] != null) {
            for (let i = 0, len = callbacks[name].length - 1; i <= len; i++) {
                callbacks[name][i](data);
            }
        }
    };

    service.setView = function (name, view, viewList, isMobile) {
        service.pricessCallback('beforeSetView', productViewTransformers[name]);

        if (isMobile) {
            $cookies.put('mobile_viewmode', view);
        } else if ($window.location.pathname.indexOf('/search') !== -1) {
                $cookies.put('search_viewmode', view);
            } else {
                $cookies.put('viewmode', view);
            }

        productViewTransformers[name] = productViewTransformers[name] || {};

        productViewTransformers[name].viewName = view;
        productViewTransformers[name].viewList = viewList;

        if (queue[name] != null) {
            queue[name].resolve(productViewTransformers[name]);
        }

        service.pricessCallback('setView', productViewTransformers[name]);

        return productViewTransformers[name];
    };

    service.getViewFromCookie = function (cookieName, viewList, defaultViewMode) {
        const value = $cookies.get(cookieName);

        let item;
        if (value != null) {
            for (let i = 0; i < viewList.length; i++) {
                if (viewList[i].indexOf(value) !== -1) {
                    item = viewList[i];
                    break;
                }
            }
        }

        return item != null ? item : defaultViewMode || viewList[0];
    };

    service.getOfferId = function (productId, colorId, sizeId) {
        return $http
            .get('productExt/GetOffers', {
                params: { productId, colorId, sizeId, rnd: Math.random() },
            })
            .then((response) => response.data);
    };

    service.getProductViewButtons = function (productId, offerId) {
        return $http
            .get('productExt/GetProductViewButtons', {
                params: {
                    productId,
                    offerId,
                    rnd: Math.random(),
                },
            })
            .then((response) => response.data);
    };

    service.filterPhotos = function (photos, colorId, onlyColorPhoto) {
        return photos.filter((item) => {
            if (onlyColorPhoto) {
                return item.ColorID === colorId;
            }
            return item.ColorID === colorId || item.ColorID == null;
        });
    };
}

export default productViewService;
