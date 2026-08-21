import ouibounce from '../../../../../node_modules/ouibounce/build/ouibounce.js';

(function (ng) {
    

    ng.module('modalOuibounce', [])
        .controller('ModalOuibounceCtrl', function () {
            const ctrl = this;

            ctrl.modalOuibounceClose = function () {
                ctrl.modalControl.close();
            };
        })
        .directive('modalOuibounce', [
            '$parse',
            function ($parse) {
                return {
                    scope: true,
                    require: {
                        modalControl: 'modalControl',
                    },
                    controller: 'ModalOuibounceCtrl',
                    controllerAs: 'modalOuibounce',
                    bindToController: true,
                    link (scope, element, attrs, ctrl) {
                        const disabled = attrs.modalOuibounceDisabled != null && $parse(attrs.modalOuibounceDisabled)(scope) === true;
                        const optionsCustom = $parse(attrs.modalOuibounceOptions)(scope) || {};
                        const options = ng.extend(
                            {},
                            {
                                aggressive: true,
                                callback () {
                                    ctrl.modalControl.open();
                                    scope.$apply();
                                },
                            },
                            optionsCustom,
                        );

                        if (disabled === false) {
                            ouibounce(element[0], options);
                        }
                    },
                };
            },
        ]);
})(window.angular);
