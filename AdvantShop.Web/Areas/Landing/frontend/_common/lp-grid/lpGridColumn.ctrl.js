(function (ng) {
    

    const blank = ng.element(document.createElement('div'));

    const LpGridColumnCtrl = function ($transclude, lpGridTypes) {
        const ctrl = this;

        ctrl.$onInit = function () {
            if (!ctrl.visible) {
                if (ctrl.type === lpGridTypes.template) {
                    $transclude((clone, scope) => {
                        ctrl.transcludeHtml = blank.append(clone).html();
                        ctrl.transcludeScope = scope;
                        blank.html('');
                    });
                }

                ctrl.lpGrid.addColumn(ctrl);
            }
        };

        ctrl.$onDestroy = function () {
            if (ctrl.transcludeScope != null) {
                ctrl.transcludeScope.$destroy();
            }

            const index = ctrl.lpGrid.columns.indexOf(ctrl);

            if (index !== -1) {
                ctrl.lpGrid.columns.splice(index, 1);
            }
        };
    };

    ng.module('lpGrid').controller('LpGridColumnCtrl', LpGridColumnCtrl);

    LpGridColumnCtrl.$inject = ['$transclude', 'lpGridTypes'];
})(window.angular);
