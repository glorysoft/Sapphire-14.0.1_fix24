/* @ngInject */
function orderProductService($http) {
    const service = this;

    service.getOrderProducts = function () {
        return $http.get('/myaccount/GetCustomerOrderProductHistory', { params: { rnd: Math.random() } }).then((response) => response.data);
    };
}

export default orderProductService;
