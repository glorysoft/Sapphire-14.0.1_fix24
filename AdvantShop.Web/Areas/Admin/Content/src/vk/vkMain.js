(function (ng) {
    

    const VkMainCtrl = function () {
        const ctrl = this;

        ctrl.initVkChannel = function (vkChannel) {
            ctrl.vkChannel = vkChannel;
        };

        ctrl.refreshChild = function (childName) {
            if (ctrl.vkChannel.childs[childName] != null && ctrl.vkChannel.childs[childName].refresh != null) {
                ctrl.vkChannel.childs[childName].refresh();
            }
        };
    };

    ng.module('vkMain', []).controller('VkMainCtrl', VkMainCtrl);
})(window.angular);
