/* @ngInject */
const SetCssCustomPropsCtrl = function($attrs, $element, $parse, $scope, setCssCustomPropsService) {
    const ctrl = this;

    ctrl.$onInit = () => {
        const destroyFn = setCssCustomPropsService.initElement($element[0], $parse($attrs.setCssCustomProps)($scope), {
            watch: $parse($attrs.setCssCustomPropsWatch)($scope) === true,
        });
        $element.on('$destroy', destroyFn);
    };

    ctrl.sum = (...arg) => setCssCustomPropsService.sum($element[0], arg);
};

export default SetCssCustomPropsCtrl;
