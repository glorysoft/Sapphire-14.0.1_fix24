/* @ngInject */
function InplaceRichCtrl(inplaceService, $scope, $element) {
    const ctrl = this;
    ctrl.callbacks = [];
    //ctrl.inplaceParams = ctrl.inplaceParams();

    ctrl.active = function () {
        ctrl.isShow = true;
        ctrl.startContent = ctrl.editor.getData();
    };

    ctrl.destroy = function () {
        if (ctrl.buttons) {
            ctrl.buttons.element.remove();
        }

        if (ctrl.editor) {
            ctrl.editor.destroy();
            $scope.$destroy();
        }

        $element.removeAttr('contenteditable');
    };

    ctrl.save = function (content) {
        let params;

        if (ctrl.startContent === content) {
            return true;
        }

        if (ctrl.inplaceUrl) {
            params = angular.extend(ctrl.getParams(), { content });

            return inplaceService.save(ctrl.inplaceUrl, params).finally(() => {
                ctrl.isShow = false;

                if (ctrl.inplaceOnSave) {
                    ctrl.inplaceOnSave({ value: content, $scope });
                }
            });
        }
            if (ctrl.inplaceOnSave) {
                return ctrl.inplaceOnSave({ value: content, $scope });
            }


        return true;
    };

    ctrl.cancel = function () {
        ctrl.isShow = false;
        ctrl.editor.setData(ctrl.startContent);
    };

    ctrl.addCallback = function (callback) {
        ctrl.callbacks.push(callback);
    };

    ctrl.callCallbacks = function (callbacksArray) {
        callbacksArray.forEach((callback) => {
            callback();
        });
    };
}

export default InplaceRichCtrl;
