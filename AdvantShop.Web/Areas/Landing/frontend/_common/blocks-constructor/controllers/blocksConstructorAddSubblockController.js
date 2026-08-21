(function (ng) {
    

    const BlocksConstructorAddSubblockCtrl = function (blocksConstructorBackgroundColors) {
        let ctrl = this,
            _callback;

        ctrl.backgroundColors = blocksConstructorBackgroundColors;

        ctrl.$onInit = function () {
            if (ctrl.onInit != null) {
                ctrl.onInit({ blocksConstructorSubblock: ctrl });
            }
        };

        ctrl.addApplyCallback = function (callback) {
            _callback = callback;
        };

        ctrl.apply = function (modalData) {
            if (_callback != null) {
                return _callback(modalData);
            }
        };
    };

    ng.module('blocksConstructor').controller('BlocksConstructorAddSubblockCtrl', BlocksConstructorAddSubblockCtrl);

    BlocksConstructorAddSubblockCtrl.$inject = ['blocksConstructorBackgroundColors'];
})(window.angular);
