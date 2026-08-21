/* @ngInject */
function ProductsCarouselCtrl($scope, $compile, $element, productsCarouselService) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.update();
    };

    ctrl.generate = function (ids, title, type, visibleItems, carouselResponsive) {
        productsCarouselService.getData(ids, title, type, visibleItems, carouselResponsive).then((result) => {
            $element.empty();
            $element.append(result);
            $compile($element.contents())($scope);
        });
    };

    ctrl.update = function () {
        ctrl.generate(ctrl.ids, ctrl.title, ctrl.type, ctrl.visibleItems, ctrl.carouselResponsive);
    };
}

export default ProductsCarouselCtrl;
