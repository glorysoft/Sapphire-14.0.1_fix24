import autocompleteAddressTemplate from './templates/autocompleteAddress.html';
import autocompleteVkMarketCategoriesTemplate from './templates/autocompleteVkMarketCategories.html';
import './templates/location-admin.html';
import './templates/vkMarketCategory.html';

/* @ngInject */
const AutocompleterCustomCtrl = function($http, $scope, autocompleterUrls, $q) {
    const ctrl = this;
    ctrl.find = function(viewValue) {
        if (viewValue == null || viewValue.length < ctrl.minLengthFind) return $q.resolve();

        const url = ctrl.autocompleterUrl || autocompleterUrls[ctrl.onType];
        if (url == null) {
            throw Error('Not find url by onType for autocompleter');
        }
        const params = angular.extend($scope.$eval(ctrl.params) || {}, {
            // eslint-disable-next-line id-length
            q: viewValue,
        });
        return $http
            .get(url, {
                params,
            })
            .then((response) => response.data);
    };
    ctrl.typeaheadOnSelect = function(item) {
        ctrl.selectedItem = item;
        if (ctrl.onSelect != null) {
            ctrl.onSelect($scope, {
                item,
            });
        }
    };
};

angular.module('autocompleter', [])
    .constant('autocompleterUrls', {
        country: 'countries/getCountriesAutocomplete',
        region: 'regions/getRegionsAutocomplete',
        city: 'cities/getCitiesAutocomplete',
    })
    .controller('AutocompleterCustomCtrl', AutocompleterCustomCtrl)
    .directive('autocompleter', () => ({
        require: ['autocompleter', 'ngModel'],
        template:
            '<input autocomplete="new-password" uib-typeahead="item for item in autocompleter.find(autocompleter.ngModel.$viewValue)" typeahead-focus-first="false">',
        replace: true,
        controller: 'AutocompleterCustomCtrl',
        controllerAs: 'autocompleter',
        bindToController: true,
        //scope: {
        //    onType: '@',
        //    minLengthFind: '<?'
        //},
        scope: true,
        link(_scope, _element, attrs, ctrls) {
            const autocompleterCtrl = ctrls[0],
                ngModelCtrl = ctrls[1];
            autocompleterCtrl.minLengthFind = 1;
            autocompleterCtrl.onType = attrs.onType;
            autocompleterCtrl.ngModel = ngModelCtrl;
        },
    }))
    .directive('autocompleterAddress', [
        '$parse',
        function($parse) {
            return {
                require: ['autocompleterAddress', 'ngModel'],
                templateUrl: autocompleteAddressTemplate,
                replace: true,
                controller: 'AutocompleterCustomCtrl',
                controllerAs: 'autocompleter',
                bindToController: true,
                scope: true,
                link(_scope, _element, attrs, ctrls) {
                    if (attrs.autocompleterAddress === 'false') {
                        return;
                    }
                    const autocompleterCtrl = ctrls[0],
                        ngModelCtrl = ctrls[1];
                    autocompleterCtrl.ngModel = ngModelCtrl;
                    autocompleterCtrl.minLengthFind = 1;
                    autocompleterCtrl.autocompleterUrl = attrs.autocompleterUrl || 'cities/GetCitiesSuggestions';
                    autocompleterCtrl.onSelect = attrs.onSelect != null ? $parse(attrs.onSelect) : null;
                    autocompleterCtrl.params = attrs.autocompleterParams != null ? $parse(attrs.autocompleterParams) : null;

                    if (attrs.requiredAddress) {
                        autocompleterCtrl.ngModel.$validators.requiredAddress = (modelValue, _viewValue) => {
                            if (!modelValue.modified) {
                                return modelValue.length > 0;
                            }
                            return typeof autocompleterCtrl.selectedItem !== 'undefined' && autocompleterCtrl.selectedItem !== null;
                        };
                    }
                },
            };
        },
    ])
    .directive('autocompleterSuggest', () => ({
        require: ['autocompleterSuggest', 'ngModel', 'uibTypeahead'],
        controller: 'AutocompleterCustomCtrl',
        controllerAs: 'autocompleter',
        bindToController: true,
        scope: true,
        link(_scope, _element, attrs, ctrls) {
            if (attrs.autocompleterUrl == null) {
                // eslint-disable-next-line no-console
                console.error('missing "autocompleterUrl" attribute');
                return;
            }
            const autocompleterCtrl = ctrls[0],
                ngModelCtrl = ctrls[1];
            autocompleterCtrl.ngModel = ngModelCtrl;
            autocompleterCtrl.minLengthFind = 1;
            autocompleterCtrl.autocompleterUrl = attrs.autocompleterUrl;
        },
    }))
    .directive('autocompleterVkMarketCategories', [
        '$parse',
        function($parse) {
            return {
                require: ['autocompleterVkMarketCategories', 'ngModel'],
                templateUrl: autocompleteVkMarketCategoriesTemplate,
                replace: true,
                controller: 'AutocompleterCustomCtrl',
                controllerAs: 'autocompleter',
                bindToController: true,
                scope: true,
                link(_scope, _element, attrs, ctrls) {
                    const autocompleterCtrl = ctrls[0],
                        ngModelCtrl = ctrls[1];
                    autocompleterCtrl.ngModel = ngModelCtrl;
                    autocompleterCtrl.minLengthFind = 3;
                    autocompleterCtrl.autocompleterUrl = attrs.autocompleterUrl;
                    autocompleterCtrl.onSelect = attrs.onSelect != null ? $parse(attrs.onSelect) : null;
                    autocompleterCtrl.params = attrs.autocompleterParams != null ? $parse(attrs.autocompleterParams) : null;
                },
            };
        },
    ]);
