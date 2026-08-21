import offersSelectvizrTemplate from './templates/offers-selectvizr.html';

angular.module('offersSelectvizr')
    .component('offersSelectvizr', {
        templateUrl: offersSelectvizrTemplate,
        controller: 'OffersSelectvizrCtrl',
        transclude: true,
        bindings: {
            selectvizrTreeUrl: '<',
            selectvizrGridUrl: '<',
            selectvizrGridOptions: '<',
            selectvizrGridParams: '<?',
            selectvizrOnChange: '&',
            selectvizrGridOnFetch: '&',
            selectvizrTreeSearch: '<?',
            selectvizrGridSelectionItemsSelectedFn: '&',
            selectvizrProperty: '<?',
            selectvizrGridInplaceUrl: '<?',
        },
    });
