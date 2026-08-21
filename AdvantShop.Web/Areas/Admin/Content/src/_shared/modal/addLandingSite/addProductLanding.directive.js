import addProductLandingTemplate from './addProductLanding.html';

const AddProductLandingCtrl = function() {
    const ctrl = this;
    ctrl.removeItem = function(item) {
        const index = ctrl.products != null && ctrl.products.length > 0 ? ctrl.products.indexOf(item) : null;
        if (index != null && index !== -1) {
            ctrl.products.splice(index, 1);
            if (ctrl.onClose != null) {
                ctrl.onClose({
                    result: {
                        ids: ctrl.products.map((product) => product.ProductId),
                    },
                });
            }
        }
    };
};

angular.module('addProductLanding', [])
    .controller('AddProductLandingCtrl', AddProductLandingCtrl)
    .component('addProductLanding', {
        templateUrl: addProductLandingTemplate,
        controller: 'AddProductLandingCtrl',
        bindings: {
            onClose: '&',
            products: '<',
            settingsSelectvizr: '<?'
        },
    });
