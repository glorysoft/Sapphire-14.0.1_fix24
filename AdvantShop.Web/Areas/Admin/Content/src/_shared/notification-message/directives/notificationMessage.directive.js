(function (ng) {
    
    ng.module('notificationMessage').directive('notificationMessage', () => ({
            controller: 'NotificationMessageCtrl',
            controllerAs: '$ctrl',
            scope: true,
            bindToController: true,
        }));
})(window.angular);
