(function (ng) {
    

    const SidebarMenuTriggerCtrl = function ($rootScope, sidebarMenuService) {
        const ctrl = this;

        ctrl.$onInit = function () {
            sidebarMenuService.addCallback(() => {
                $rootScope.$broadcast('uiGridCustomAutoResize');
            });
        };

        ctrl.toggle = function () {
            sidebarMenuService.toggle();
        };
    };

    SidebarMenuTriggerCtrl.$inject = ['$rootScope', 'sidebarMenuService'];

    ng.module('sidebarMenu').controller('SidebarMenuTriggerCtrl', SidebarMenuTriggerCtrl);
})(window.angular);
