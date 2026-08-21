(function (ng) {
    

    const TriggerHistoryCtrl = function (
        toaster,
        $translate,
        uiGridCustomConfig,
        uiGridConstants
    ) {
        const ctrl = this;

        ctrl.$onInit = function () {

            ctrl.gridOptions = ng.extend({}, uiGridCustomConfig, {
                columnDefs: [
                    {
                        name: 'TimeFormatted',
                        displayName: $translate.instant('Admin.Js.TriggerHistory.Time'),
                        enableCellEdit: false,
                        enableSorting: false,
                        width: 150
                    },
                    {
                        name: 'LevelFormatted',
                        displayName: $translate.instant('Admin.Js.TriggerHistory.Level'),
                        cellTemplate:
                            '<div class="ui-grid-cell-contents">' +
                            '<div><span class="badge badge-custom badge-custom-{{row.entity.LevelFormatted}} border-custom-{{row.entity.LevelFormatted}}" ' +
                                        'ng-bind="row.entity.LevelFormatted"></span>' +
                            '</div>' +
                            '</div>',
                        enableCellEdit: false,
                        enableSorting: false,
                        width: 110,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.TriggerHistory.Level'),
                            type: uiGridConstants.filter.SELECT,
                            name: 'Level',
                            fetch: 'triggers/getTriggerHistoryLevels',
                        }
                    },
                    {
                        name: 'EventTypeFormatted',
                        displayName: $translate.instant('Admin.Js.TriggerHistory.EventType'),
                        enableCellEdit: false,
                        enableSorting: false,
                        filter: {
                            placeholder: $translate.instant('Admin.Js.TriggerHistory.EventType'),
                            type: uiGridConstants.filter.SELECT,
                            name: 'EventType',
                            fetch: 'triggers/getTriggerHistoryEventTypes',
                        }
                    },
                    {
                        name: 'Error',
                        displayName: $translate.instant('Admin.Js.TriggerHistory.Error'),
                        enableCellEdit: false,
                        enableSorting: false,
                    },
                    {
                        name: 'ParametersFormatted',
                        displayName: $translate.instant('Admin.Js.TriggerHistory.Parameters'),
                        enableCellEdit: false,
                        enableSorting: false,
                    },
                ],
                uiGridCustom: {
                    selectionOptions: []
                },
            });
        };

    };

    TriggerHistoryCtrl.$inject = [
        'toaster',
        '$translate',
        'uiGridCustomConfig',
        'uiGridConstants'
    ];

    ng.module('triggers').controller('TriggerHistoryCtrl', TriggerHistoryCtrl);
})(window.angular);
