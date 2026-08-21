(function (ng) {
    

    ng.module('sidebarMenu')
        .directive('sidebarMenuState', () => ({
                restrict: 'A',
                scope: true,
                controller: 'SidebarMenuStateCtrl',
                controllerAs: 'sidebarMenuState',
                bindToController: true,
            }))
        .directive('sidebarMenuTrigger', () => ({
                restrict: 'A',
                scope: true,
                controller: 'SidebarMenuTriggerCtrl',
                controllerAs: 'sidebarMenuTrigger',
                bindToController: true,
            }));
})(window.angular);
