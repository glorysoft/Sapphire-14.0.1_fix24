import sidebarUserTemplate from './templates/sidebar-user.html';
(function (ng) {
    

    ng.module('sidebarUser').component('sidebarUser', {
        templateUrl: sidebarUserTemplate,
        controller: 'SidebarUserCtrl',
        bindings: {
            close: '&',
            dismiss: '&',
            resolve: '<',
        },
    });
})(window.angular);
