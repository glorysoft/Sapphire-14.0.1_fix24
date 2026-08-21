/* @ngInject */
function ProductViewChangeModeCtrl(productViewService, viewList) {
    const ctrl = this;

    ctrl.setView = function (name, view, isMobile) {
        ctrl.current = view;
        productViewService.setView(name, view, ctrl.currentViewList, isMobile);
    };

    ctrl.toggle = function (name) {
        const index = ctrl.currentViewList.indexOf(ctrl.current);
        const nextViewIndex = index !== -1 ? index + 1 : 0;
        ctrl.setView(
            name,
            ctrl.currentViewList[nextViewIndex < ctrl.currentViewList.length ? nextViewIndex : 0],
            ctrl.currentViewList,
            ctrl.isMobile,
        );
    };
}

export default ProductViewChangeModeCtrl;
