import productPropertiesTemplate from './productProperties.html';
(function (ng) {
    

    const ProductPropertiesCtrl = function ($http, $filter, $q, $timeout, toaster, $translate, productPropertiesService) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.getCurrentProperties();
            //.then(ctrl.selectProperty);

            ctrl.propertyValuesPage = 0;
            ctrl.propertyValuesSize = 200;
            ctrl.propertyValuesList = [];
            ctrl.pagingForExistPropeties = {};
        };
        ctrl.propertyValueTransform = function (newTag) {
            return {
                Value: newTag,
                isTag: true,
            };
        };
        ctrl.addPropertyValue = function (property, item, model) {
            const params = {
                ProductId: ctrl.productId,
                PropertyId: property.PropertyId,
                PropertyValueId: item.PropertyValueId,
                Value: item.Value,
                IsNew: Boolean(isNaN(parseFloat(item.PropertyValueId)) || parseFloat(item.PropertyValueId) < 1),
            };
            if (
                property.SelectedPropertyValues.filter((child) => child.Value.toLowerCase() === model.Value.toLowerCase()).length > 1
            ) {
                return;
            }
            productPropertiesService.addPropertyValue(params).then((data) => {
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.Product.ChangesSuccessfullySaved'));
                    item.PropertyValueId = data.propertyValueId;
                    model.PropertyValueId = data.propertyValueId;
                } else {
                    toaster.pop('error', '', $translate.instant('Admin.Js.Product.ErrorWhileAddingProperty'));
                }
            });
        };
        ctrl.removePropertyValue = function (propertyId, item, model, groupId) {
            const params = {
                ProductId: ctrl.productId,
                PropertyValueId: item.PropertyValueId,
            };
            ctrl.pagingForExistPropeties[propertyId].page = 0;
            productPropertiesService.removePropertyValue(params).then((data) => {
                if (data.result === true) {
                    toaster.pop('success', '', $translate.instant('Admin.Js.Product.ChangesSuccessfullySaved'));
                    //.then(ctrl.selectProperty);
                }
            });
        };
        ctrl.selectPropertyValue = function ($item, $model) {
            if (ctrl.$selectPropertyValue) {
                ctrl.$selectPropertyValue.search = $model != null ? $model.Value : '';
            }
            ctrl.propertyValuesQ = null;
            ctrl.selectedPropertyValueId = $model != null ? $model.PropertyValueId : null;
        };
        ctrl.getCurrentProperties = function () {
            return productPropertiesService.getCurrentProperties(ctrl.productId).then((data) => {
                if (data != null) {
                    ctrl.categoryName = data.CategoryName;
                    ctrl.groups = data.Groups;
                }
            });
        };
        ctrl.getPropertyValuesByProperty = function (property, q) {
            return productPropertiesService
                .getAllPropertyValues(property.PropertyId, ctrl.propertyValuesPage, ctrl.propertyValuesSize, q)
                .then((data) => (property.PropertyValues =
                        data.DataItems.length > 0
                            ? data.DataItems
                            : [
                                  {
                                      Value: q,
                                  },
                              ]));
        };
        ctrl.getMoreValuesForExistProperty = function (item, size, q) {
            const propertyId = item.PropertyId;
            ctrl.pagingForExistPropeties[propertyId] = ctrl.pagingForExistPropeties[propertyId] || {};
            const currentPage = ctrl.pagingForExistPropeties[propertyId].page || 0;
            const totalPageCount = ctrl.pagingForExistPropeties[propertyId].totalPageCount;
            let newPage;
            if (currentPage >= totalPageCount || ctrl.loadingValuesForExistProperty === true) {
                return $q.resolve();
            }
            if (propertyId != null) {
                newPage = currentPage + 1;
                ctrl.loadingValuesForExistProperty = true;
                return productPropertiesService
                    .getAllPropertyValues(propertyId, newPage, size, q)
                    .then((data) => {
                        if (data.DataItems != null && data.DataItems.length > 0) {
                            item.PropertyValues = (item.PropertyValues != null ? item.PropertyValues.concat(data.DataItems) : data.DataItems).filter(
                                (iteration) => (
                                        item.SelectedPropertyValues == null ||
                                        item.SelectedPropertyValues.length === 0 ||
                                        !item.SelectedPropertyValues.some((child) => child.Value.toLowerCase() === iteration.Value.toLowerCase())
                                    ),
                            );
                            ctrl.pagingForExistPropeties[propertyId].page = newPage;
                            ctrl.pagingForExistPropeties[propertyId].totalPageCount = data.TotalPageCount;
                        }
                        return data;
                    })
                    .finally(() => {
                        ctrl.loadingValuesForExistProperty = false;
                    });
            } 
                return $q.resolve();
            
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
                if (ctrl.selectedPropertyValue == null && ctrl.propertyValuesQ != null && propertyValueInList == null) {
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
        ctrl.closeSelectPropertyExit = function (isOpen, property) {
            if (isOpen === false) {
                ctrl.pagingForExistPropeties[property.PropertyId].page = 0;
                property.PropertyValues.length = 0;
            }
        };
        ctrl.firstCallValuesForExistProperty = function (item, size) {
            ctrl.getMoreValuesForExistProperty(item, size);
        };
        ctrl.trackByPropertyValue = function (propertyValue) {
            return JSON.stringify(propertyValue);
        };
    };
    ProductPropertiesCtrl.$inject = ['$http', '$filter', '$q', '$timeout', 'toaster', '$translate', 'productPropertiesService'];
    ng.module('productProperties', ['ui.select'])
        .controller('ProductPropertiesCtrl', ProductPropertiesCtrl)
        .component('productProperties', {
            templateUrl: productPropertiesTemplate,
            controller: 'ProductPropertiesCtrl',
            bindings: {
                productId: '@',
                isMobileMode: '<?',
                dropDownList: '@',
            },
        });
})(window.angular);
