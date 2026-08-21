import settingsLogsTemplate from './settings-system.logs.html';
(function (ng) {
    

    ng.module('settingsSystem').component('settingsLogs', {
        templateUrl: settingsLogsTemplate,
        controller: 'SettingsSystemLogsCtrl',
        bindings: {
            sa: '<?',
        },
    });
})(window.angular);
