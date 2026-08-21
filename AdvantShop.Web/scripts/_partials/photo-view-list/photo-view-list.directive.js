/* @ngInject */
function PhotoViewList($parse) {
    return {
        scope: true,
        controller: 'PhotoViewListCtrl',
        controllerAs: 'photoViewList',
        bindToController: true,
        link(scope, element, attrs, ctrl) {
            element[0].classList.add('photo-view-list');

            let onHoverNavItem;

            if (attrs.photoViewListOnHoverNavItem != null) {
                onHoverNavItem = $parse(attrs.photoViewListOnHoverNavItem);
            }
            ctrl.onHoverNavItem = function () {
                if (onHoverNavItem != null) {
                    onHoverNavItem(scope);
                }
            };
        },
    };
}

function PhotoViewListItem() {
    return {
        scope: true,
        require: ['^photoViewList'],
        bindToController: true,
        link(_scope, element, _attrs, ctrls) {
            const photoViewListCtrl = ctrls[0];
            element[0].classList.add('photo-view-list__item');
            if (element[0].parentNode != null && !element[0].parentNode.classList.contains('photo-view-list__item-wrap')) {
                element[0].parentNode.classList.add('photo-view-list__item-wrap');
            }
            photoViewListCtrl.activeItemIndex = 0;
            photoViewListCtrl.isActiveElement = true;
        },
    };
}

function PhotoViewListNav() {
    return {
        scope: true,
        require: ['^photoViewList'],
        bindToController: true,
        link(scope, element, _attrs, ctrls) {
            const photoViewListCtrl = ctrls[0];
            element[0].classList.add('photo-view-list__nav');
            photoViewListCtrl.activeNavIndex = 0;
            photoViewListCtrl.isActiveElementNav = true;

            element[0].addEventListener(
                'mouseenter',
                (event) => {
                    const target = event.target;
                    const indexActiveNav = target.getAttribute('data-nav-index');
                    photoViewListCtrl.activeNavIndex = parseFloat(indexActiveNav);
                    photoViewListCtrl.activeItemIndex = parseFloat(indexActiveNav);
                    photoViewListCtrl.onHoverNavItem();
                    scope.$apply();
                },
                true,
            );

            element[0].addEventListener(
                'mouseleave',
                () => {
                    const indexActiveNav = 0;
                    photoViewListCtrl.activeNavIndex = indexActiveNav;
                    photoViewListCtrl.activeItemIndex = indexActiveNav;
                    photoViewListCtrl.onHoverNavItem();
                    scope.$apply();
                },
                true,
            );
        },
    };
}

export { PhotoViewList, PhotoViewListItem, PhotoViewListNav };
