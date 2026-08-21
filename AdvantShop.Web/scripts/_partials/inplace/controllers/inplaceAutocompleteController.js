/* @ngInject */
function InplaceAutocompleteCtrl($compile, $http, $scope, domService, inplaceService, toaster, $translate) {
    const ctrl = this;
    let container,
        isRemoveStaticContainer = false;

    ctrl.$onInit = function () {
        ctrl.autocompleteParams = ctrl.autocompleteParams();
        ctrl.inplaceParams = ctrl.inplaceParams();
    };

    ctrl.active = function () {
        ctrl.isShow = true;
    };

    ctrl.save = function () {
        if (ctrl.startContent !== ctrl.value) {
            inplaceService
                .save('inplaceeditor/propertyupdate', angular.extend(ctrl.inplaceParams, {content: ctrl.value}))
                .then((response) => {
                    const data = response.data;

                    if (data.result === true) {
                        toaster.pop('success', $translate.instant('Js.Inplace.PropertyHasBeenUpdate'));

                        if (data.obj) {
                            angular.extend(ctrl.inplaceParams, data.obj);
                        }

                        ctrl.startContent = ctrl.value;
                    } else {
                        toaster.pop('error', $translate.instant('Js.Inplace.ErrorPropertyUpdate'));
                    }
                })
                .catch(() => {
                    toaster.pop('error', $translate.instant('Js.Inplace.ErrorPropertyUpdate'));
                })
                .finally(() => {
                    ctrl.isShow = false;
                });
        }
    };

    ctrl.cancel = function () {
        ctrl.isShow = false;
        ctrl.value = ctrl.startContent;
    };

    ctrl.autocompleteApply = function (_value, obj) {
        ctrl.inplaceParams.propertyValueId = obj?.Key ?? null;
    };

    ctrl.delete = function (event) {
        let rowDelete;

        if (ctrl.inplaceAutocompleteSelectorBlock) {
            rowDelete = domService.closest(event.target, ctrl.inplaceAutocompleteSelectorBlock);
        }

        if (rowDelete) {
            rowDelete.parentNode.removeChild(rowDelete);
        }

        ctrl.value = null;

        inplaceService.save('inplaceeditor/propertydelete', angular.extend(ctrl.inplaceParams, {content: ctrl.value})).finally(() => {
            ctrl.isShow = false;
            toaster.pop('success', $translate.instant('Js.Inplace.PropertyHasBeenDelete'));

            ctrl.getPropertiesHtml(ctrl.inplaceParams.productId).then((properties) => {
                ctrl.generate(properties);
            });
        });
    };

    ctrl.getPropertiesHtml = function (productId) {
        return $http
            .get('/product/productproperties', {
                params: {productId, renderInplaceBlock: false, rnd: Math.random()},
            })
            .then((response) => response.data);
    };

    ctrl.generate = function (html) {
        let containerStatic;

        if (isRemoveStaticContainer === false) {
            //remove container which rendered on page load
            containerStatic = document.getElementById('properties');
            containerStatic.parentNode.removeChild(containerStatic);
            isRemoveStaticContainer = true;
        }

        container ||= document.getElementById('inplacePropertiesNewContainer');
        container.innerHTML = html;
        $compile(container)($scope);
    };
}

export default InplaceAutocompleteCtrl;
