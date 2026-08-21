(function (ng) {
    

    const LpGridColumnTemplateCtrl = function ($element, $compile) {
        const ctrl = this;

        ctrl.$onInit = function () {
            if (ctrl.col != null && ctrl.row != null) {
                const el = ng.element(ctrl.col.transcludeHtml);
                $element.append(el);
                $compile(el)(
                    ng.extend(ctrl.col.transcludeScope.$new(), {
                        lpGridColumn: ctrl.col,
                        lpGridRow: ctrl.row,
                        lpGridRowIndex: ctrl.rowIndex,
                        lpGrid: ctrl.lpGrid,
                    }),
                );
            }
        };
    };

    ng.module('lpGrid').controller('LpGridColumnTemplateCtrl', LpGridColumnTemplateCtrl);

    LpGridColumnTemplateCtrl.$inject = ['$element', '$compile'];
})(window.angular);
