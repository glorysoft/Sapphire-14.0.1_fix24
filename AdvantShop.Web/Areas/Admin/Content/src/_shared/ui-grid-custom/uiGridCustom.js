import uiGridCustomFilterMobileTemplate from './templates/ui-grid-custom-filter--mobile.html';

//TO DO: remove attribute data-e2e-col-index
const UiGridCustomCtrl = /* @ngInject */ function (
    $element,
    $document,
    $interpolate,
    $location,
    $scope,
    $timeout,
    $q,
    $window,
    $locale,
    uiGridConstants,
    i18nService,
    uiGridCustomService,
    uiGridCustomParamsConfig,
    toaster,
    domService,
    $translate,
    $transclude,
    gridUtil,
    INPLACE_TYPES,
) {
    const ctrl = this,
        gridApiReady = $q.defer(),
        selectionCustomReady = $q.defer(),
        historyItems = [],
        paramsOnFirstInit = {};

    let isFirstPageLoad = true,
        locationWatch;

    // eslint-disable-next-line complexity
    ctrl.$onInit = function () {
        ctrl.onApplyAllErrorList = [];
        ctrl.firstLoading = true;
        ctrl.isProcessing = false;
        ctrl.overrideControlExist = false;

        if (uiGridCustomService.validateId(ctrl.gridUniqueId) === false) {
            throw new Error(`Invalid value "gridUniqueId"${ctrl.gridUniqueId ? `: ${ctrl.gridUniqueId}` : ''}`);
        }

        ctrl.isMobile = $document[0].documentElement.classList.contains('mobile-version') || window.matchMedia('(max-width: 768px)').matches;

        if (ctrl.isMobile && ctrl.gridOptions.columnDefs != null) {
            ctrl.useInSwipeBlock = ctrl.findBlockForSwipeLine(ctrl.gridOptions.columnDefs);
        }

        ctrl.searchAutofocus = ctrl.gridFilterSearchAutofocus;

        if (ctrl.isMobile === true) {
            ctrl.overrideControlExist = $transclude.isSlotFilled('overrideControl');
            ctrl.overrideHeaderControlExist = $transclude.isSlotFilled('overrideHeaderControl');
            ctrl.gridFilterTemplateUrl = uiGridCustomFilterMobileTemplate;
            ctrl.gridFilterHiddenTotalItemsCount = true;
            ctrl.searchAutofocus = false;
            ctrl.gridOptions.showHeader = ctrl.overrideHeaderControlExist;
        }

        i18nService.setCurrentLang($locale.id.split('-')[0]);
        uiGridCustomService.addInStorage(ctrl.gridUniqueId);

        $element.on('$destroy', () => {
            uiGridCustomService.removeFromStorage(ctrl.gridUniqueId);

            ctrl.locationWatchUnreg();

            $location.search(ctrl.gridUniqueId, null);

            $element.off();
            $scope.$destroy();
        });

        const optionsFromStorage = ctrl.getDataItemFromStorage();

        if (optionsFromStorage != null) {
            if (optionsFromStorage.sorting != null) {
                const searchName = optionsFromStorage.sorting.toLowerCase();

                for (let i = 0, len = ctrl.gridOptions.columnDefs.length; i < len; i++) {
                    if (ctrl.gridOptions.columnDefs[i].name.toLowerCase() === searchName) {
                        ctrl.gridOptions.columnDefs[i].sort ??= {};
                        ctrl.gridOptions.columnDefs[i].sort.direction = optionsFromStorage.sortingType;
                        break;
                    }
                }
            }

            if (optionsFromStorage.paginationPageSize != null) {
                angular.extend(ctrl.gridOptions, {
                    paginationPageSize: optionsFromStorage.paginationPageSize,
                });
            }

            if (optionsFromStorage.enableHiding != null) {
                const keysColumns = Object.keys(optionsFromStorage.enableHiding);
                let column;
                for (let j = 0, lenJ = keysColumns.length; j < lenJ; j++) {
                    column = ctrl.gridOptions.columnDefs.filter((col) => col.name === keysColumns[j]);

                    if (column.length === 1) {
                        column[0].visible = optionsFromStorage.enableHiding[keysColumns[j]];
                    }
                }
            }
        }

        ctrl._params = angular.extend(
            {},
            uiGridCustomParamsConfig,
            ctrl.gridParams,
            {
                paginationCurrentPage: ctrl.gridOptions.paginationCurrentPage > 0 ? ctrl.gridOptions.paginationCurrentPage : 1,
                paginationPageSize: ctrl.gridOptions.paginationPageSize,
            },
            optionsFromStorage,
        );

        ctrl.gridFilterEnabled = ctrl.gridFilterEnabled != null ? ctrl.gridFilterEnabled : true;
        ctrl.gridPaginationEnabled = ctrl.gridPaginationEnabled != null ? ctrl.gridPaginationEnabled : true;
        ctrl.gridSelectionEnabled = ctrl.gridSelectionEnabled != null ? ctrl.gridSelectionEnabled : true;

        ctrl.gridEmptyText = ctrl.gridEmptyText != null ? ctrl.gridEmptyText : $translate.instant('Admin.Js.GridCustom.NoWritingsFound');

        ctrl.colDefsWithMediaQueries = ctrl.findColDefsWithMediaQueries();
        if (ctrl.colDefsWithMediaQueries != null) {
            ctrl.processColDefByMediaQueries($window.innerWidth, ctrl.colDefsWithMediaQueries);
            ctrl.updateParameterEnableHiding(ctrl.gridOptions.columnDefs);
        }

        const oltherOnRegisterApi =
            ctrl.gridOptions.onRegisterApi ??
            function () {
                /* empty */
            };

        ctrl.gridOptions.onRegisterApi = function (gridApi) {
            oltherOnRegisterApi(gridApi);
            ctrl.bindGridApi(gridApi);
        };

        ctrl.optionsFromUrl();

        if (!ctrl.gridOptions?.rowEntitySave) {
            ctrl.gridOptions.saveRowIdentity = function (rowEntity) {
                if (ctrl.gridRowIdentificator != null) {
                    return rowEntity[ctrl.gridRowIdentificator];
                }
                return ctrl.defaultRowEntitySave(rowEntity);
            };
        }

        return $q.when(ctrl.gridOnPreinit != null ? ctrl.gridOnPreinit({ grid: ctrl }) : null).then(() => {
            ctrl.addHistoryItem();

            return ctrl
                .fetchData()
                .then(() => {
                    isFirstPageLoad = false;

                    if (ctrl.gridOnInit != null) {
                        ctrl.gridOnInit({ grid: ctrl });
                    }

                    paramsOnFirstInit.gridOptions = angular.copy(ctrl.gridOptions);
                    paramsOnFirstInit._params = angular.copy(ctrl._params);

                    return ctrl;
                })
                .then(() => {
                    if (ctrl.overrideControlExist !== true && ctrl.isMobile !== true && ctrl.colDefsWithMediaQueries != null) {
                        ctrl.addListenerForColDefsMediaQueries(ctrl.colDefsWithMediaQueries);
                    }
                });
        });
    };

    ctrl.update = function () {
        ctrl.optionsFromUrl();

        return $q.when(ctrl.gridOnPreinit != null ? ctrl.gridOnPreinit({ grid: ctrl }) : null).then(() =>
            ctrl.fetchData(true).then(() => {
                isFirstPageLoad = false;

                if (ctrl.gridOnInit != null) {
                    ctrl.gridOnInit({ grid: ctrl });
                }

                return ctrl;
            }),
        );
    };

    ctrl.locationWatch = function () {
        if (locationWatch != null) {
            locationWatch();
        }

        locationWatch = $scope.$on('$locationChangeSuccess', () => {
            const newParams = JSON.stringify($location.search()[ctrl.gridUniqueId]);

            if (ctrl.getLastHistoryItem() !== newParams) {
                //$timeout(function () {

                if (newParams == null) {
                    ctrl.gridOptions = paramsOnFirstInit.gridOptions;
                    ctrl._params = paramsOnFirstInit._params;
                }

                ctrl.backHistory();

                ctrl.update();
                //}, 100);
            }
        });
    };

    ctrl.addHistoryItem = function (item) {
        if (historyItems.indexOf(item) === -1) {
            historyItems.push(item);
        }

        return item;
    };

    ctrl.backHistory = function () {
        historyItems.splice(-1, 1);
    };

    ctrl.getLastHistoryItem = function () {
        return historyItems.length > 0 ? historyItems.slice(-1)[0] : historyItems[0];
    };

    ctrl.locationWatchUnreg = () => locationWatch && locationWatch();

    ctrl.setParamsByUrl = function (notUpdate) {
        if (isFirstPageLoad === false && ctrl.gridPreventStateInHash !== true) {
            uiGridCustomService.setParamsByUrl(ctrl.gridUniqueId, ctrl._params);
        } else if (isFirstPageLoad === false && ctrl.gridPreventStateInHash === true) {
            if (notUpdate === null || typeof notUpdate === 'undefined' || notUpdate === false) {
                ctrl.update();
            }
        }
    };

    ctrl.fetchData = function (ignoreHistory) {
        ctrl.locationWatchUnreg();

        ctrl.setStateProcess(true);

        const defer = $q.defer();

        if (ctrl.gridUrl != null && ctrl.gridUrl.length > 0) {
            uiGridCustomService
                .getData(ctrl.gridUrl, uiGridCustomService.convertToServerParams(ctrl._params))
                .then((result) => {
                    defer.resolve(result);
                })
                .catch((response) => {
                    defer.reject(response);
                });
        } else {
            defer.resolve(ctrl.gridOptions);
        }

        return defer.promise
            .then((result) =>
                ctrl.gridOptions.paginationCurrentPage > result.TotalPageCount && result.TotalPageCount !== 0
                    ? ctrl.paginationChange(result.TotalPageCount, ctrl.gridOptions.paginationPageSize, ctrl.gridOptions.paginationPageSizes)
                    : result,
            )
            .then((result) => {
                angular.extend(ctrl.gridOptions, uiGridCustomService.convertToClientParams(ctrl._params, true), result);

                gridApiReady.promise.then(ctrl.checkSelection).then(() => {
                    $timeout(() => {
                        ctrl.restoreState(true);
                    }, 0);
                });

                ctrl.firstLoading = false;

                if (ctrl.gridOnFetch != null) {
                    ctrl.gridOnFetch({ grid: ctrl });
                }

                return result;
            })
            .then((result) => {
                if (ctrl.gridSelectionEnabled === true && ctrl.isMobile === false) {
                    return selectionCustomReady.promise.then(() => ctrl.selectionSelectItemsFromOutside(result));
                }
                return result;
            })
            .catch((error) => {
                if (error.status !== -1) {
                    ctrl.gridOptions.data = [];
                    toaster.error($translate.instant('Admin.Js.GridCustom.ErrorWhileLoadingData'));
                    ctrl.error = $translate.instant('Admin.Js.GridCustom.ErrorWhileLoadingData');
                }

                return error;
            })
            .finally(() => {
                ctrl.setStateProcess(false);
                const searchParams = $location.search();
                const gridSearch = searchParams != null ? searchParams[ctrl.gridUniqueId] : null;
                if (
                    gridSearch != null &&
                    Object.keys(gridSearch).length > 0 &&
                    ignoreHistory !== true &&
                    ctrl.getLastHistoryItem() !== JSON.stringify(gridSearch)
                ) {
                    ctrl.addHistoryItem(JSON.stringify(gridSearch));
                }

                setTimeout(() => {
                    ctrl.locationWatch();
                }, 0);
            });
    };

    //#region filter
    ctrl.filterInit = function (filter) {
        ctrl.filter = filter;
        if (ctrl.gridOnFilterInit != null) {
            ctrl.gridOnFilterInit({ filter });
        }
    };

    ctrl.filterApply = function (params) {
        if (angular.isArray(params) === false) {
            throw new Error('Parameter "params" should be array');
        }

        for (let i = 0, len = params.length; i < len; i++) {
            ctrl._params[params[i].name] = params[i].value;
        }

        ctrl.gridOptions.paginationCurrentPage = 1;
        ctrl._params.paginationCurrentPage = 1;

        ctrl.setParamsByUrl();
    };

    ctrl.filterRemove = function (name, item) {
        if (item.filter.type === 'range') {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete ctrl._params[item.filter.rangeOptions.from.name];
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete ctrl._params[item.filter.rangeOptions.to.name];
        }
        if (item.filter.type === 'datetime') {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete ctrl._params[item.filter.datetimeOptions.from.name];
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete ctrl._params[item.filter.datetimeOptions.to.name];
        } else if (item.filter.type === 'date') {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete ctrl._params[item.filter.dateOptions.from.name];
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete ctrl._params[item.filter.dateOptions.to.name];
        } else if (item.filter.type === 'time') {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete ctrl._params[item.filter.timeOptions.from.name];
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete ctrl._params[item.filter.timeOptions.to.name];
        } else {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete ctrl._params[name];
        }

        ctrl.gridOptions.paginationCurrentPage = 1;
        ctrl._params.paginationCurrentPage = 1;

        ctrl.setParamsByUrl();
    };
    //#endregion

    //#region selection

    ctrl.selectionSelectItemsFromOutside = function (result) {
        return $timeout(() => {
            //if (ctrl.selectionCustom != null && (ctrl.gridOptions.data == null || ctrl.gridOptions.data.length === 0)) {
            //    ctrl.selectionCustom.clearSelectedRows();
            //} else {

            result.data.forEach((rowEntity) => {
                if (
                    ctrl.gridSelectionItemsSelectedFn({
                        rowEntity,
                    })
                ) {
                    ctrl.gridApi.selection.selectRow(rowEntity);
                }
            });

            //result.data.filter(function (rowEntity) {
            //    return ctrl.gridSelectionItemsSelectedFn({ rowEntity: rowEntity });
            //})
            //    .forEach(function (item) {
            //        ctrl.gridApi.selection.selectRow(item);
            //    });
            ctrl.selectionOnChange(ctrl.gridApi.selection.getSelectedGridRows());
            //}

            return result;
        }, 100);
    };

    ctrl.selectionOnInit = function (selectionCustom) {
        ctrl.selectionCustom = selectionCustom;
        if (ctrl.gridSelectionOnInit != null) {
            ctrl.gridSelectionOnInit({ selectionCustom });
        }

        if (
            ctrl.gridOptions.data == null ||
            (ctrl.gridOptions.data.length === 0 && ctrl.gridApi.core.getVisibleRows(ctrl.gridApi.grid).length === 0)
        ) {
            ctrl.selectionCustom.clearSelectedRows();
        } else {
            ctrl.selectionSelectItemsFromOutside(ctrl.gridOptions);
        }
        selectionCustomReady.resolve(selectionCustom);
    };

    ctrl.selectionUpdate = function (response) {
        //ctrl.resetState();
        //ctrl.selectionCustom.clearSelectedRows();

        ctrl.fetchData().then(() => {
            ctrl.setParamsByUrl();

            if (ctrl.gridOptions.data == null || ctrl.gridOptions.data.length === 0) {
                ctrl.selectionCustom.clearSelectedRows();
            }
        });

        if (response != null && response.data.result === false) {
            if (response.data.errors != null && response.data.errors.length > 0) {
                response.data.errors.forEach((item) => {
                    toaster.error(item);
                });
            }
        }

        if (ctrl.gridSelectionMassApply != null) {
            ctrl.gridSelectionMassApply();
        }
    };

    ctrl.checkSelection = function () {
        if (!ctrl.selectionCustom) {
            return $q.resolve(false);
        }

        const defer = $q.defer();

        ctrl.selectionCustom.calcTotalItemsSelected();

        if (ctrl.selectionCustom.getIsSelectedAll() === true) {
            return $timeout(() => {
                //ctrl.gridApi.selection.selectAllRows();

                const rows = ctrl.gridApi.core.getVisibleRows(ctrl.gridApi.grid);

                if (rows != null && rows.length > 0) {
                    rows.forEach((item) => {
                        item.isSelected =
                            ctrl.selectionCustom.unselectedRows.sizeItem() > 0 ? ctrl.selectionCustom.indexOfUnselected(item.entity) === -1 : true;
                    });

                    ctrl.saveInStorageRows(rows);
                } else {
                    ctrl.selectionCustom.clearSelectedRows();
                }

                defer.resolve(true);
            });
        }

        defer.resolve(true);

        return defer.promise;
    };

    ctrl.selectionOnChange = function (rows) {
        ctrl.saveInStorageRows(rows);

        if (ctrl.gridSelectionOnChange != null) {
            ctrl.gridSelectionOnChange({ rows });
        }
    };

    //#endregion

    ctrl.saveInStorageRows = function (rows) {
        let row, rowIdentity;

        for (let i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            rowIdentity = ctrl.gridOptions.saveRowIdentity(row.entity);

            if (
                (ctrl.selectionCustom.getIsSelectedAll() === false || ctrl.selectionCustom.unselectedRows.sizeItem() > 0) &&
                ctrl.storageStates != null &&
                ctrl.storageStates.selection != null &&
                ctrl.storageStates.selection.length > 0
            ) {
                for (let j = 0, lenj = ctrl.storageStates.selection.length; j < lenj; j++) {
                    if (rowIdentity === ctrl.storageStates.selection[j].row) {
                        // eslint-disable-next-line max-depth
                        if (
                            (ctrl.selectionCustom.getIsSelectedAll() === true && ctrl.selectionCustom.indexOfUnselected(row.entity) !== -1) ||
                            (ctrl.selectionCustom.getIsSelectedAll() === false && row.isSelected === false)
                        ) {
                            ctrl.storageStates.selection[j] = null;
                        }
                    }
                }

                for (let kIndex = 0, lenk = ctrl.storageStates.selection.length; kIndex < lenk; kIndex++) {
                    if (ctrl.storageStates.selection[kIndex] == null) {
                        ctrl.storageStates.selection.splice(kIndex, 1);
                    }
                }
            }
        }

        ctrl.saveState();
    };

    ctrl.setSwitchEnabled = function (rowEntity, state, fieldName) {
        const oldValue = rowEntity[fieldName],
            newValue = state;
        rowEntity[fieldName] = state;

        uiGridCustomService
            .applyInplaceEditing(
                ctrl.gridInplaceUrl,
                angular.extend(
                    {},
                    uiGridCustomService.removeDuplicate(rowEntity, ctrl._params),
                    uiGridCustomService.removePropertyDuplicate(rowEntity),
                ),
            )
            .then((data) => {
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.GridCustom.ChangesSaved'));

                    if (ctrl.gridOnInplaceApply != null) {
                        ctrl.gridOnInplaceApply({
                            rowEntity,
                            colDef: { name: fieldName },
                            newValue,
                            oldValue,
                        });
                    }
                } else {
                    toaster.pop(
                        'error',
                        $translate.instant('Admin.Js.GridCustom.Error'),
                        data.error != null ? data.error : $translate.instant('Admin.Js.GridCustom.ErrorWhileSaving'),
                    );
                }
            });
    };

    ctrl.paginationChange = function (paginationCurrentPage, paginationPageSize) {
        ctrl.gridOptions.paginationCurrentPage = paginationCurrentPage;
        ctrl.gridOptions.paginationPageSize = paginationPageSize;

        ctrl._params.paginationCurrentPage = paginationCurrentPage;
        ctrl._params.paginationPageSize = paginationPageSize;

        ctrl.setParamsByUrl(true);

        ctrl.saveDataInStorage({
            paginationPageSize,
        });

        return ctrl.fetchData();
    };

    ctrl.addOverrideControl = function (overrideControl) {
        ctrl.overrideControl = overrideControl;
    };

    ctrl.addOverrideHeaderControl = function (overrideHeaderControl) {
        ctrl.overrideHeaderControl = overrideHeaderControl;
    };

    ctrl.clickRow = function ($event, row, fn, url) {
        if (
            ['a', 'input', 'textarea', 'button'].indexOf($event.target.tagName.toLowerCase()) !== -1 ||
            domService.closest(
                $event.target,
                ['.ui-select-choices-row-inner', '.js-grid-not-clicked', '.ui-select-container', '[data-swipe-line-left]', '[data-swipe-line-right]'],
                $element[0],
            ) != null ||
            $event.target.querySelector('.js-grid-not-clicked') != null
        )
            return;

        if (fn != null) {
            fn($event, row, ctrl);
        }

        if (url != null && url.length > 0) {
            $window.location.assign($interpolate(url)({ row }));
        }
    };

    ctrl.setParams = function (params) {
        angular.extend((ctrl._params ??= {}), uiGridCustomService.convertToClientParams(params));
        if (ctrl.gridPreventStateInHash !== true) {
            uiGridCustomService.setParamsByUrl(ctrl.gridUniqueId, ctrl._params);
        }
    };

    ctrl.clearParams = function () {
        ctrl._params = null;
        uiGridCustomService.clearParams(ctrl.gridUniqueId);
    };

    ctrl.setStateProcess = function (value) {
        ctrl.isProcessing = value;
    };

    ctrl.selectionOnRequestBefore = function () {
        ctrl.setStateProcess(true);
    };

    ctrl.clearSelectionInStorage = function () {
        if (ctrl.storageStates != null && ctrl.storageStates.selection != null) {
            ctrl.storageStates.selection.length = 0;
        }
    };

    //#region state
    ctrl.saveState = function () {
        const saveData = ctrl.gridApi.saveState.save();
        let prop, itemInProp, index;

        ctrl.storageStates ??= {};

        for (const key in saveData) {
            if (Object.hasOwn(saveData, key) === true) {
                prop = saveData[key];

                if (angular.isArray(prop) === true) {
                    for (let i = 0, len = prop.length; i < len; i++) {
                        itemInProp = prop[i];

                        // eslint-disable-next-line max-depth
                        if (ctrl.storageStates[key]) {
                            // eslint-disable-next-line max-depth
                            for (let j = 0, lenj = ctrl.storageStates[key].length; j < lenj; j++) {
                                // eslint-disable-next-line max-depth
                                if (
                                    (ctrl.compareState[key] != null && ctrl.compareState[key](ctrl.storageStates[key][j], itemInProp)) ||
                                    angular.equals(ctrl.storageStates[key][j], itemInProp) === true
                                ) {
                                    index = j;
                                    break;
                                }
                            }
                        } else {
                            ctrl.storageStates[key] = [];
                        }

                        // eslint-disable-next-line max-depth
                        if (index != null && index !== -1) {
                            ctrl.storageStates[key][index] = itemInProp;
                        } else {
                            ctrl.storageStates[key].push(itemInProp);
                        }

                        index = null;
                    }
                } else {
                    ctrl.storageStates[key] = saveData[key];
                }
            }
        }

        return ctrl.storageStates;
    };

    ctrl.restoreState = function (onlySelection) {
        let result;

        if (ctrl.storageStates != null) {
            result = ctrl.gridApi.saveState.restore(null, onlySelection ? { selection: ctrl.storageStates.selection } : ctrl.storageStates);
        }

        return result;
    };

    ctrl.resetState = function () {
        ctrl.storageStates = {};
    };

    ctrl.compareState = {
        selection(obj, otherObj) {
            return obj.row === otherObj.row;
        },
    };
    //#endregion

    ctrl.export = function () {
        uiGridCustomService.export(ctrl.gridUrl, ctrl.getRequestParams());
    };

    ctrl.getRequestParams = function () {
        return uiGridCustomService.convertToServerParams(ctrl._params);
    };

    ctrl.getParams = function () {
        return ctrl._params;
    };

    ctrl.inplaceFetch = function (rowEntity) {
        return uiGridCustomService.applyInplaceEditing(
            ctrl.gridInplaceUrl,
            angular.extend({}, uiGridCustomService.removeDuplicate(rowEntity, ctrl._params), uiGridCustomService.removePropertyDuplicate(rowEntity)),
        );
    };

    ctrl.inplaceSuccess = function (rowEntity, colDef, newValue, oldValue, callback, eventType, deffered, data) {
        if (data.result === true) {
            if (eventType === INPLACE_TYPES.SINGLE) {
                toaster.pop('success', '', $translate.instant('Admin.Js.GridCustom.ChangesSaved'));
            }

            if (data.entity != null) {
                angular.extend(rowEntity, data.entity);
            }

            if (ctrl.gridOnInplaceApply != null) {
                ctrl.gridOnInplaceApply({
                    rowEntity,
                    colDef,
                    newValue,
                    oldValue,
                });
            }

            if (eventType === INPLACE_TYPES.SINGLE && ctrl.gridOnInplaceApplyAll) {
                ctrl.gridOnInplaceApplyAll();
            }

            if (callback != null) {
                callback(rowEntity, colDef, newValue, oldValue);
            }

            deffered?.resolve();
        } else {
            if (data.errors != null) {
                if (eventType === INPLACE_TYPES.MULTIPLE) {
                    for (const error of data.errors) {
                        // eslint-disable-next-line max-depth
                        if (ctrl.onApplyAllErrorList?.some((item) => item === error)) {
                            continue;
                        }
                        ctrl.onApplyAllErrorList.push(error);
                    }
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', $translate.instant('Admin.Js.GridCustom.Error'), error);
                    });
                }
            } else if (eventType === INPLACE_TYPES.MULTIPLE) {
                ctrl.onApplyAllErrorList.push(data.error != null ? data.error : null);
            } else {
                toaster.pop(
                    'error',
                    $translate.instant('Admin.Js.GridCustom.Error'),
                    data.error != null ? data.error : $translate.instant('Admin.Js.GridCustom.ErrorWhileSaving'),
                );
            }
            ctrl.setStateProcess(false);
            deffered?.resolve();
        }
        return data;
    };

    ctrl.bindGridApi = function (gridApi) {
        ctrl.gridApi = gridApi;

        const destroyEditingAfter =
            gridApi.uiGridEditCustom == null
                ? function () {
                      /* empty */
                  }
                : gridApi.uiGridEditCustom.on.change(
                      $scope,
                      (rowEntity, colDef, newValue, oldValue, callback, eventType, deffered, notSendServer) => {
                          let resultBefore;

                          if (ctrl.gridOnInplaceBeforeApply != null) {
                              resultBefore = ctrl.gridOnInplaceBeforeApply({
                                  rowEntity,
                                  colDef,
                                  newValue,
                                  oldValue,
                              });

                              if (resultBefore === false) {
                                  rowEntity[colDef.name] = oldValue;
                                  return;
                              }
                          }

                          if (notSendServer !== true && ctrl.gridInplaceUrl != null && ctrl.gridInplaceUrl.length > 0) {
                              ctrl.inplaceFetch(rowEntity)
                                  .then((data) => {
                                      ctrl.inplaceSuccess(rowEntity, colDef, newValue, oldValue, callback, eventType, deffered, data);
                                  })
                                  .catch((response) => {
                                      toaster.error($translate.instant('Admin.Js.GridCustom.ErrorWhileUpdatingData'));
                                      deffered.reject(response);
                                      return response;
                                  });
                          } else {
                              deffered.resolve();
                          }
                      },
                  );

        const destroySort =
            gridApi.core.on.sortChanged == null
                ? function () {
                      /* empty */
                  }
                : gridApi.core.on.sortChanged($scope, (_grid, sortColumns) => {
                      if (sortColumns.length > 0) {
                          ctrl._params.sorting = sortColumns[0].name;
                          ctrl._params.sortingType = sortColumns[0].sort.direction;
                          ctrl.saveDataInStorage({
                              sorting: sortColumns[0].name,
                              sortingType: sortColumns[0].sort.direction,
                          });
                      } else {
                          delete ctrl._params.sorting;
                          delete ctrl._params.sortingType;
                          ctrl.saveDataInStorage({
                              sorting: null,
                              sortingType: null,
                          });
                      }

                      ctrl.setParamsByUrl();
                  });

        // ROWS RENDER
        if (ctrl.isMobile === false) {
            $scope.$on('uiGridCustomAutoResize', () => {
                if (ctrl.gridApi) {
                    $element.addClass('ui-grid-custom--resize');
                    const prevWidth = ctrl.gridApi.grid.gridWidth;
                    const prevHeight = ctrl.gridApi.grid.gridHeight;
                    const width = gridUtil.elementWidth(ctrl.gridApi.grid.element);
                    const height = gridUtil.elementWidth(ctrl.gridApi.grid.element);

                    if (width > 0 && height > 0) {
                        ctrl.gridApi.grid.gridWidth = width;
                        ctrl.gridApi.grid.gridHeight = height;
                        ctrl.gridApi.grid.queueGridRefresh().then(() => {
                            ctrl.gridApi.core.raise.gridDimensionChanged(prevHeight, prevWidth, height, width);
                            $element.removeClass('ui-grid-custom--resize');
                        });
                    }
                }
            });
        }

        $element.on('$destroy', () => {
            destroyEditingAfter();
            destroySort();
            destroyColumnVisibilityChanged();

            gridApi.grid.appScope.$destroy();
        });

        const destroyColumnVisibilityChanged =
            gridApi.core.on.columnVisibilityChanged == null
                ? function () {
                      /* empty */
                  }
                : gridApi.core.on.columnVisibilityChanged($scope, (changedColumn) => {
                      const storage = ctrl.getDataItemFromStorage();
                      const enableHidingDictionary = storage != null ? storage.enableHiding || {} : {};
                      enableHidingDictionary[changedColumn.colDef.name] = changedColumn.colDef.visible;
                      const params = {
                          enableHiding: enableHidingDictionary,
                      };
                      ctrl.saveDataInStorage(params);

                      if (changedColumn.colDef.visible) {
                          ctrl.setParams(params);
                          ctrl.fetchData();
                      }
                  });

        gridApiReady.resolve(gridApi);
    };

    ctrl.optionsFromUrl = function () {
        const gridParamsByUrl = uiGridCustomService.getParamsByUrl(ctrl.gridUniqueId);

        if (gridParamsByUrl != null) {
            //#region set sorting on page load from url
            if (gridParamsByUrl.sorting != null) {
                for (let i = 0, len = ctrl.gridOptions.columnDefs.length; i < len; i += 1) {
                    if (ctrl.gridOptions.columnDefs[i].name === gridParamsByUrl.sorting) {
                        ctrl.gridOptions.columnDefs[i].sort = {
                            direction: uiGridConstants[gridParamsByUrl.sortingType.toUpperCase()],
                        };
                    } else {
                        delete ctrl.gridOptions.columnDefs[i].sort;
                    }
                }
            }
            //#endregion

            angular.extend(ctrl.gridOptions, uiGridCustomService.convertToClientParams(gridParamsByUrl));
            angular.extend(ctrl._params, uiGridCustomService.convertToClientParams(gridParamsByUrl));
        }
    };

    ctrl.defaultRowEntitySave = function (rowEntity) {
        //эта функция отвечает за генерацию уникального id для строки
        //нам нужно удалить поле $$hashKey в rowEntity, которое добавляет сам ангуляр
        //так как хэш будет каждый раз разный

        //для того чтобы не изменять искомый объект и не ломать логику ангуляра клонируем объект
        const clone = JSON.parse(JSON.stringify(rowEntity));

        //удаляем уникальный хэш
        delete clone.$$hashKey;

        return JSON.stringify(clone);
    };

    ctrl.getKey = function () {
        return `${ctrl.gridKeyStoragePrefix || $window.location.pathname}::${ctrl.gridUniqueId}`;
    };

    ctrl.getDataItemFromStorage = function () {
        return uiGridCustomService.getDataItimFromStorageByKey(ctrl.getKey());
    };

    ctrl.saveDataInStorage = function (data) {
        uiGridCustomService.saveDataInStorage(ctrl.getKey(), data);
    };

    ctrl.hideColumn = function (columnName) {
        ctrl.toggleVisibleColumn(columnName, false);
    };

    ctrl.showColumn = function (columnName) {
        ctrl.toggleVisibleColumn(columnName, true);
    };

    ctrl.toggleVisibleColumn = function (columnName, isVisible) {
        const column = ctrl.gridOptions.columnDefs.find((col) => col.name === columnName);

        if (column != null) {
            column.visible = isVisible;
        }

        if (ctrl.gridApi != null) {
            ctrl.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        }
    };

    ctrl.deleteItem = function (rowEntity) {
        if (ctrl.gridApi != null && ctrl.gridApi.selection != null) {
            ctrl.gridApi.selection.unSelectRow(rowEntity, null);
        }
        return ctrl.fetchData(true).then(() => {
            if (ctrl.gridOnDelete != null) {
                ctrl.gridOnDelete();
            }
        });
    };

    ctrl.checkColVisible = function (visibleValue) {
        let val = null;
        if (typeof visibleValue === 'boolean') {
            val = visibleValue;
        } else if (typeof visibleValue === 'number') {
            val = $window.innerWidth > visibleValue;
        } else if (visibleValue.breakpoint != null) {
            val = $window.innerWidth > visibleValue.breakpoint;
        }

        if (visibleValue.customFn != null) {
            return visibleValue.customFn(val);
        }
        return val;
    };

    ctrl.findColDefsWithMediaQueries = function () {
        const colDefs = ctrl.gridOptions.columnDefs.filter(
            (col) => col.visible != null && (typeof col.visible === 'number' || col.visible.breakpoint != null),
        );
        let mqObj = null;

        if (colDefs.length > 0) {
            mqObj = {};
            let key, isNumber;
            colDefs.forEach((col) => {
                isNumber = typeof col.visible === 'number';

                key = isNumber === true ? col.visible : col.visible.breakpoint;

                mqObj[key] ??= {};
                mqObj[key].cols ??= [];
                mqObj[key].cols.push(col.name);

                if (isNumber === false) {
                    mqObj[key].customFn = col.visible.customFn;
                }
            });
        }

        return mqObj;
    };

    ctrl.processColDefByMediaQueries = function (windowWidth, colDefsMediaQueries) {
        const deferList = [];
        Object.keys(colDefsMediaQueries).forEach((breakpoint) => {
            colDefsMediaQueries[breakpoint].cols.forEach((colName) => {
                const breakpointActive = windowWidth > parseFloat(breakpoint);

                deferList.push(
                    $q
                        .when(
                            colDefsMediaQueries[breakpoint].customFn != null
                                ? colDefsMediaQueries[breakpoint].customFn(breakpointActive)
                                : breakpointActive,
                        )
                        .then((isMatch) => {
                            ctrl.toggleVisibleColumn(colName, isMatch != null ? isMatch : breakpointActive);
                        }),
                );
            });
        });

        return $q.all(deferList);
    };

    ctrl.addListenerForColDefsMediaQueries = function (colDefsMediaQueries) {
        if (colDefsMediaQueries != null) {
            ctrl.processColDefByMediaQueries($window.innerWidth, colDefsMediaQueries).then(() =>
                ctrl.updateParameterEnableHiding(ctrl.gridOptions.columnDefs, () => ctrl.fetchData()),
            );
            const resizeFn = debounce(() => {
                ctrl.processColDefByMediaQueries($window.innerWidth, colDefsMediaQueries).then(() =>
                    ctrl.updateParameterEnableHiding(ctrl.gridOptions.columnDefs, () => ctrl.fetchData()),
                );
            }, 700);

            $window.addEventListener('resize', resizeFn);
        }
    };

    ctrl.updateParameterEnableHiding = function (columnDefs, callback) {
        ctrl._params ??= {};
        ctrl._params.enableHiding ??= {};

        let isVisible, hasChanges;

        for (const col of columnDefs) {
            if (col.enableHiding === true) {
                isVisible = ctrl.checkColVisible(col.visible);
                if (isVisible === true && ctrl._params.enableHiding[col.name] == null) {
                    ctrl._params.enableHiding[col.name] = true;
                    hasChanges = true;
                } else if (isVisible === false && ctrl._params.enableHiding[col.name] != null) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete ctrl._params.enableHiding[col.name];
                    hasChanges = true;
                }
            }
        }

        if (callback != null && hasChanges) {
            callback();
        }
    };

    ctrl.findBlockForSwipeLine = function (columnDefs) {
        return columnDefs.filter((it) => it.useInSwipeBlock);
    };

    ctrl.inplaceApplyAll = function (editableColumns, uiGridCellCustomScopes, row) {
        const promises = [];

        if (ctrl.gridOnInplaceBeforeApplyAll) {
            ctrl.gridOnInplaceBeforeApplyAll();
        }

        editableColumns.forEach((col, i) => {
            const rowEntity = row.entity;
            const fieldName = col.field;
            const newValue = rowEntity[fieldName];
            const promise = uiGridCellCustomScopes[i].uiGridEditCustom.change(rowEntity, col, newValue, INPLACE_TYPES.MULTIPLE, $scope.$ctrl, true);
            promises.push(promise);
        });

        $q.all(promises)
            .then(() => ctrl.inplaceFetch(row.entity))
            .then((data) => {
                editableColumns.forEach((col) => {
                    const rowEntity = row.entity;
                    const fieldName = col.field;
                    const newValue = rowEntity[fieldName];
                    ctrl.inplaceSuccess(rowEntity, col, newValue, undefined, undefined, INPLACE_TYPES.MULTIPLE, undefined, data);
                });
            })
            .then(() => {
                if (ctrl.gridOnInplaceApplyAll) {
                    ctrl.gridOnInplaceApplyAll();
                }

                if (ctrl.onApplyAllErrorList.length) {
                    toaster.pop('error', $translate.instant('Admin.Js.GridCustom.Error'), ctrl.onApplyAllErrorList.join('<br>'));
                    ctrl.onApplyAllErrorList.length = 0;
                } else {
                    toaster.pop('success', '', $translate.instant('Admin.Js.GridCustom.ChangesSaved'));
                }
            });
    };
};

angular
    .module('uiGridCustom', [
        'ui.grid',
        'ui.grid.edit',
        'ui.grid.selection',
        'ui.grid.cellNav',
        'ui.grid.autoResize',
        'ui.grid.grouping',
        'ui.grid.treeView',
        'ui.grid.saveState',
        'uiGridCustomFilter',
        'uiGridCustomPagination',
        'uiGridCustomSelection',
        'uiGridCustomEdit',
        'switchOnOff',
        'toaster',
        'dom',
    ])
    .controller('UiGridCustomCtrl', UiGridCustomCtrl);

function debounce(func, ms) {
    let timer;

    return function (...args) {
        if (timer != null) {
            clearTimeout(timer);
        }

        // eslint-disable-next-line no-invalid-this
        const vm = this;

        timer = setTimeout(() => {
            func.apply(vm, args);
        }, ms);
    };
}
