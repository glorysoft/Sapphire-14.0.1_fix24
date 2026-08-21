(function (ng) {
    

    const LeadsListCtrl = function (leadsService, $element, $compile, $scope, $parse, $attrs) {
        const ctrl = this;

        ctrl.$onInit = function () {
            leadsService.addLeadsList(ctrl);
            ctrl.update();
        };

        ctrl.update = function () {
            return leadsService.fetchDataList($attrs.excludeLeadListId).then((data) => {
                ctrl.data = data;
                const html = $compile(ctrl.data)($scope);
                ng.element($element[0]).after(html);
                $element.remove();
            });
        };
    };

    LeadsListCtrl.$inject = ['leadsService', '$element', '$compile', '$scope', '$parse', '$attrs'];

    ng.module('leads').controller('LeadsListCtrl', LeadsListCtrl);
})(window.angular);
