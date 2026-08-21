/* @ngInject */
function checkOrderService($http) {
    const service = this;

    service.getStatus = function (orderNumber) {
        return $http.post('checkout/checkorder', { orderNumber, rnd: Math.random() }).then((response) => response.data);
    };
}

export default checkOrderService;
