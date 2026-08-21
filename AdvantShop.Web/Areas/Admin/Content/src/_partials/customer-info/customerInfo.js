(function (ng) {
    

    const CustomerInfoCtrl = function ($uibModalStack, customerInfoService, urlHelper) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.instance = ctrl.resolve.instance;

            ctrl.isChangeContent = false;

            const orderId = urlHelper.getUrlParam('orderId');

            ctrl.url =
                ctrl.instance.customerId != null && ctrl.instance.customerId.length > 0
                    ? `customers/popup?rnd=${  Math.random()  }&id=${  ctrl.instance.customerId}`
                    : `customers/popupAdd?rnd=${ 
                      Math.random() 
                      }${orderId != null ? `&orderId=${  orderId}` : '' 
                      }${ctrl.instance.partnerId != null ? `&partnerId=${  ctrl.instance.partnerId}` : ''}`;

            ctrl.isShow = true;

            customerInfoService.setUrlParam(ctrl.instance.customerId);
        };

        ctrl.dismissCustomerInfo = function () {
            ctrl.isShow = false;

            customerInfoService.removeUrlParam();

            ctrl.dismiss({ $value: ctrl });
        };

        ctrl.setState = function () {
            ctrl.isChangeContent = true;
        };
    };

    CustomerInfoCtrl.$inject = ['$uibModalStack', 'customerInfoService', 'urlHelper'];

    ng.module('customerInfo', [])
        .run([
            'customerInfoService',
            function (customerInfoService) {
                const urlParam = customerInfoService.getUrlParam();
                if (urlParam != null) {
                    customerInfoService.addInstance({ customerId: urlParam });
                }
            },
        ])
        .controller('CustomerInfoCtrl', CustomerInfoCtrl);
})(window.angular);
