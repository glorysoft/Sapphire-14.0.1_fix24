/* @ngInject */
function cardsService($http) {
    const service = this;

    service.apply = function (code) {
        return $http.post('coupon/couponpost', { code, rnd: Math.random() }).then((response) => response.data);
    };

    service.deleteCoupon = function () {
        return $http.post('coupon/deletecoupon', { params: { rnd: Math.random() } }).then((response) => response.data);
    };

    service.deleteCertificate = function () {
        return $http.post('coupon/deletecertificate', { params: { rnd: Math.random() } }).then((response) => response.data);
    };
}

export default cardsService;
