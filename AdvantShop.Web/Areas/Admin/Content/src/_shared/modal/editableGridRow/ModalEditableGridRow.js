import './editableGridRow.html';


const ModalEditableGridRowCtrl = /* @ngInject */function ($uibModalInstance, $scope) {
    const ctrl = this;

    ctrl.$onInit = function () {
        $scope.$on('modal.closing', ctrl.onClose);
        ctrl.uiGridCellCustomScopes = [];
        ctrl.params = ctrl.$resolve.params;
        ctrl.editableColumns = ctrl.$resolve.params.editableColumns || [];
        ctrl.columnDefs = ctrl.$resolve.params.columnDefs || [];
        ctrl.row = ctrl.$resolve.params.row;
        ctrl.backupRowData = {...ctrl.row.entity};
        ctrl.uiGridCustom = $scope.$ctrl;
    };

    ctrl.addUiGridCellCustomScope = function (scope) {
        ctrl.uiGridCellCustomScopes.push(scope);
    };

    ctrl.onClose = function (_$event, _reason, closed) {
        if (closed === false) {
            ctrl.row.entity = ctrl.backupRowData;
        }
    };

    ctrl.close = function () {
        $uibModalInstance.dismiss('cancel');
    };

    ctrl.save = function () {

        const editableColumnsChanges = [],
            uiGridCellCustomScopesChanges = [];

        for (let index = 0; index < ctrl.editableColumns.length; ++index) {
            if (angular.equals(ctrl.row.entity[ctrl.editableColumns[index].field], ctrl.backupRowData[ctrl.editableColumns[index].field])) {
                continue;
            }
            editableColumnsChanges.push(ctrl.editableColumns[index]);
            uiGridCellCustomScopesChanges.push(ctrl.uiGridCellCustomScopes[index]);
        }

        ctrl.uiGridCustom.inplaceApplyAll(editableColumnsChanges, uiGridCellCustomScopesChanges, ctrl.row);

        $uibModalInstance.close();
    };
};

angular.module('uiModal').controller('ModalEditableGridRowCtrl', ModalEditableGridRowCtrl);
