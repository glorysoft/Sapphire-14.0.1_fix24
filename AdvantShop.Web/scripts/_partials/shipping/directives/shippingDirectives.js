import shippingListTemplate from '../templates/shippingList.html';
import shippingVariantsTemplate from '../templates/shippingVariants.html';
import shippingItemErrorTemplate from '../templates/shippingItemError.html';
import shippingPointsListTemplate from '../templates/shippingPointsList.html';
import shippingListModernTemplate from '../templates/shippingListModern.html';

/* @ngInject */
function shippingListDirective(urlHelper, $timeout) {
    return {
        restrict: 'A',
        scope: {
            items: '=',
            selectShipping: '=',
            countVisibleItems: '=',
            change: '&',
            focus: '&',
            anchor: '@',
            isProgress: '=?',
            contact: '<?',
            isCanAddCustom: '<?',
            customShipping: '<?',
            iconWidth: '@',
            iconHeight: '@',
            editPrice: '<?',
            isAdmin: '<?',
            showAll: '<?',
            viewType: '<?',
            amountLimitation: '<?',
            mode: '@',
        },
        controller: 'ShippingListCtrl',
        controllerAs: 'shippingList',
        bindToController: true,
        replace: true,
        templateUrl: (el, attrs) => {
            if (attrs.viewType === 'modern') {
                return shippingListModernTemplate;
            }
            return shippingListTemplate;
        },
        link (scope, element, attrs, ctrl) {
            scope.$watch('shippingList.items', (newValue, oldValue) => {
                $timeout(() => {
                    if (newValue !== oldValue) {
                        ctrl.processCallbacks();
                    }
                }, 50);
            });
        },
    };
}

function shippingTemplateDirective() {
    return {
        restrict: 'A',
        scope: {
            templateUrl: '=',
            shipping: '=',
            isSelected: '=',
            changeControl: '&',
            contact: '<?',
            isAdmin: '<?',
        },
        controller: 'ShippingTemplateCtrl',
        controllerAs: 'shippingTemplate',
        bindToController: true,
        replace: true,
        template: '<div data-ng-include="shippingTemplate.templateUrl"></div>',
    };
}

function shippingVariantsDirective() {
    return {
        restrict: 'A',
        scope: {
            type: '@',
            offerId: '=',
            amount: '=',
            svCustomOptions: '=',
            startOfferId: '@',
            startAmount: '@',
            startSvCustomOptions: '@',
            zip: '@',
            initFn: '&',
        },
        controller: 'ShippingVariantsCtrl',
        controllerAs: 'shippingVariants',
        bindToController: true,
        replace: true,
        templateUrl: shippingVariantsTemplate,
    };
}

function shippingPointsListDirective() {
    return {
        scope: {
            selectedShippingPoint: '<',
            onChange: '&',
            showCityFilter: '<?',
            showMapPickup: '<?',
        },
        controller: 'ShippingPointsListCtrl',
        controllerAs: 'shippingPointsList',
        bindToController: true,
        templateUrl: shippingPointsListTemplate,
    };
}

const shippingItemError = {
    require: {
        shippingTemplate: `?^shippingTemplate`,
        shippingList: `?^shippingList`,
    },
    bindings: {
        errorText: '<',
    },
    templateUrl: shippingItemErrorTemplate,
    controller: 'ShippingItemErrorCtrl',
};

export { shippingListDirective, shippingTemplateDirective, shippingVariantsDirective, shippingItemError, shippingPointsListDirective };
