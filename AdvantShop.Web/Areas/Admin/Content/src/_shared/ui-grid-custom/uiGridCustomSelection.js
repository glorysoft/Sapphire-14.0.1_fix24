/* @ngInject */
const UiGridCustomSelectionCtrl = function($http, $q, $timeout, $element, toaster, $translate) {
    const ctrl = this;

    ctrl.$onInit = function() {
        ctrl.unselectedRows = new SelectionStoragePrivate(ctrl.gridSelectionStoragePrivateId);

        ctrl.totalItemsSelected = 0;

        ctrl.isSelectedAll = false;

        ctrl.storageSelectedRows = [];

        ctrl.calcTotalItemsSelected();

        //var oldFuncRowChange = ctrl.gridApi.selection.on.rowSelectionChanged || function () { },
        //    oldFuncRowChangeBatch = ctrl.gridApi.selection.on.rowSelectionChangedBatch || function () { };

        const destroyEventRowChange =
            ctrl.gridApi.selection == null
                ? function() {
                    /* empty */
                }
                : ctrl.gridApi.selection.on.rowSelectionChanged(null, (row, _event) => {
                    //oldFuncRowChange.apply(this, arguments);

                    let index;
                    const rowEntity = row.entity;

                    if (ctrl.isSelectedAll === true) {
                        //ctrl.gridApi.selection.clearSelectedRows();
                        if (row.isSelected === false) {
                            ctrl.unselectedRows.addItemValue(rowEntity);
                        } else {
                            index = ctrl.indexOfUnselected(rowEntity);

                            if (index !== -1) {
                                ctrl.unselectedRows.deleteItemValue(index);
                            }
                        }
                    }

                    if (ctrl.unselectedRows.sizeItem() === ctrl.gridOptions.totalItems) {
                        ctrl.isSelectedAll = false;
                    }

                    ctrl.toggleInStorage(row, row.isSelected);

                    ctrl.calcTotalItemsSelected();

                    if (ctrl.gridSelectionOnChange != null) {
                        ctrl.gridSelectionOnChange({
                            rows: [row],
                        });
                    }
                });

        const destroyEventRowChangeBatch =
            ctrl.gridApi.selection == null
                ? function() {
                    /* empty */
                }
                : ctrl.gridApi.selection.on.rowSelectionChangedBatch(null, (rows, _event) => {
                    $timeout(() => {
                        //$timeout для получения ctrl.gridApi.selection.getSelectAllState()

                        const isSelectVisibleAll = ctrl.gridApi.selection.getSelectAllState();
                        let indexInUnselected = -1;

                        rows.forEach((item) => {
                            if (item.isSelected === false) {
                                ctrl.gridApi.selection.unSelectRow(item.entity);

                                if (ctrl.isSelectedAll === true) {
                                    if (item.isSelected === false) {
                                        ctrl.unselectedRows.addItemValue(item.entity);
                                    } else {
                                        const index = ctrl.indexOfUnselected(item.entity);

                                        if (index !== -1) {
                                            ctrl.unselectedRows.deleteItemValue(index);
                                        }
                                    }
                                }
                            } else if ((indexInUnselected = ctrl.indexOfUnselected(item.entity)) !== -1) {
                                ctrl.unselectedRows.deleteItemValue(indexInUnselected);
                                indexInUnselected = -1;
                            }
                        });
                        //}

                        if (ctrl.unselectedRows.sizeItem() === ctrl.gridOptions.totalItems) {
                            ctrl.isSelectedAll = false;
                        }

                        ctrl.toggleInStorage(rows, ctrl.isSelectedAll || isSelectVisibleAll || rows[0].isSelected); //rows[0].isSelected - у всех строк при этом событии одинаковое значение

                        ctrl.calcTotalItemsSelected();

                        if (ctrl.gridSelectionOnChange != null) {
                            ctrl.gridSelectionOnChange({
                                rows,
                            });
                        }
                    });
                });

        $element.on('$destroy', () => {
            destroyEventRowChange();
            destroyEventRowChangeBatch();
        });

        //ctrl.$onDestroy = function () {
        //    destroyEventRowChange();
        //    destroyEventRowChangeBatch();
        //};

        if (ctrl.gridSelectionOnInit != null) {
            ctrl.gridSelectionOnInit({ selectionCustom: ctrl });
        }

        //if (ctrl.gridSelectionOnChange != null) {
        //    ctrl.gridSelectionOnChange();
        //}
    };

    ctrl.selectAllRows = function($event) {
        ctrl.unselectedRows.clearItemValue();

        ctrl.isSelectedAll = true;

        ctrl.gridApi.selection.selectAllRows();

        ctrl.addItemInStorage(ctrl.gridApi.selection.getSelectedGridRows());

        ctrl.calcTotalItemsSelected();

        if (ctrl.gridApi.selection.getSelectAllState() === true) {
            ctrl.gridApi.selection.raise.rowSelectionChangedBatch(ctrl.gridApi.selection.getSelectedGridRows(), $event);
        }
    };

    ctrl.clearSelectedRows = function() {
        ctrl.gridApi.selection.clearSelectedRows();

        ctrl.unselectedRows.clearItemValue();

        ctrl.isSelectedAll = false;

        ctrl.clearStorage();

        ctrl.grid.clearSelectionInStorage();

        ctrl.calcTotalItemsSelected();

        //ctrl.gridApi.selection.clearSelectedRows();
    };

    ctrl.select = function(action) {
        const defer = $q.defer();
        let promise = defer.promise;

        if (action.before != null) {
            promise = action.before();
        } else {
            defer.resolve();
        }

        return promise
            .then(() => {
                if (action.url != null) {
                    if (ctrl.gridOnRequestBefore != null) {
                        ctrl.gridOnRequestBefore();
                    }

                    return $http.post(action.url, angular.extend({}, ctrl.gridParams, ctrl.getSelectedParams(action.field))).then((response) => {
                        if (action.after != null) {
                            action.after(response.data);
                        }

                        ctrl.clearStorage();

                        if (ctrl.gridOnAction != null) {
                            ctrl.gridOnAction({ response });
                        }

                        toaster.pop('success', '', $translate.instant('Admin.Js.GridCustom.ChangesSaved'));
                    });
                } else if (action.preset != null) {
                    ctrl.presets[action.preset]();

                    if (ctrl.gridOnAction != null) {
                        ctrl.gridOnAction();
                    }
                }

                return null;
            })
            .catch(() => {
                /* empty */
            });
    };

    ctrl.calcTotalItemsSelected = function() {
        ctrl.totalItemsSelected = ctrl.gridOptions.totalItems - ctrl.unselectedRows.sizeItem();
    };

    ctrl.getSelectedParams = function(actionField) {
        //ctrl.gridApi.selection.getSelectedRows()
        const items = ctrl.isSelectedAll ? ctrl.unselectedRows.getItemValue() : ctrl.getRowsFromStorage(),
            ids = items.map((item) => item[actionField]),
            selectMode = ctrl.isSelectedAll ? 'all' : 'none';
        return angular.extend({}, ctrl.gridParams, { ids, selectMode });
    };

    ctrl.selectionCallGrid = function() {
        if (ctrl.gridOnCallUpdate != null) {
            ctrl.gridOnCallUpdate();
        }
    };

    ctrl.getCountSelectedRows = function() {
        return ctrl.gridApi.selection.getSelectedRows().length;
    };

    ctrl.getIsSelectedAll = function() {
        return ctrl.isSelectedAll;
    };

    ctrl.indexOfUnselected = function(rowEntity) {
        let result = -1;
        const unselectedRowsValue = ctrl.unselectedRows.getItemValue();
        for (let i = 0, len = unselectedRowsValue.length; i < len; i++) {
            if (ctrl.gridOptions.saveRowIdentity(unselectedRowsValue[i]) === ctrl.gridOptions.saveRowIdentity(rowEntity)) {
                result = i;
                break;
            }
        }

        return result;
    };

    ctrl.gridActionWithCallback = function(callback) {
        if (callback != null) {
            callback();
        }

        if (ctrl.gridOnAction != null) {
            ctrl.gridOnAction();
        }
    };

    ctrl.presets = {
        unselectVisible() {
            ctrl.gridApi.selection.clearSelectedRows();
        },
        unselectAll() {
            ctrl.clearSelectedRows();
        },
    };

    //#region storage
    ctrl.addItemInStorage = function(rows) {
        const _rows = angular.isArray(rows) ? rows : rows != null ? [rows] : [];
        let index;

        for (let i = 0, len = _rows.length; i < len; i++) {
            index = ctrl.getIndexRowInStorage(_rows[i]);

            if (index !== -1) {
                ctrl.storageSelectedRows[index] = _rows[i];
            } else {
                ctrl.storageSelectedRows.push(_rows[i]);
            }
        }
    };

    ctrl.removeItemFromStorage = function(rows) {
        const _rows = angular.isArray(rows) ? rows : rows != null ? [rows] : [];
        let index;

        for (let i = 0, len = _rows.length; i < len; i++) {
            index = ctrl.getIndexRowInStorage(_rows[i]);

            if (index !== -1) {
                ctrl.storageSelectedRows.splice(index, 1);
            }
        }
    };

    ctrl.toggleInStorage = function(rows, needAdd) {
        if (needAdd === true) {
            ctrl.addItemInStorage(rows);
        } else {
            ctrl.removeItemFromStorage(rows);
        }
    };

    ctrl.clearStorage = function() {
        ctrl.storageSelectedRows.length = 0;
        //ctrl.gridApi.selection.clearSelectedRows();
    };

    ctrl.getIndexRowInStorage = function(row) {
        let index = -1;

        for (let i = 0, len = ctrl.storageSelectedRows.length; i < len; i++) {
            if (ctrl.gridOptions.saveRowIdentity(ctrl.storageSelectedRows[i].entity) === ctrl.gridOptions.saveRowIdentity(row.entity)) {
                index = i;
                break;
            }
        }

        return index;
    };

    ctrl.getRowsFromStorage = function() {
        return ctrl.storageSelectedRows.map((row) => row.entity);
    };
    //#endregion
};

class SelectionStoragePrivate {
    constructor(identifierFn) {
        this.identifierFn = identifierFn;
        this.storage = new Map();
    }

    addItemValue(value) {
        const item = this.getItemValue() ?? [];
        item.push(value);
        this.storage.set(this.identifierFn(), item);
    }

    getItemValue() {
        if (!this.hasItem()) {
            return [];
        }
        return this.storage.get(this.identifierFn());
    }

    clearItemValue() {
        if (!this.hasItem()) {
            return;
        }
        this.getItemValue().length = 0;
    }

    deleteItemValue(index) {
        const item = this.getItemValue();
        item.splice(index, 1);
        this.storage.set(this.identifierFn(), item);
    }

    sizeItem() {
        if (this.hasItem()) {
            return this.getItemValue().length;
        }
        return 0;
    }

    hasItem() {
        return this.storage.size > 0 && this.storage.has(this.identifierFn());
    }
}

angular.module('uiGridCustomSelection', ['uiModal', 'jsTree.directive']).controller('UiGridCustomSelectionCtrl', UiGridCustomSelectionCtrl);
