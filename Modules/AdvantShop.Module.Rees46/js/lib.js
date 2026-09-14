
function getRees46Products(type, offerid, itemIds, title, relatedType, visibleItems) {
    if (itemIds == null || itemIds.length == 0) {
        return;
    }

    var isMobile = $('.is-mobile').length > 0;

    $.ajax({
        dataType: 'text',
        cache: false,
        type: 'GET',
        url: (isMobile ? 'mobile/' : '') + 'catalog/productsbyofferids',
        data: {
            ids: itemIds.join(','),
            title: title,
            type: relatedType,
            offerId: offerid,
            visibleItems: visibleItems,
            hideDescription: true
        },
        success: function (data) {
            if (data != null && data.length > 0) {
                var $targetDom = $('.rees46-recommender.' + type),
                htmlToCompile = data;

                var $injector = angular.element(document).injector();

                $injector.invoke(['$compile', '$rootScope', function ($compile, $rootScope) {

                    $targetDom.html(htmlToCompile);

                    $targetDom.find('a').each(function (index) {
                        var href = $(this).attr('href');
                        if (href == null || href.length == 0) {
                            return;
                        }

                        href += '?recommended_by=' + type;

                        $(this).attr('href', href).attr('data-ng-href', href);
                    });

                    var $scope = $targetDom.scope();

                    $compile($targetDom)($scope || $rootScope);
                    $rootScope.$digest();
                }]);
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function getRees46ProductsByCode(data, code, excludeId) {
    if (data == null || data.recommends == null || data.recommends.length == 0) {
        return;
    }

    var isMobile = $('.is-mobile').length > 0;

    $.ajax({
        dataType: 'text',
        cache: false,
        type: 'GET',
        url: (isMobile ? 'mobile/' : '') + 'catalog/productsByOfferIds',
        data: {
            ids: data.recommends.join(','),
            title: data.title,
            offerId: excludeId,
            hideDescription: true
        },
        success: function (data) {
            if (data != null && data.length > 0) {
                var $targetDom = $("[data-recommender-code='" + code + "']"),
                htmlToCompile = data;

                var $injector = angular.element(document).injector();

                $injector.invoke(['$compile', '$rootScope', function ($compile, $rootScope) {

                    $targetDom.html(htmlToCompile);

                    $targetDom.find('a').each(function (index) {
                        var href = $(this).attr('href');
                        if (href == null || href.length == 0) {
                            return;
                        }

                        href += (href.indexOf('?') == -1 ? '?' : '&') + 'recommended_by=dynamic&recommended_code=' + code;

                        $(this).attr('href', href).attr('data-ng-href', href);
                    });

                    var $scope = $targetDom.scope();

                    $compile($targetDom)($scope || $rootScope);
                    $rootScope.$digest();
                }]);
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}


window.addEventListener('load', function load(event) {
    window.removeEventListener('load', load, false);
    
    window.PubSub.subscribe('customer.email', function (data) {
        try {
            r46('profile', 'set', { email: data.email });
        } catch (e) {
        }
    });
    
    window.PubSub.subscribe('subscribe.email', function (email) {
        try {
            r46('profile', 'set', { email: data.email });
        } catch (e) {
        }
    });

    if ($('.rees46-use-suggestions').length > 0) {
        $('.site-head-search-input').addClass('rees46-instant-search');
        if (typeof r46 != "undefined") {
            r46("search_init", ".rees46-instant-search");
        }
    }
}, false);

document.addEventListener('DOMContentLoaded', function () {

    window.PubSub.subscribe('cart.addv2', function (productId, cartId, cartItem, target) {
        if (cartItem == null) {
            return;
        }

        var s = $(target).closest('.rees46-recommender');
        var recommended_by = null,
            recommended_code = null;

        if (s.length > 0) {
            if (s[0].classList.length == 2) {
                recommended_by = s[0].classList[1];
            }
            var code = s.attr('data-recommender-code');
            if (code != null && code != '') {
                recommended_by = 'dynamic';
                recommended_code = code;
            }
        }
        sendingRees46('cart', cartItem.OfferId, productId, cartItem.Amount, recommended_by, recommended_code);
    });

    window.PubSub.subscribe('cart.remove', function (offerId) {
        sendingRees46('remove_from_cart', offerId, null, null, null);
    });
    
    window.PubSub.subscribe('cart.update', function (offerId) {
        trackCart();
    });
});

function trackCart() {
    $.ajax({
        type: 'GET',
        async: false,
        dataType: 'json',
        url: 'rees46/trackCart',
        success: function (data) {
            r46('track', 'cart', data);
        }
    });
}

function sendingRees46(type, offerId, productId, amount, recommended_by, recommended_code) {
    $.ajax({
        type: 'GET',
        async: false,
        dataType: 'json',
        url: 'rees46/getProductForEvent?offerId=' + offerId + '&productId=' + productId + '&amount=' + amount + '&type=' + type,
        success: function(data) {
            if (data == null) {
                return;
            }

            var obj;
            if (data.Type == 2) {
                obj = {
                    id: data.Id,
                    amount: data.Amount,
                    stock: data.Stock
                };

                if (recommended_by != null && recommended_by.length > 0 && recommended_by != 'none') {
                    obj.recommended_by = recommended_by;
                }
                if (recommended_code != null && recommended_code.length > 0) {
                    obj.recommended_code = recommended_code;
                }

            } else {
                obj = data.Id;
            }
            r46('track', data.Type == 2 ? 'cart' : 'remove_from_cart', obj);
        }
    });
}