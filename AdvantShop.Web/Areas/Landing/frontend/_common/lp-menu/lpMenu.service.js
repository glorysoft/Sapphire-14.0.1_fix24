(function (ng) {
    

    const lpMenuService = function ($rootScope, $window, domService, $document) {
        const service = this;
        const storage = {};
        let activeMenuId = null;
        const MEDIA_SHOW_MOBILE_MENU = '(max-width: 1024px)';
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        service.addInStorage = function (id) {
            return (storage[id] = {
                state: {
                    open: false,
                },
            });
        };

        service.open = function (id) {
            if (storage[id]) {
                storage[id].state.open = true;
                activeMenuId = id;
                if (isIOS) {
                    service.addOverflowHiddenForModal();
                }
            }
        };

        service.close = function (id) {
            if (storage[id]) {
                storage[id].state.open = false;
                activeMenuId = null;
                if (isIOS) {
                    service.removeOverflowHiddenForModal();
                }
            }
        };

        service.addOverflowHiddenForModal = function () {
            $document[0].body.classList.add('overflow-hidden-for-modal-ios');
        };

        service.removeOverflowHiddenForModal = function () {
            $document[0].body.classList.remove('overflow-hidden-for-modal-ios');
        };

        $window.addEventListener('click', (event) => {
            let isElInteractive;
            let inMenuContainer;

            if (activeMenuId != null) {
                isElInteractive = ['a', 'input', 'button'].some((item) => item === event.target.tagName.toLowerCase());

                if (isElInteractive === true) {
                    inMenuContainer = Object.keys(storage).some((item) => domService.closest(event.target, `#${  item}`));

                    if (inMenuContainer === true) {
                        service.close(activeMenuId);
                        $rootScope.$apply();
                    }
                }
            }
        });

        const mql = $window.matchMedia(MEDIA_SHOW_MOBILE_MENU);

        mql.addListener((mql) => {
            const storageKeys = Object.keys(storage);
            let isOpenMenu;
            for (let i = 0; i < storageKeys.length; i++) {
                const innerObj = storage[storageKeys[i]];
                if (innerObj != null && innerObj.state != null && innerObj.state.open) {
                    isOpenMenu = true;
                    break;
                }
            }
            if (mql.matches && isOpenMenu) {
                service.addOverflowHiddenForModal();
            } else {
                service.removeOverflowHiddenForModal();
            }
        });
    };

    ng.module('lpMenu').service('lpMenuService', lpMenuService);

    lpMenuService.$inject = ['$rootScope', '$window', 'domService', '$document'];
})(window.angular);
