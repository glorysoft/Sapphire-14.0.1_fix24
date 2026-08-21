/* @ngInject */
function orderService($http) {
    const service = this;

    service.getOrders = function () {
        return $http.get('/myaccount/GetCustomerOrderHistory', { params: { rnd: Math.random() } }).then((response) => response.data);
    };

    service.getOrderDetails = function (ordernumber) {
        return $http.get('/myaccount/GetOrderDetails', { params: { ordernumber, rnd: Math.random() } }).then((response) => response.data);
    };

    service.cancelOrder = function (ordernumber) {
        return $http.post('/myaccount/CancelOrder', { ordernumber, rnd: Math.random() }).then((response) => response.data);
    };

    service.changePaymentMethod = function (ordernumber, paymentId) {
        return $http
            .post('/myaccount/ChangePaymentMethod', {
                ordernumber,
                paymentId,
                rnd: Math.random(),
            })
            .then((response) => response.data);
    };

    service.changeOrderComment = function (ordernumber, customercomment) {
        return $http
            .post('/myaccount/ChangeOrderComment', {
                ordernumber,
                customercomment,
                rnd: Math.random(),
            })
            .then((response) => response.data);
    };

    service.getOrderReview = function (orderNumber) {
        return $http.get('/myaccount/GetOrderReview', { params: { orderNumber } }).then((response) => response.data);
    };

    service.addOrderReview = function (orderNumber, ratio, text) {
        return $http
            .post('/myaccount/AddOrderReview', {
                orderNumber,
                ratio,
                text,
                rnd: Math.random(),
            })
            .then((response) => response.data);
    };
}

export default orderService;
