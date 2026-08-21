(function (ng) {
    

    /* @ngInject */
    const ModalAddRemovePropertyToProductsCtrl = function ($uibModalInstance, $http, toaster, $translate, $q) {
        const ctrl = this;

        ctrl.$onInit = function () {
            const resolve = ctrl.$resolve;
            ctrl.params = resolve.params;
            ctrl.mode = resolve.mode == null || resolve.mode.remove != true ? 'add' : 'remove';
            ctrl.propertiesPage = 0;
            ctrl.propertiesSize = 200;
            ctrl.propertiesTotalPageCount = 0;

            ctrl.propertyValuesPage = 0;
            ctrl.propertyValuesSize = 200;
            ctrl.propertyValuesTotalPageCount = 0;

            ctrl.propertiesList = [];

            ctrl.propertyValuesList = [];
        };

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getMore = function () {
            if (ctrl.propertiesPage > ctrl.propertiesTotalPageCount || ctrl.loadingProperties === true) {
                return $q.resolve();
            }

            ctrl.propertiesPage += 1;
            ctrl.loadingProperties = true;

            ctrl.getAllProperties(ctrl.propertiesPage, ctrl.propertiesSize, ctrl.propertiesQ)
                .then((data) => {
                    ctrl.propertiesList = ctrl.propertiesList.concat(data.DataItems);
                    ctrl.propertiesTotalPageCount = data.TotalPageCount;

                    return data;
                })
                .finally(() => {
                    ctrl.loadingProperties = false;
                });
        };

        ctrl.selectProperty = function ($item, $model) {
            if ($item == null || $model == null) return;

            ctrl.selectedPropertyId = $item.PropertyId;

            ctrl.selectedPropertyValue = null;
            ctrl.selectedPropertyValueId = null;

            ctrl.propertiesQ = null;

            if (ctrl.$selectProperty) {
                ctrl.$selectProperty.search = $model.Name;
            }

            if (ctrl.$selectPropertyValue) {
                ctrl.$selectPropertyValue.search = '';
            }

            ctrl.propertyValuesList.length = 0;

            ctrl.findPropertyValue(ctrl.selectedPropertyId, null);
        };

        ctrl.firstCallProperties = function () {
            ctrl.propertiesPage = 0;
            ctrl.propertiesList = [];
            ctrl.propertiesTotalPageCount = 0;
            ctrl.getMore();
        };

        ctrl.findProperty = function (q, $select) {
            ctrl.$selectProperty = $select;

            ctrl.propertiesQ = q;
            ctrl.propertiesPage = 1;

            if (ctrl.$selectPropertyValue) {
                ctrl.$selectPropertyValue.search = '';
            }

            ctrl.selectedPropertyValue = null;
            ctrl.selectedPropertyValueId = null;

            ctrl.propertyValuesList.length = 0;

            ctrl.getAllProperties(ctrl.propertiesPage, ctrl.propertiesSize, q).then((data) => {
                const hasItems = data.DataItems.length > 0;
                const result = hasItems === true ? data.DataItems : [];
                const qItem = { Name: q };
                let itemFinded;

                if (q != null && q.length > 0) {
                    for (let i = 0, len = data.DataItems.length; i < len; i++) {
                        if (q === data.DataItems[i].Name) {
                            itemFinded = data.DataItems[i];
                        }
                    }
                }

                if (itemFinded != null) {
                    ctrl.selectedProperty = itemFinded;
                    ctrl.selectedPropertyId = itemFinded.PropertyId;
                } else if (q != null && q.length > 0 && ctrl.mode != 'remove') {
                    ctrl.selectedProperty = qItem;
                    ctrl.selectedPropertyId = null;
                    result.push(qItem);
                }

                return (ctrl.propertiesList = result);
            });
        };

        ctrl.closeSelectProperty = function (isOpen) {
            //применяем к модели несуществующее свойство
            let propertyInList;

            if (isOpen == false) {
                if (ctrl.propertiesQ != null && ctrl.propertiesQ.length > 0) {
                    for (let i = 0, len = ctrl.propertiesList.length; i < len; i++) {
                        if (
                            ctrl.propertiesList[i].Name.toLowerCase() === ctrl.propertiesQ.toLowerCase() &&
                            (ctrl.selectedProperty != null ? ctrl.selectedProperty === ctrl.propertiesList[i] : true)
                        ) {
                            propertyInList = ctrl.propertiesList[i];
                            break;
                        }
                    }
                }

                if (ctrl.selectedProperty == null && ctrl.propertiesQ != null && propertyInList == null && ctrl.mode != 'remove') {
                    ctrl.selectedProperty = {
                        Name: ctrl.propertiesQ,
                    };

                    ctrl.propertyValuesList.length = 0;
                }

                if (propertyInList != null) {
                    ctrl.selectedProperty = propertyInList;
                    ctrl.selectedPropertyId = propertyInList.PropertyId;
                }

                ctrl.propertiesPage = 0;
                ctrl.propertiesQ = null;
            }
        };

        ctrl.findPropertyValue = function (propertyId, q, $select) {
            const defer = $q.defer();
            let promise;

            ctrl.$selectPropertyValue = $select;

            ctrl.propertyValuesQ = q;
            ctrl.propertyValuesPage = 1;

            if (propertyId != null) {
                promise = ctrl.getAllPropertyValues(propertyId, ctrl.propertyValuesPage, ctrl.propertyValuesSize, q).then((data) => {
                    const hasItems = data.DataItems.length > 0;
                    const result = hasItems === true ? data.DataItems : [];
                    const qItem = { Value: q };
                    let itemFinded;

                    if (q != null && q.length > 0) {
                        for (let i = 0, len = data.DataItems.length; i < len; i++) {
                            if (q === data.DataItems[i].Value) {
                                itemFinded = data.DataItems[i];
                            }
                        }
                    }

                    if (itemFinded != null) {
                        ctrl.selectedPropertyValue = itemFinded;
                        ctrl.selectedPropertyValueId = itemFinded.PropertyValueId;
                    } else if (q != null && q.length > 0 && ctrl.mode != 'remove') {
                        ctrl.selectedPropertyValue = qItem;
                        ctrl.selectedPropertyValueId = null;
                        result.push(qItem);
                    }

                    return (ctrl.propertyValuesList = result);
                });
            } else {
                ctrl.propertyValuesList = ctrl.mode != 'remove' && q != null && q.length > 0 ? [{ Value: q }] : [];
                promise = defer.promise;
                defer.resolve(ctrl.propertyValuesList);
            }

            return promise;
        };

        ctrl.getMorePropertiesValue = function () {
            if (ctrl.propertyValuesPage > ctrl.propertyValuesTotalPageCount || ctrl.loadingPropertyValues === true) {
                return $q.resolve();
            }

            if (ctrl.selectedProperty != null && ctrl.selectedProperty.PropertyId != null) {
                ctrl.propertyValuesPage += 1;
                ctrl.loadingPropertyValues = true;

                return ctrl
                    .getAllPropertyValues(ctrl.selectedProperty.PropertyId, ctrl.propertyValuesPage, ctrl.propertyValuesSize, ctrl.propertyValuesQ)
                    .then((data) => {
                        ctrl.propertyValuesList = ctrl.propertyValuesList.concat(data.DataItems);
                        ctrl.propertyValuesTotalPageCount = data.TotalPageCount;

                        return data;
                    })
                    .finally(() => {
                        ctrl.loadingPropertyValues = false;
                    });
            } 
                return $q.resolve();
            
        };

        ctrl.selectPropertyValue = function ($item, $model) {
            if (ctrl.$selectPropertyValue) {
                ctrl.$selectPropertyValue.search = $model != null ? $model.Value : '';
            }

            ctrl.propertyValuesQ = null;

            ctrl.selectedPropertyValueId = $model != null ? $model.PropertyValueId : null;
        };

        ctrl.closeSelectPropertyValue = function (isOpen) {
            let propertyValueInList;

            if (isOpen == false) {
                if (ctrl.propertyValuesQ != null && ctrl.propertyValuesQ.length > 0) {
                    for (let i = 0, len = ctrl.propertyValuesList.length; i < len; i++) {
                        if (
                            ctrl.propertyValuesList[i].Value.toLowerCase() === ctrl.propertyValuesQ.toLowerCase() &&
                            (ctrl.selectedPropertyValue != null ? ctrl.selectedPropertyValue === ctrl.propertyValuesList[i] : true)
                        ) {
                            propertyValueInList = ctrl.propertyValuesList[i];
                            break;
                        }
                    }
                }
                //применяем к модели несуществующее свойство
                if (ctrl.selectedPropertyValue == null && ctrl.propertyValuesQ != null && propertyValueInList == null && ctrl.mode != 'remove') {
                    ctrl.selectedPropertyValue = {
                        Value: ctrl.propertyValuesQ,
                    };
                }

                if (propertyValueInList != null) {
                    ctrl.selectedPropertyValue = propertyValueInList;
                    ctrl.selectedPropertyValueId = propertyValueInList.PropertyValueId;
                }

                ctrl.propertyValuesPage = 0;
                ctrl.propertyValuesQ = null;
            }
        };

        ctrl.firstCallPropertyValues = function () {
            ctrl.propertyValuesPage = 0;
            ctrl.propertyValuesList = [];
            ctrl.propertyValuesTotalPageCount = 0;
            ctrl.getMorePropertiesValue();
        };

        ctrl.send = function () {
            const params = {};

            if (ctrl.selectedPropertyId != null) {
                params.SelectedPropertyId = ctrl.selectedPropertyId;
            } else {
                params.SelectedPropertyId = null;
                params.SelectedPropertyName = ctrl.selectedProperty.Name;
            }

            if (ctrl.selectedPropertyId != null && ctrl.selectedPropertyValueId != null) {
                params.SelectedPropertyValueId = ctrl.selectedPropertyValueId;
            } else {
                params.SelectedPropertyValueId = null;
                params.SelectedPropertyValue = ctrl.selectedPropertyValue.Value;
            }

            $http
                .post(
                    ctrl.mode == 'add' ? 'catalog/AddPropertyToProducts' : 'catalog/RemovePropertyFromProducts',
                    ng.extend(ctrl.params || {}, params),
                )
                .then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        toaster.pop(
                            'success',
                            '',
                            ctrl.mode == 'add'
                                ? $translate.instant('Admin.Js.AddRemovePropertyToProducts.PropertyAddedSuccessfully')
                                : $translate.instant('Admin.Js.AddRemovePropertyToProducts.PropertyRemovedSuccessfully'),
                        );
                        $uibModalInstance.close();
                    } else {
                        toaster.pop('error', '', $translate.instant('Admin.Js.AddRemovePropertyToProducts.Error'));
                    }
                });
        };

        ctrl.getAllProperties = function (page, count, q) {
            return $http.get('product/getAllProperties', { params: { page, count, q } }).then((response) => response.data);
        };

        ctrl.getAllPropertyValues = function (propertyId, page, count, q) {
            return $http
                .get('product/getAllPropertyValues', {
                    params: { propertyId, page, count, q },
                })
                .then((response) => response.data);
        };
    };

    ng.module('uiModal').controller('ModalAddRemovePropertyToProductsCtrl', ModalAddRemovePropertyToProductsCtrl);
})(window.angular);
