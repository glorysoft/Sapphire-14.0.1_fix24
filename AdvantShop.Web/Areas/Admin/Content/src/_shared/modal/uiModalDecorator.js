(function (ng) {
    
    ng.module('uiModal').config([
        '$provide',
        function ($provide) {
            $provide.decorator('$uibModal', [
                '$delegate',
                'isMobileService',
                '$rootScope',
                function ($delegate, isMobileService, $rootScope) {
                    const originalWarn = $delegate.open;
                    $delegate.open = function (options, useCustomOptions = false) {
                        //useCustomOptions нужен чтоб при нажатии на backdrop не закрывалась модалка TODO
                        if (isMobileService.getValue() && !useCustomOptions) {
                            options.backdrop = true;
                        }
                        const modalInstance = originalWarn.apply($delegate, arguments);
                        modalInstance.result
                            .then((result) => {
                                $rootScope.$broadcast('modal.decorate.closing', { isClose: true });
                                return result;
                            })
                            .catch((err) => {
                                $rootScope.$broadcast('modal.decorate.closing', { isDismiss: true });
                                return err;
                            });

                        return modalInstance;
                    };
                    return $delegate;
                },
            ]);

            $provide.decorator(
                'uibModalTranscludeDirective',
                /* @ngInject */
                ($delegate, $animate, $document, isMobileService) => {
                    const directive = $delegate[0];
                    const originalLink = directive.link;

                    delete directive.link;

                    directive.compile = function () {
                        return function (scope, element) {
                            if (isMobileService.getValue() === false) {
                                element[0].addEventListener('mousedown', (event) => {
                                    scope.$parent.isMouseDownContent = true;
                                });
                            }

                            originalLink.apply(this, arguments);
                        };
                    };

                    return $delegate;
                },
            );

            $provide.decorator(
                'uibModalWindowDirective',
                /* @ngInject */
                ($delegate, $q, $animateCss, $document, isMobileService) => {
                    const directive = $delegate[0];
                    const originalLink = directive.link;

                    directive.compile = function (cElement, cAttrs) {
                        return function (scope, element) {
                            document.body.appendChild(element[0]);

                            originalLink.apply(this, arguments);

                            const originalClose = scope.close;

                            element.off('click', scope.close);

                            scope.close = function (event) {
                                if (isMobileService.getValue() && event != null && event.target.closest('.modal-dialog') != null) {
                                    event.stopPropagation();
                                    if (
                                        event.target.classList.contains('dropdown-menu') === false &&
                                        event.target.classList.contains('dropdown-toggle') === false
                                    ) {
                                        element.find('.dropdown-toggle').dropdown('hide');
                                    }
                                }
                                if (scope.$parent.isMouseDownContent !== true) {
                                    originalClose.apply(scope, arguments);
                                }
                            };

                            element.on('click', scope.close);

                            $document[0].addEventListener('click', (event) => {
                                scope.$parent.isMouseDownContent = null;
                            });
                        };
                    };

                    delete directive.link;

                    return $delegate;
                },
            );

            $provide.decorator('uibModalBackdropDirective', [
                '$delegate',
                function ($delegate) {
                    const directive = $delegate[0];
                    const originalCompile = directive.compile;

                    directive.compile = function () {
                        const linkFn = originalCompile.apply(this, arguments);
                        return function (scope, element) {
                            linkFn.apply(this, arguments);
                            setTimeout(() => document.body.appendChild(element[0]));
                        };
                    };

                    return $delegate;
                },
            ]);
        },
    ]);
})(window.angular);
