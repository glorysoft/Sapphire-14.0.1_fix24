(function (ng) {
    

    const CatalogLeftMenuCtrl = function (catalogService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            if (ctrl.onInit != null) {
                ctrl.onInit({ catalogLeftMenu: ctrl });
            }
        };

        ctrl.updateData = function (jstree) {
            catalogService.getDataProducts().then((data) => {
                ctrl.data = data;
            });
        };
    };

    CatalogLeftMenuCtrl.$inject = ['catalogService'];

    ng.module('catalog').controller('CatalogLeftMenuCtrl', CatalogLeftMenuCtrl);
})(window.angular);
