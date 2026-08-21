/*@ngInject*/
function SearchPanelCtrl(domService) {
    const ctrl = this;
    ctrl.active = false;

    ctrl.togglePanel = function () {
        ctrl.active = !ctrl.active;
    };

    ctrl.hidePanel = function () {};

    ctrl.clickOut = function (event) {
        const parent = domService.closest(event.target, '.js-click-out');
        if (parent == null) {
            ctrl.active = false;
        }
    };

    ctrl.search = function (searchQuery) {
        if (searchQuery) window.location.replace(`${document.getElementsByTagName('base')[0].href  }/search?q=${  searchQuery}`);
    };
}

export default SearchPanelCtrl;
