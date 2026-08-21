/* @ngInject */
function InplacePropertiesNewCtrl($compile, $http, $scope, $timeout, toaster, inplaceService, $translate) {
    let container,
        isRemoveStaticContainer = false;

    const ctrl = this;

    ctrl.$onInit = function () {
        ctrl.autocompleteValueParams = {
            productId: ctrl.productId,
        };

        ctrl.inplaceParams = {
            productId: ctrl.productId,
        };
    };

    ctrl.save = function () {
        $timeout(() => inplaceService
            .save('inplaceeditor/propertyadd', angular.extend(ctrl.inplaceParams, {name: ctrl.name, value: ctrl.value}))
            .then((response) => {
                if (response.data) {
                    ctrl.name = '';
                    ctrl.value = '';
                    ctrl.form.$setPristine();
                    ctrl.inplaceParams.propertyId = null;
                    ctrl.inplaceParams.propertyValueId = null;
                    toaster.pop('success', $translate.instant('Js.Inplace.PropertyHasBeenAdded'));
                    ctrl.htmlUpdate = true;

                    ctrl.getPropertiesHtml(ctrl.productId).then((properties) => {
                        ctrl.generate(properties);
                    });
                } else {
                    toaster.pop('error', $translate.instant('Js.Inplace.ErrorPropertyAdding'));
                }
            }), 100);
    };

    ctrl.autocompleteNameApply = function (value, obj) {
        if (obj) {
            ctrl.autocompleteValueParams.propertyId = obj.Key;
            ctrl.inplaceParams.propertyId = obj.Key;
        } else {
            ctrl.autocompleteValueParams.propertyId = null;
            ctrl.inplaceParams.propertyId = null;
        }

        ctrl.inplaceParams.name = value;
    };

    ctrl.autocompleteValueApply = function (value, obj) {
        if (obj) {
            ctrl.inplaceParams.propertyValueId = obj.Key;
        } else {
            ctrl.inplaceParams.propertyValueId = null;
        }

        ctrl.inplaceParams.value = value;
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

            if (containerStatic) {
                containerStatic.parentNode.removeChild(containerStatic);
            }

            isRemoveStaticContainer = true;
        }

        container ||= document.getElementById('inplacePropertiesNewContainer');
        container.innerHTML = html;
        $compile(container)($scope);
    };
}

export default InplacePropertiesNewCtrl;
