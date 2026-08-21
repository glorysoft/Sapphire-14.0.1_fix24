/* @ngInject */
function productService($http, $q) {
    let service = this,
        _product,
        callbacks = {};

    service.getOffers = function (productId, colorId, sizeId) {
        return $http.get('productExt/getoffers', { params: { productId, colorId, sizeId } }).then((response) => response.data);
    };

    service.findOfferSelected = function (offers, offerIdSelected) {
        let offer;

        for (let i = offers.length - 1; i >= 0; i--) {
            if (offers[i].OfferId === offerIdSelected) {
                offer = offers[i];
                break;
            }
        }

        return offer;
    };

    service.findOffersByColorId = function (offers, colorId) {
        return offers.filter((item) => colorId != null && item.Color != null && item.Color.ColorId === colorId);
    };

    service.findOffersBySizeId = function (offers, sizeId) {
        return offers.filter((item) => sizeId != null && item.Size != null && item.Size.SizeId === sizeId);
    };

    service.getOffer = function (offers, colorId, sizeId) {
        let arrayOffers = offers.slice(),
            arrayOffersByColor = [],
            arrayOffersBySize = [],
            stopLoop = false,
            offer;

        arrayOffersByColor = service.findOffersByColorId(arrayOffers, colorId);
        arrayOffersBySize = service.findOffersBySizeId(arrayOffers, sizeId);

        if (arrayOffersByColor.length > 0 && arrayOffersBySize.length > 0) {
            for (let i = 0, lenC = arrayOffersByColor.length; i < lenC; i++) {
                for (let j = 0, lenS = arrayOffersBySize.length; j < lenS; j++) {
                    if (arrayOffersByColor[i].OfferId === arrayOffersBySize[j].OfferId) {
                        offer = arrayOffersByColor[i];
                        stopLoop = true;
                        break;
                    }
                }

                if (stopLoop === true) {
                    break;
                }
            }
        }

        if (offer == null && arrayOffersByColor.length > 0) {
            offer = arrayOffersByColor[0];
        }
        if (offer == null && arrayOffersBySize.length > 0) {
            offer = arrayOffersBySize[0];
        }

        return offer;
    };

    service.getPrice = function (offerId, attributesXml, lpBlockId, amount) {
        return $http
            .post('productExt/getofferprice', {
                offerId,
                attributesXml,
                lpBlockId,
                amount,
            })
            .then((response) => response.data);
    };

    service.getCreditPayment = function (price, discount, discountAmount) {
        return $http
            .get('productExt/getCreditPayment', {
                params: { price, discount, discountAmount },
            })
            .then((response) => response.data);
    };

    service.getShippings = function (offerId) {
        return $http.get('productExt/getshippings', { params: { offerId } }).then((response) => response.data);
    };

    service.addCallback = function (name, func) {
        callbacks[name] = callbacks[name] || [];
        callbacks[name].push(func);
    };

    service.processCallback = function (name, data) {
        const arrFunc = callbacks[name];

        if (arrFunc != null && arrFunc.length > 0) {
            for (let i = 0, len = arrFunc.length; i < len; i++) {
                arrFunc[i](data);
            }
        }
    };

    service.getPhoto = function (url) {
        const defered = $q.defer(),
            img = new Image();

        img.src = url;

        if (img.complete == true || (typeof img.naturalWidth !== 'undefined' && img.naturalWidth > 0)) {
            defered.resolve(img);
        } else {
            img.onload = function () {
                defered.resolve(img);
            };
        }

        return defered.promise.then((response) => response);
    };

    service.addToStorage = function (product) {
        _product = product;
    };

    service.getProduct = function () {
        return _product;
    };

    service.getReviewsCount = function (productId) {
        return $http.get('productExt/getReviewsCount', { params: { productId } }).then((response) => response.data);
    };

    service.getOfferStocks = function (offerId, cityId) {
        return $http.get('productExt/getofferstocks', { params: { offerId, cityId } }).then((response) => response.data);
    };
}

export default productService;
