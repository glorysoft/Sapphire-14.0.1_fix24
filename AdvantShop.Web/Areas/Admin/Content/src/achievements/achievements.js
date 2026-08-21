import './Achievements.scss';

(function (ng) {


    const AchievementsCtrl = function (toaster, $http, $translate, $scope, urlHelper, SweetAlert) {
        const ctrl = this;

        ctrl.$onInit = function () {
            ctrl.getData(true);
        };

        ctrl.init = function (achievementsEnabled) {
            ctrl.achievementsEnabled = achievementsEnabled;
        };

        ctrl.getData = function (isFirstLoad) {
            return $http.get('home/getAchievementsData').then((response) => {
                const {data} = response;
                const {obj} = data;

                if (data.result === true) {
                    ctrl.data = obj;

                    ctrl.bonuses = obj.Bonuses;
                    ctrl.steps = obj.Groups;
                    ctrl.currentStepComplited = obj.CompleteStepsCount;
                    ctrl.totalSteps = obj.TotalStepsCount;
                    ctrl.completedPercent = obj.CompletedPercent;
                    ctrl.percentageString = `${ctrl.completedPercent  }%`;

                } else if (data.errors != null) {
                    data.errors.forEach((err) => {
                        toaster.pop('error', '', err);
                    });
                }
            });
        };

        ctrl.openLink = function (link) {
            if (angular.isString(link)) {
                window.open(link, '_blank');
            } else {
                toaster.pop('error', '', 'ActionButtonLink не содержит допустимую ссылку');
            }
        };

        ctrl.subscribeAndRedirect = function (link) {
            $http
                .get('achievementsEvents/subscribeToCompanySocialNetworks')
                .then((response) => {
                    if (response) {
                        window.open(link, '_blank');
                    } else {
                        toaster.pop('error', '', 'Ошибка при отправке запроса на подписку');
                    }
                })
                .catch((error) => {
                    toaster.pop('error', '', error);
                });
        };

        ctrl.goSupportCenterAndRedirect = function (link) {
            $http
                .get('achievementsEvents/goToCompanySupportCenter')
                .then((response) => {
                    if (response) {
                        window.open(link, '_blank');
                    } else {
                        toaster.pop('error', '', 'Ошибка при отправке запроса на подписку');
                    }
                })
                .catch((error) => {
                    toaster.pop('error', '', 'Ошибка при отправке запроса');
                });
        };

        ctrl.trackEvent = function (trackEvent) {
            $http.post('home/trackCongratulationsDashboardEvents', { trackEvent });
        };

        ctrl.skipDashboard = function () {
            SweetAlert.confirm($translate.instant('Admin.Js.Achievements.SkipAchievementsConfirm'), {
                title: $translate.instant('Admin.Js.Achievements.SkipAchievementsConfirmTitle'),
                cancelButtonText: $translate.instant('Admin.Js.Cancel'),
            }).then((result) => {
                if (result.value === true) {
                    $http.post('home/skipCongratulationsDashboard').then(() => {
                        window.location.href = 'home/desktop';
                    }).catch((error) => {
                        toaster.pop('error', '', error);
                    });
                }
            });
        };

        ctrl.congratulationsDashboardSwitch = function () {
            ctrl.achievementsEnabled = !ctrl.achievementsEnabled;
            $http.post('home/congratulationsDashboardSwitch', {
                achievementsEnabled: ctrl.achievementsEnabled,
            })
                .then((response) => {
                    if(response)
                        toaster.pop('success', '', $translate.instant('Admin.Js.Achievements.ChangesSaved'));
                    else
                        toaster.pop('error', '', $translate.instant('Admin.Js.Achievements.ChangesError'));
                })
        };
    };

    AchievementsCtrl.$inject = ['toaster', '$http', '$translate', '$scope', 'urlHelper', 'SweetAlert'];

    ng.module('achievements', []).controller('AchievementsCtrl', AchievementsCtrl);
})(window.angular);
