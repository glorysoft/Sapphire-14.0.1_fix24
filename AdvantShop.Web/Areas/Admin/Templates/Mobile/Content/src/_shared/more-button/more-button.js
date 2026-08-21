const moduleName = `moreButton`;

angular.module(moduleName, []).directive(
    `moreButton`,
    /* @ngInject */ ($parse, $uibModalStack, $timeout) => ({
        link(scope, _element, attrs) {
            let modalObserverDestroy;
            const attrValue = attrs.popoverIsOpen;
            scope.$watch(attrValue, (newVal, oldVal) => {
                if (newVal !== oldVal) {
                    if (newVal === true) {
                        modalObserverDestroy = scope.$on(`modal.decorate.closing`, (_event, data) => {
                            $timeout(() => {
                                if (data.isClose === true && !$uibModalStack.getTop()) {
                                    $parse(attrValue).assign(scope, false);
                                }
                            });
                        });
                    } else if (modalObserverDestroy) {
                        modalObserverDestroy();
                        modalObserverDestroy = null;
                    }
                }
            });

            scope.close = () => {
                angular.element(document.querySelector('body')).click();
            };
        },
    }),
);

export default moduleName;
