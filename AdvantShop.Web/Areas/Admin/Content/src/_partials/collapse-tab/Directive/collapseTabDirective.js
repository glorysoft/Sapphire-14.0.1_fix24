angular.module('collapseTab').directive(
    'collapseTab',
    /* @ngInject */ ($timeout, $q) => ({
        require: ['collapseTab', '?^uibTabset'],
        controller: 'CollapseTabCtrl',
        controllerAs: 'collapseTab',
        bindToController: true,
        link(_scope, element, _attr, [collapseTab, uibTabset]) {
            const defer = $q.defer();

            if (document.readyState === 'complete') {
                defer.resolve();
            } else {
                window.addEventListener('load', defer.resolve);
            }
            defer.promise.then(() => {
                $timeout(() => {
                    const tabs = element.prevAll('.nav-collapse-tab');
                    const callback = (entries) => {

                        for(const entry of entries) {
                            for(const addNode of entry.addedNodes){
                                if (addNode.nodeType === Node.ELEMENT_NODE && !addNode.dataset?.widthEl) {
                                    addNode.dataset.widthEl = addNode.offsetWidth;
                                }
                            }
                        }

                        if (collapseTab.inProcess === true) {
                            return;
                        }

                        if (!collapseTab.initialized) {
                            collapseTab.init(tabs);
                            uibTabset.addCustomClass('nav-collapse-tab--initialized');
                        } else {
                            collapseTab.recalc(tabs);
                        }
                    };

                    const observer = new MutationObserver(callback);

                    observer.observe(tabs[0], { childList: true });

                    element.on('$destroy', () => {
                        observer.disconnect();
                    });
                    collapseTab.init(tabs);
                });
            });
        },
    }),
);
