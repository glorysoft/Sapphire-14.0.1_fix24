import pointDeliveryTemplate from './templates/pointDelivery.html';
(function (ng) {
    

    const PointDeliveryMethodCtrl = function ($http, toaster) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.emptyString = '';
        };
        ctrl.addPoint = function (point) {
            if (!point) {
                return;
            }
            ctrl.points.push(point);
            ctrl.updatePoints();
        };
        ctrl.addWarehouses = function (warehouse) {
            if (!warehouse) {
                return;
            }
            const point = {
                PointX: 0.0,
                PointY: 0.0,
                WarehouseId: warehouse.warehouseId,
                Address: warehouse.warehouseName,
            };
            ctrl.points.push(point);
            ctrl.updatePoints();
        };
        ctrl.editPoint = function (newPoint, oldPoint) {
            if (!newPoint || !oldPoint) {
                return;
            }
            const index = ctrl.points.indexOf(oldPoint);
            if (index !== -1) {
                ctrl.points[index] = newPoint;
                ctrl.updatePoints();
            }
        };
        ctrl.deletePoint = function (item) {
            const index = ctrl.points.indexOf(item);
            if (index !== -1) {
                ctrl.points.splice(index, 1);
                ctrl.updatePoints();
            }
        };
        ctrl.updatePoints = function () {
            ctrl.update = true;
        };
        ctrl.sortableOptions = {
            containment: '#pointDeliverySortingContainer',
            scrollableContainer: '#pointDeliverySortingContainer',
            containerPositioning: 'relative',
            accept (sourceItemHandleScope, destSortableScope) {
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
            },
            orderChanged (event) {
                ctrl.updatePoints();
            },
        };
    };
    PointDeliveryMethodCtrl.$inject = ['$http', 'toaster'];
    ng.module('shippingMethod')
        .controller('PointDeliveryMethodCtrl', PointDeliveryMethodCtrl)
        .component('pointDelivery', {
            templateUrl: pointDeliveryTemplate,
            controller: 'PointDeliveryMethodCtrl',
            bindings: {
                onInit: '&',
                methodId: '@',
                points: '<?',
                warehousesActive: '<?',
            },
        });
})(window.angular);
