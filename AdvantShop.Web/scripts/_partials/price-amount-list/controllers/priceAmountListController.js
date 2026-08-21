import priceAmountListTemplate from '../templates/priceAmountList.html';

/* @ngInject */
function PriceAmountListCtrl($http, $q, $templateRequest, $element, $compile, $scope) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.showHead = ctrl.showHead != null ? ctrl.showHead : true;

        if (!ctrl.lazy) {
            ctrl.getItems(ctrl.productId, ctrl.startOfferId, ctrl.source);
        }
        ctrl.initFn({ priceAmountList: ctrl });
    };

    ctrl.getItems = function (productId, offerId, source) {
        const defer = $q.defer();

        if (productId == null || offerId == null) {
            defer.resolve();
            return defer.promise;
        }

        const templateReq = $templateRequest(priceAmountListTemplate).then((tpl) => {
            $element[0].innerHTML = tpl;
            $compile($element.contents())($scope);
        });

        const dataReq = $http.get('productExt/getPriceAmountList', { params: { productId, offerId, source } }).then((response) => {
            if (response.data != null) {
                ctrl.amountList = response.data.obj.AmountList;
                ctrl.cartSumList = response.data.obj.CartSumList;
                ctrl.hasItems = (ctrl.amountList != null && ctrl.amountList.length > 0) || (ctrl.cartSumList != null && ctrl.cartSumList.length > 0);

                defer.resolve({ amountList: ctrl.amountList, cartSumList: ctrl.cartSumList });
            } else {
                defer.resolve(null);
            }
        });

        $q.all([templateReq, dataReq]);

        return defer.promise;
    };

    ctrl.update = function (data) {
        return ctrl.getItems(ctrl.productId, data?.offerId ?? ctrl.offerId, ctrl.source).then((res) => res);
    };
}

export default PriceAmountListCtrl;
