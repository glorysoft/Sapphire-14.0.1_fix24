(function (ng) {
    

    ng.module('shopName', []).directive(
        'shopName',
        /* @ngInject */
        ($sce, $parse, $filter) => ({
                scope: true,
                link (scope, element, attrs) {
                    const callback = $parse(attrs.shopNameCallback);
                    const decodeStringFilter = $filter('decodeString');
                    if (decodeStringFilter) {
                        scope.shopName = $sce.trustAsHtml(decodeStringFilter(element[0].textContent.trim()));
                    }
                    if (callback) {
                        callback(scope);
                    }
                },
            }),
    );
})(window.angular);
