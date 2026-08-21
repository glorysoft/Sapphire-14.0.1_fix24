/* @ngInject */
const CarouselSlideCtrl = function ($element, $scope) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.element = $element[0];
        ctrl.carousel.addSlide(ctrl);

        $element.on('$destroy', () => {
            ctrl.carousel.removeSlide(ctrl);
        });
    }

    ctrl.isClone = function () {
        return ctrl.element.classList.contains('js-carousel-clone');
    }

    ctrl.fireScopeEvent = function (scopeEventName, data) {
        $scope.$broadcast(scopeEventName, data);
    };
};

export default CarouselSlideCtrl;
