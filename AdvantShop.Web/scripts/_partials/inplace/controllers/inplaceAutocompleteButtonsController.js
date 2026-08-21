/* @ngInject */
function InplaceAutocompleteButtonsCtrl(inplaceService) {
    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.inplaceAutocomplete = inplaceService.getInplaceAutocomplete(ctrl.inplaceAutocompleteButtons);
    };

    ctrl.btnSave = function () {
        ctrl.inplaceAutocomplete.clickedButtons = true;
        ctrl.inplaceAutocomplete.save();
    };

    ctrl.btnCancel = function () {
        ctrl.inplaceAutocomplete.clickedButtons = true;
        ctrl.inplaceAutocomplete.cancel();
    };
}
export default InplaceAutocompleteButtonsCtrl;
