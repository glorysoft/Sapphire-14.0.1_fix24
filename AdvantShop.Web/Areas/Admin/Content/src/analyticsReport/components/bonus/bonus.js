import bonusTemplate from './bonus.html';
(function (ng) {
    

    const BonusCtrl = function ($http, uiGridConstants, uiGridCustomConfig, uiGridCustomParamsConfig, uiGridCustomService, $translate) {
        const ctrl = this,
            columnDefsTopUsersAccrued = [
                {
                    name: 'Name',
                    displayName: $translate.instant('Admin.Js.BonusReport.TopUsers.Name'),
                },
                {
                    name: 'Accrued',
                    displayName: $translate.instant('Admin.Js.BonusReport.TopUsers.Accrued'),
                },
                {
                    name: 'OrdersCount',
                    displayName: $translate.instant('Admin.Js.BonusReport.TopUsers.OrdersCount'),
                },
            ],
            columnDefsTopUsersUsed = [
                {
                    name: 'Name',
                    displayName: $translate.instant('Admin.Js.BonusReport.TopUsers.Name'),
                },
                {
                    name: 'Used',
                    displayName: $translate.instant('Admin.Js.BonusReport.TopUsers.Used'),
                },
                {
                    name: 'OrdersCount',
                    displayName: $translate.instant('Admin.Js.BonusReport.TopUsers.OrdersCount'),
                },
            ],
            columnDefsBonusRules = [
                {
                    name: 'Name',
                    displayName: $translate.instant('Admin.Js.BonusReport.BonusRules.Name'),
                },
                {
                    name: 'Accrued',
                    displayName: $translate.instant('Admin.Js.BonusReport.BonusRules.Accrued'),
                },
            ];
        ctrl.gridTopUsersAccruedOptions = ng.extend({}, uiGridCustomConfig, {
            enableSorting: false,
            columnDefs: columnDefsTopUsersAccrued,
            uiGridCustom: {
                rowUrl: 'customers/view/{{row.entity.CustomerId}}',
            },
        });
        ctrl.gridTopUsersUsedOptions = ng.extend({}, uiGridCustomConfig, {
            enableSorting: false,
            columnDefs: columnDefsTopUsersUsed,
            uiGridCustom: {
                rowUrl: 'customers/view/{{row.entity.CustomerId}}',
            },
        });
        ctrl.gridBonusRulesOptions = ng.extend({}, uiGridCustomConfig, {
            enableSorting: false,
            columnDefs: columnDefsBonusRules,
            uiGridCustom: {},
        });
        ctrl.gridTopUsersAccruedOnInit = function (grid) {
            ctrl.gridTopUsersAccrued = grid;
        };
        ctrl.gridTopUsersUsedOnInit = function (grid) {
            ctrl.gridTopUsersUsed = grid;
        };
        ctrl.gridBonusRulesOnInit = function (grid) {
            ctrl.gridBonusRules = grid;
        };
        ctrl.$onInit = function () {
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    bonus: ctrl,
                });
            }
        };
        ctrl.recalc = function (dateFrom, dateTo) {
            ctrl.from = dateFrom;
            ctrl.to = dateTo;
            ctrl.getBonusParticipantsStatistics();
            ctrl.getBonusCardGradesStatistics();
            ctrl.getBonusMovementStatistics();
            if (ctrl.gridTopUsersAccrued != null) {
                ctrl.gridTopUsersAccrued.setParams({
                    dateFrom,
                    dateTo,
                });
                ctrl.gridTopUsersAccrued.fetchData();
            }
            if (ctrl.gridTopUsersUsed != null) {
                ctrl.gridTopUsersUsed.setParams({
                    dateFrom,
                    dateTo,
                });
                ctrl.gridTopUsersUsed.fetchData();
            }
            if (ctrl.gridBonusRules != null) {
                ctrl.gridBonusRules.setParams({
                    dateFrom,
                    dateTo,
                });
                ctrl.gridBonusRules.fetchData();
            }
        };
        ctrl.getBonusParticipantsStatistics = function () {
            $http
                .get('analytics/GetBonusParticipantsStatistics', {
                    params: {
                        dateFrom: ctrl.from,
                        dateTo: ctrl.to,
                    },
                })
                .then((result) => {
                    ctrl.BonusParticipants = result.data;
                    ctrl.BonusParticipants.CountOfParticipantsByDate.Series = [$translate.instant('Admin.Js.BonusReport.BonusParticipants.Series')];
                });
        };
        ctrl.getBonusCardGradesStatistics = function () {
            $http.get('analytics/GetBonusCardGradesStatistics').then((result) => {
                ctrl.BonusCardGrades = result.data;
                ctrl.BonusCardGrades.Series = [$translate.instant('Admin.Js.BonusReport.BonusCardGrades.Series')];
            });
        };
        ctrl.getBonusMovementStatistics = function () {
            $http
                .get('analytics/GetBonusMovementStatistics', {
                    params: {
                        dateFrom: ctrl.from,
                        dateTo: ctrl.to,
                    },
                })
                .then((result) => {
                    ctrl.BonusMovement = result.data;
                    ctrl.BonusMovement.AccruedAndUsedByDate.Series = [
                        $translate.instant('Admin.Js.BonusReport.BonusMovement.Series.Accrued'),
                        $translate.instant('Admin.Js.BonusReport.BonusMovement.Series.Used'),
                    ];
                });
        };
    };
    BonusCtrl.$inject = ['$http', 'uiGridConstants', 'uiGridCustomConfig', 'uiGridCustomParamsConfig', 'uiGridCustomService', '$translate'];
    ng.module('analyticsReport')
        .controller('BonusCtrl', BonusCtrl)
        .component('bonus', {
            templateUrl: bonusTemplate,
            controller: BonusCtrl,
            bindings: {
                onInit: '&',
            },
        });
})(window.angular);
