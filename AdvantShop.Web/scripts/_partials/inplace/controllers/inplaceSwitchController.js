/* @ngInject */
function InplaceSwitchCtrl($window, inplaceService) {
    const ctrl = this;

    ctrl.change = function (enabled) {
        inplaceService.setEnable(enabled).then((result) => {
            if (result === true) {
                $window.location.reload();
            }
        });
    };
}
export default InplaceSwitchCtrl;
