(function (ng) {
    

    const LpGridGroupCtrl = function ($element, $compile) {
        const ctrl = this;
        ctrl.$onInit = function () {
            if (ctrl.row != null && ctrl.template != null) {
                const el = ng.element(ctrl.template.transcludeHtml);
                $element.append(el);
                $compile(el)(
                    ng.extend(ctrl.template.transcludeScope.$new(), {
                        lpGridRow: ctrl.row,
                    }),
                );
            }
        };
    };

    ng.module('lpGrid').controller('LpGridGroupCtrl', LpGridGroupCtrl);

    LpGridGroupCtrl.$inject = ['$element', '$compile'];
})(window.angular);
