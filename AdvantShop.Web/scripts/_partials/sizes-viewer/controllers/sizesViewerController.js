/* @ngInject */
function SizesViewerCtrl($element) {
    const ctrl = this;

    ctrl.$onInit = function () {

        ctrl.ngChoices = {classNames: {containerOuter: []}};
        if($element.closest('.adv-modal').length === 0 && ctrl.controlType === 'select') {
            ctrl.ngChoices.classNames.containerOuter.push('choices-container--modal');
        }

        if (ctrl.startSelectedSizes != null && ctrl.startSelectedSizes.length > 0) {
            for (let s = 0, lenS = ctrl.startSelectedSizes.length; s < lenS; s++) {
                for (let c = 0, lenC = ctrl.sizes.length; c < lenC; c++) {
                    if (ctrl.sizes[c].SizeId === ctrl.startSelectedSizes[s]) {
                        ctrl.sizeSelected = ctrl.sizes[c];
                        break;
                    }
                }
            }
        }

        ctrl.initSizes({ sizesViewer: ctrl });
    };
}

export default SizesViewerCtrl;
