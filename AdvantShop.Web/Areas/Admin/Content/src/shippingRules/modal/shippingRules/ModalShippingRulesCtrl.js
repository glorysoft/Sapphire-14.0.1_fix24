(function (ng) {
    

    const ModalShippingRulesCtrl = function ($uibModalInstance, $http, toaster, $translate) {
        const ctrl = this;
        ctrl.rule = {};
        ctrl.actions = [];
        ctrl.filters = [];
        ctrl.validForList = [
            { label: $translate.instant('Admin.Js.ShippingRules.ValidFor.All'), value: 'allShipping' },
            { label: $translate.instant('Admin.Js.ShippingRules.ValidFor.ByType'), value: 'byType' },
            { label: $translate.instant('Admin.Js.ShippingRules.ValidFor.ById'), value: 'byId' },
            { label: $translate.instant('Admin.Js.ShippingRules.ValidFor.ExcludeByType'), value: 'excludeByType' },
            { label: $translate.instant('Admin.Js.ShippingRules.ValidFor.ExcludeById'), value: 'excludeById' },
        ];
        ctrl.typesOfAction = [
            { label: $translate.instant('Admin.Js.ShippingRules.Rules.FixedCost'), value: 'fixedCost' },
            { label: $translate.instant('Admin.Js.ShippingRules.Rules.SwitchOff'), value: 'switchOff' },
            { label: $translate.instant('Admin.Js.ShippingRules.Rules.IncreaseCost'), value: 'increaseCost' },
            { label: $translate.instant('Admin.Js.ShippingRules.Rules.ReduceCost'), value: 'reduceCost' },
            { label: $translate.instant('Admin.Js.ShippingRules.Rules.IncreaseCostByOrderSum'), value: 'increaseCostByOrderSum' },
            { label: $translate.instant('Admin.Js.ShippingRules.Rules.ReduceCostByOrderSum'), value: 'reduceCostByOrderSum' },
        ];
        ctrl.typesOfFilter = [
            { label: $translate.instant('Admin.Js.ShippingRules.If.TotalPrice'), value: 'filterTotalPrice' },
            { label: $translate.instant('Admin.Js.ShippingRules.If.ShippingCost'), value: 'filterCost' },
            { label: $translate.instant('Admin.Js.ShippingRules.If.Weight'), value: 'filterWeight' },
        ];
        ctrl.typesOfComparison = [
            { label: $translate.instant('Admin.Js.ShippingRules.If.TypeOfComparison.More'), value: 'more' },
            { label: $translate.instant('Admin.Js.ShippingRules.If.TypeOfComparison.Less'), value: 'less' },
            { label: $translate.instant('Admin.Js.ShippingRules.If.TypeOfComparison.Range'), value: 'range' },
        ];

        ctrl.$onInit = function () {
            ctrl.rule.Id = ctrl.$resolve != null ? ctrl.$resolve.id : 0;
            ctrl.mode = ctrl.rule.Id ? 'edit' : 'add';
            ctrl.getFormData().then((result) => {
                if (result) {
                    if (ctrl.mode === 'add') {
                        ctrl.rule.Enabled = true;
                        ctrl.rule.SortOrder = 0;
                        ctrl.validFor = 'allShipping';
                    } else {
                        ctrl.getRule();
                    }
                }
            });
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getFormData = function () {
            return $http.get('ShippingMethods/getRuleFormData', { params: { id: ctrl.rule.Id } }).then((result) => {
                const data = result.data;
                if (data.result === true) {
                    ctrl.formData = data.obj;

                    return true;
                } 
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop('error', $translate.instant('Admin.Js.ErrorLoading'));
                    }

                    return false;
                
            });
        };

        ctrl.getRule = function () {
            return $http.get('ShippingMethods/getRule', { params: { id: ctrl.rule.Id } }).then((result) => {
                const data = result.data;
                if (data.result === true) {
                    ctrl.rule = data.obj;
                    ctrl.loadEditors(ctrl.rule.EditorsParams);
                    ctrl.loadFilters(ctrl.rule.FiltersParams);
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });

                    if (!data.errors) {
                        toaster.pop('error', $translate.instant('Admin.Js.ErrorLoading'));
                    }
                    ctrl.close();
                }
            });
        };

        ctrl.save = function () {
            const url = ctrl.mode === 'add' ? 'ShippingMethods/addRule' : 'ShippingMethods/updateRule';
            ctrl.rule.FiltersParams = ctrl.getFiltersParamsString();
            ctrl.rule.EditorsParams = ctrl.getEditorsParamsString();

            return $http.post(url, ctrl.rule).then((response) => {
                const data = response.data;
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.ChangesSaved'));
                    $uibModalInstance.close();
                } else if (data.errors) {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });
                } else {
                    toaster.pop('error', $translate.instant('Admin.Js.ErrorLoading'));
                }
            });
        };

        ctrl.getFiltersParamsString = function () {
            const paramsSeparator = ctrl.formData.ParametersSeparator;
            const filtersParams = [];
            if (ctrl.validFor === 'allShipping') {
                filtersParams.push(ctrl.validFor);
            }
            if (ctrl.validFor === 'byType') {
                filtersParams.push(ctrl.validFor + paramsSeparator + ctrl.ValidForTypes.join(','));
            }
            if (ctrl.validFor === 'byId') {
                filtersParams.push(ctrl.validFor + paramsSeparator + ctrl.ValidForIds.join(','));
            }
            if (ctrl.validFor === 'excludeByType') {
                filtersParams.push(ctrl.validFor + paramsSeparator + ctrl.ExcludeForTypes.join(','));
            }
            if (ctrl.validFor === 'excludeById') {
                filtersParams.push(ctrl.validFor + paramsSeparator + ctrl.ExcludeForIds.join(','));
            }
            ctrl.filters.forEach((filter) => {
                if (filter.type === 'filterTotalPrice') {
                    filtersParams.push(
                        filter.type +
                            paramsSeparator +
                            filter.typeOfComparison +
                            paramsSeparator +
                            (filter.typeOfComparison !== 'less' ? filter.fromTotalPrice : '') +
                            paramsSeparator +
                            (filter.typeOfComparison !== 'more' ? filter.toTotalPrice : '') +
                            paramsSeparator +
                            filter.currency,
                    );
                }
                if (filter.type === 'filterCost') {
                    filtersParams.push(
                        filter.type +
                            paramsSeparator +
                            filter.typeOfComparison +
                            paramsSeparator +
                            (filter.typeOfComparison !== 'less' ? filter.fromCost : '') +
                            paramsSeparator +
                            (filter.typeOfComparison !== 'more' ? filter.toCost : '') +
                            paramsSeparator +
                            filter.currency,
                    );
                }
                if (filter.type === 'filterWeight') {
                    filtersParams.push(
                        filter.type +
                            paramsSeparator +
                            filter.typeOfComparison +
                            paramsSeparator +
                            (filter.typeOfComparison !== 'less' ? filter.fromWeight : '') +
                            paramsSeparator +
                            (filter.typeOfComparison !== 'more' ? filter.toWeight : ''),
                    );
                }
                return null;
            });

            return filtersParams.join(ctrl.formData.ActionsAndFilersSeparator);
        };

        ctrl.loadFilters = function (filtersParamsString) {
            if (!filtersParamsString) {
                return;
            }
            filtersParamsString.split(ctrl.formData.ActionsAndFilersSeparator).forEach((filterStr) => {
                if (!filterStr) {
                    return;
                }

                const filterParams = filterStr.split(ctrl.formData.ParametersSeparator);
                if (filterParams[0] === 'allShipping') {
                    ctrl.validFor = filterParams[0];
                } else if (filterParams[0] === 'byType') {
                    ctrl.validFor = filterParams[0];
                    ctrl.ValidForTypes = filterParams[1].split(',');
                } else if (filterParams[0] === 'byId') {
                    ctrl.validFor = filterParams[0];
                    ctrl.ValidForIds = filterParams[1].split(',').map((item) => parseFloat(item));
                } else if (filterParams[0] === 'excludeByType') {
                    ctrl.validFor = filterParams[0];
                    ctrl.ExcludeForTypes = filterParams[1].split(',');
                } else if (filterParams[0] === 'excludeById') {
                    ctrl.validFor = filterParams[0];
                    ctrl.ExcludeForIds = filterParams[1].split(',').map((item) => parseFloat(item));

                    //------------
                } else if (filterParams[0] === 'filterTotalPrice') {
                    ctrl.filters.push({
                        type: filterParams[0],
                        typeOfComparison: filterParams[1],
                        fromTotalPrice: parseFloat(filterParams[2]),
                        toTotalPrice: parseFloat(filterParams[3]),
                        currency: parseFloat(filterParams[4]),
                    });
                } else if (filterParams[0] === 'filterCost') {
                    ctrl.filters.push({
                        type: filterParams[0],
                        typeOfComparison: filterParams[1],
                        fromCost: parseFloat(filterParams[2]),
                        toCost: parseFloat(filterParams[3]),
                        currency: parseFloat(filterParams[4]),
                    });
                } else if (filterParams[0] === 'filterWeight') {
                    ctrl.filters.push({
                        type: filterParams[0],
                        typeOfComparison: filterParams[1],
                        fromWeight: parseFloat(filterParams[2]),
                        toWeight: parseFloat(filterParams[3]),
                    });
                } else {
                    ctrl.filters.push({
                        type: filterParams[0],
                    });
                }
            });
        };

        ctrl.getEditorsParamsString = function () {
            const paramsSeparator = ctrl.formData.ParametersSeparator;
            const editorsParams = [];
            ctrl.actions.forEach((action) => {
                if (action.type === 'fixedCost') {
                    editorsParams.push(action.type + paramsSeparator + action.cost + paramsSeparator + action.currency);
                    return;
                }
                if (action.type === 'switchOff') {
                    editorsParams.push(action.type);
                    return;
                }
                if (action.type === 'increaseCost') {
                    editorsParams.push(
                        action.type + paramsSeparator + action.percents + paramsSeparator + action.cost + paramsSeparator + action.currency,
                    );
                    return;
                }
                if (action.type === 'reduceCost') {
                    editorsParams.push(
                        action.type + paramsSeparator + action.percents + paramsSeparator + action.cost + paramsSeparator + action.currency,
                    );
                    return;
                }
                if (action.type === 'increaseCostByOrderSum') {
                    editorsParams.push(action.type + paramsSeparator + action.percents);
                    return;
                }
                if (action.type === 'reduceCostByOrderSum') {
                    editorsParams.push(action.type + paramsSeparator + action.percents);
                    return;
                }

                editorsParams.push(action.type);
            });

            return editorsParams.join(ctrl.formData.ActionsAndFilersSeparator);
        };

        ctrl.loadEditors = function (editorsParamsString) {
            if (!editorsParamsString) {
                return;
            }

            editorsParamsString.split(ctrl.formData.ActionsAndFilersSeparator).forEach((actionStr) => {
                if (!actionStr) {
                    return;
                }

                const actionParams = actionStr.split(ctrl.formData.ParametersSeparator);
                if (actionParams[0] === 'fixedCost') {
                    ctrl.actions.push({ type: actionParams[0], cost: parseFloat(actionParams[1]), currency: parseFloat(actionParams[2]) });
                } else if (actionParams[0] === 'switchOff') {
                    ctrl.actions.push({ type: actionParams[0] });
                } else if (actionParams[0] === 'increaseCost') {
                    ctrl.actions.push({
                        type: actionParams[0],
                        percents: parseFloat(actionParams[1]),
                        cost: parseFloat(actionParams[2]),
                        currency: parseFloat(actionParams[3]),
                    });
                } else if (actionParams[0] === 'reduceCost') {
                    ctrl.actions.push({
                        type: actionParams[0],
                        percents: parseFloat(actionParams[1]),
                        cost: parseFloat(actionParams[2]),
                        currency: parseFloat(actionParams[3]),
                    });
                } else if (actionParams[0] === 'increaseCostByOrderSum') {
                    ctrl.actions.push({
                        type: actionParams[0],
                        percents: parseFloat(actionParams[1]),
                    });
                } else if (actionParams[0] === 'reduceCostByOrderSum') {
                    ctrl.actions.push({
                        type: actionParams[0],
                        percents: parseFloat(actionParams[1]),
                    });
                } else {
                    ctrl.actions.push({ type: actionParams[0] });
                }
            });
        };

        ctrl.addAction = function () {
            ctrl.actions.push({ type: 'fixedCost' });
        };

        ctrl.removeAction = function (index) {
            ctrl.actions.splice(index, 1);
            // ctrl.onChange();
        };

        ctrl.addFilter = function () {
            ctrl.filters.push({ type: 'filterTotalPrice' });
        };

        ctrl.removeFilter = function (index) {
            ctrl.filters.splice(index, 1);
            // ctrl.onChange();
        };
    };

    ModalShippingRulesCtrl.$inject = ['$uibModalInstance', '$http', 'toaster', '$translate'];

    ng.module('uiModal').controller('ModalShippingRulesCtrl', ModalShippingRulesCtrl);
})(window.angular);
