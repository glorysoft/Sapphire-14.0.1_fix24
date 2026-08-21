    angular.module('uiModal')
        .directive('uiModalTrigger', [
            '$parse',
            function ($parse) {
                return {
                    controller: 'UiModalTriggerCtrl',
                    bindToController: true,
                    scope: {
                        controller: '<',
                        resolve: '@',
                        controllerAs: '@',
                        template: '@',
                        templateUrl: '@',
                        size: '@',
                        backdrop: '@',
                        windowClass: '@',
                        onClose: '&',
                        onDismiss: '&',
                        onBeforeOpen: '&',
                        keyboard: '<?',
                        animation: '<?',
                        openedClass: '@',
                        scope: '<?',
                        component: '@',
                        isDisabled: '<?',
                    },
                    link (scope, element, attrs, ctrl) {
                        if (attrs.resolve && attrs.resolve.length > 0) {
                            ctrl.resolveParse = $parse(attrs.resolve);
                        }
                        element.on('click', () => {
                            ctrl.isDisabled = !ctrl.isDisabled ? false : ctrl.isDisabled;

                            if (ctrl.isDisabled === false) {
                                document.activeElement.blur();
                                ctrl.open();
                                scope.$digest();
                            }
                        });
                    },
                };
            },
        ])
        .component('uiModalCross', {
            template: '<div class="close" ng-click="$ctrl.close()"></div>',
            bindings: {
                closeFn: '&',
            },
            controller: [
                '$uibModalStack',
                '$attrs',
                function ($uibModalStack, $attrs) {
                    // eslint-disable-next-line no-invalid-this
                    this.close = function () {
                        if ($attrs.closeFn) {
                            this.closeFn();
                        } else {
                            $uibModalStack.getTop().key.dismiss('crossClick');
                        }
                    };
                },
            ],
        })
        .component('uiModalDismiss', {
            transclude: true,
            template: '<span ng-click="$ctrl.close()" ng-transclude></span>',
            controller: [
                '$uibModalStack',
                function ($uibModalStack) {
                    // eslint-disable-next-line no-invalid-this
                    this.close = function () {
                        $uibModalStack.getTop().key.dismiss('crossClick');
                    };
                },
            ],
        });
