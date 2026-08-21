import uiGridCustomTemplate from './templates/ui-grid-custom.html';
import uiGridCustomMobileTemplate from './templates/ui-grid-custom-mobile.html';

angular.module('uiGridCustom')
    .directive('uiGridCustom',
        /* @ngInject */
        (uiGridCustomService) => ({
            restrict: 'E',
            templateUrl: uiGridCustomTemplate,
            controller: 'UiGridCustomCtrl',
            controllerAs: '$ctrl',
            bindToController: true,
            transclude: {
                footer: '?uiGridCustomFooter',
                overrideControl: '?uiGridCustomOverrideControl',
                overrideHeaderControl: '?uiGridCustomOverrideHeaderControl',
            },
            scope: {
                gridOptions: '<',
                gridUrl: '<?',
                gridInplaceUrl: '<?',
                gridParams: '<?',
                gridFilterEnabled: '<?',
                gridFilterHiddenTotalItemsCount: '<?',
                gridFilterSearchAutofocus: '<?',
                gridSelectionEnabled: '<?',
                gridPaginationEnabled: '<?',
                gridTreeViewEnabled: '<?',
                gridUniqueId: '@',
                gridOnInplaceBeforeApply: '&',
                gridOnInplaceApply: '&',
                gridOnInplaceApplyAll: '&',
                gridOnInplaceBeforeApplyAll: '&',
                gridOnInit: '&',
                gridSearchPlaceholder: '<?',
                gridSearchVisible: '<?',
                gridExtendCtrl: '<?',
                gridEmptyText: '<?',
                gridSelectionOnInit: '&',
                gridSelectionOnChange: '&',
                gridSelectionMassApply: '&',
                gridSelectionStoragePrivateId: '&',
                gridOnFetch: '&',
                gridOnDelete: '&',
                gridOnBeforeDelete: '&',
                gridOnPreinit: '&',
                gridShowExport: '<?',
                gridOnFilterInit: '&',
                gridSelectionItemsSelectedFn: '&',
                gridRowIdentificator: '<?',
                gridPreventStateInHash: '<?',
                gridFilterTemplateUrl: '<?',
                gridKeyStoragePrefix: '<?',
                gridSwipeLine: '<?',
            },
            compile(cElement) {
                const uiGridElement = cElement[0].querySelector('[ui-grid]');
                return function(scope, _element, _attrs, ctrl) {

                    if (ctrl.gridSelectionEnabled == null || ctrl.gridSelectionEnabled === true) {
                        uiGridElement.setAttribute('ui-grid-selection', '');
                    } else {
                        uiGridElement.removeAttribute('ui-grid-selection');
                    }

                    if (ctrl.gridTreeViewEnabled === true) {
                        uiGridElement.setAttribute('ui-grid-tree-view', '');
                    } else {
                        uiGridElement.removeAttribute('ui-grid-tree-view');
                    }

                    scope.$on('modal.closing', () => {
                        ctrl.clearParams();
                        uiGridCustomService.removeFromStorage(ctrl.gridUniqueId);
                    });
                };
            },
        }))
    .component('uiGridCustomSwitch', {
        require: {
            uiGridCustom: '^uiGridCustom',
        },
        template:
            '<div class="ui-grid-cell-contents"><div class="js-grid-not-clicked"><switch-on-off checked="$ctrl.row.entity[$ctrl.fieldName || \'Enabled\']" on-change="$ctrl.uiGridCustom.setSwitchEnabled($ctrl.row.entity, checked, $ctrl.fieldName || \'Enabled\')" readonly="$ctrl.readonly" on-click="$ctrl.onClick()"></switch-on-off></div></div>',
        bindings: {
            row: '<',
            fieldName: '@',
            readonly: '<?',
            onClick: '&',
        },
    })
    .component('uiGridCustomDelete', {
        require: {
            uiGridCustom: '^^uiGridCustom',
        },
        transclude: true,
        template:
            '<button type="button" ng-click="$ctrl.delete($ctrl.url, $ctrl.params, $ctrl.confirmText)" ng-class="[$ctrl.classes, \'btn-icon\']" ng-transclude aria-label="Удалить"></button>',
        bindings: {
            url: '@',
            params: '<',
            confirmText: '@',
            onDelete: '&',
            classes: '@',
        },
        controller: [
            '$http',
            'SweetAlert',
            'toaster',
            'lastStatisticsService',
            '$translate',
            '$scope',
            function($http, SweetAlert, toaster, lastStatisticsService, $translate, $scope) {
                const ctrl = this;
                ctrl.$onInit = function() {
                    if (ctrl.classes == null) {
                        ctrl.classes = 'ui-grid-custom-service-icon fa fa-times link-invert';
                    }
                };
                ctrl.delete = function(url, params, confirmText) {
                    SweetAlert.confirm(confirmText != null ? confirmText : $translate.instant('Admin.Js.GridCustomComponent.AreYouSureDelete'), {
                        title: $translate.instant('Admin.Js.GridCustomComponent.Deleting'),
                        confirmButtonText: $translate.instant('Admin.Js.GridCustomComponent.Confirm'),
                        cancelButtonText: $translate.instant('Admin.Js.GridCustomComponent.Cancel'),
                    }).then((result) => {
                        if (result === true || result.value === true) {
                            if (ctrl.uiGridCustom.gridOnBeforeDelete != null) {
                                ctrl.uiGridCustom.gridOnBeforeDelete();
                            }

                            ctrl.uiGridCustom.setStateProcess(true);

                            $http.post(url, params).then(
                                (response) => {
                                    const data = response.data;
                                    if (data === true || (data.result != null && data.result === true)) {
                                        toaster.pop('success', '', $translate.instant('Admin.Js.GridCustom.ChangesSaved'));
                                        lastStatisticsService.getLastStatistics();
                                        const rowEntity =
                                            $scope.$parent.$parent.row != null
                                                ? $scope.$parent.$parent.row.entity
                                                : $scope.$parent.$parent.$parent.row.entity;
                                        ctrl.uiGridCustom.deleteItem(rowEntity).then(() => {
                                            if (ctrl.onDelete != null) {
                                                ctrl.onDelete();
                                            }
                                        });
                                    } else if (data.errors != null && data.errors.length > 0) {
                                        data.errors.forEach((error) => {
                                            toaster.pop('error', '', error);
                                        });
                                    }
                                    return data;
                                },
                            ).catch((err) => {
                                toaster.pop('success', '', $translate.instant('Admin.Js.GridCustomComponent.ErrorWhileDeletingWriting'));
                            }).finally(() => {
                                ctrl.uiGridCustom.setStateProcess(false);
                            });
                        }
                    });
                };
            },
        ],
    })
    .directive('uiGridCustomOverrideControl', [
        '$parse',
        function($parse) {
            return {
                require: {
                    uiGridCustom: '^uiGridCustom',
                },
                controller: 'UiGridCustomOverrideControlCtrl',
                scope: true,
                bindToController: true,
                compile(element, attrs) {
                    const html = element[0].innerHTML;
                    element[0].innerHTML = '';
                    return function(scope, element, attrs, ctrl) {
                        ctrl.html = html;
                        ctrl.scope = scope;
                        ctrl.dynamicTemplate = $parse(attrs.dynamicTemplate)(scope);
                        ctrl.uiGridCustom.addOverrideControl(ctrl);
                    };
                },
            };
        },
    ])
    .directive('uiGridCustomOverrideHeaderControl', () => ({
        require: {
            uiGridCustom: '^uiGridCustom',
        },
        controller: 'UiGridCustomOverrideControlCtrl',
        scope: true,
        bindToController: true,
        compile(element, attrs) {
            const html = element[0].innerHTML;
            element[0].innerHTML = '';
            return function(scope, element, attrs, ctrl) {
                ctrl.html = html;
                ctrl.scope = scope;
                ctrl.uiGridCustom.addOverrideHeaderControl(ctrl);
            };
        },
    }))
    .directive('uiGridCustomMobile', [
        '$parse',
        'urlHelper',
        function($parse, urlHelper) {
            return {
                restrict: 'EA',
                templateUrl: uiGridCustomMobileTemplate,
                require: {
                    uiGridCustom: '^uiGridCustom',
                },
                scope: true,
                link(scope, element, attrs) {
                    scope.itemTemplate = $parse(attrs.dynamicTemplate)(scope) || $parse(attrs.itemTemplate)(scope);
                },
            };
        },
    ])
    .directive('uiGridCustomCell', [
        '$compile',
        '$parse',
        function($compile, $parse) {
            return {
                restrict: 'EA',
                require: {
                    uiGridCustom: '^uiGridCustom',
                },
                scope: true,
                link(scope, element, attrs) {
                    const colName = $parse(attrs.uiGridCustomCell)(scope);
                    const col = scope.colContainer.renderedColumns.find((x) => x.field === colName);
                    if (col != null) {
                        scope.col = col;
                        element.append('<div ui-grid-cell></div>');
                        $compile(element.contents())(scope);
                    }
                },
            };
        }]);
