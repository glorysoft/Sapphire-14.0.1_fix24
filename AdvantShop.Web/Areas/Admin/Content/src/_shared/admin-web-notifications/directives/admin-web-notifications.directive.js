import callNotificationTemplate from './../templates/call-notification.html';
(function (ng) {
    

    ng.module('adminWebNotifications').directive('callNotification', [
        function () {
            return {
                templateUrl: callNotificationTemplate,
            };
        },
    ]);
})(window.angular);
