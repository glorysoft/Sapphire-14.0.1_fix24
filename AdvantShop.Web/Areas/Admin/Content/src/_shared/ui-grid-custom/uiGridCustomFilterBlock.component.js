import uiGridCustomFilterBlockTemplate from './templates/ui-grid-custom-filter-block.html';
(function (ng) {
    

    ng.module('uiGridCustomFilter').component('uiGridCustomFilterBlock', {
        templateUrl: uiGridCustomFilterBlockTemplate,
        controller: 'UiGridCustomFilterBlockCtrl',
        bindings: {
            item: '<',
            blockType: '<',
            onApply: '&',
            onClose: '&',
        },
    });
})(window.angular);
