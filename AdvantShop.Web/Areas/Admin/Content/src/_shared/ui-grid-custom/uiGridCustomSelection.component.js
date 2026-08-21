import uiGridCustomSelectionActionTemplate from './templates/ui-grid-custom-selection-action.html';

angular.module('uiGridCustomSelection').component('uiGridCustomSelection', {
    require: {
        uiGridCustomCtrl: '^uiGridCustom',
    },
    templateUrl: uiGridCustomSelectionActionTemplate,
    controller: 'UiGridCustomSelectionCtrl',
    bindings: {
        grid: '<',
        gridMenuItems: '<',
        gridApi: '<',
        gridOptions: '<',
        gridParams: '<?',
        gridOnAction: '&',
        gridSelectionOnChange: '&',
        gridSelectionOnInit: '&',
        gridOnRequestBefore: '&',
        gridSelectionStoragePrivateId: '&',
    },
});
