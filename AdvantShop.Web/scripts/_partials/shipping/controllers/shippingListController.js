/* @ngInject */
function ShippingListCtrl($anchorScroll, $location, $scope, shippingService) {
    const ctrl = this;
    const watchersFn = [];

    $anchorScroll.yOffset = 50;

    ctrl.$onInit = function () {
        ctrl.customClassesByItemId = {};
        ctrl.collapsed = true;
        $scope.$watch('shippingList.items', (newVal, oldValue) => {
            if(newVal !== oldValue && ctrl.selectShipping){
                ctrl.selectedItemIndex = newVal.findIndex(item => item.Id ===  ctrl.selectShipping.Id)
            }
        })
    };


    ctrl.changeShipping = function (shipping, index) {
        if (index != null) {
            ctrl.selectedItemIndex = index;
        }

        ctrl.change({
            shipping,
            newShipping: ctrl.newShipping,
        });
    };

    ctrl.changeShippingControl = function (shipping) {
        for (let i = ctrl.items.length - 1; i >= 0; i--) {
            if (ctrl.items[i] === shipping) {
                ctrl.selectShipping = shipping;
                ctrl.selectedItemIndex = i;
                break;
            }
        }

        ctrl.change({
            shipping,
            customShipping: ctrl.customShipping,
        });
    };

    ctrl.focusEditPrice = function (shipping, index) {
        ctrl.selectShipping = shipping;
        ctrl.selectedItemIndex = index;

        ctrl.focus({
            shipping,
            customShipping: ctrl.customShipping,
        });
    };

    ctrl.toggleVisible = function () {
        if (ctrl.collapsed === true) {
            ctrl.collapsed = false;
        } else {
            ctrl.collapsed = true;

            $location.hash(ctrl.anchor);
            $anchorScroll();
        }
    };

    ctrl.addCallbackOnLoad = function (fn) {
        watchersFn.push(fn);
    };

    ctrl.processCallbacks = function () {
        const params = arguments;
        watchersFn.forEach((fn) => {
            fn(params);
        });
    };

    ctrl.showProgressForItem = function (item) {
        return ctrl.isProgress !== true && item.Template && shippingService.isTemplateReady(item.Template) !== true;
    };

    //#region deliveryInterval

    ctrl.changeDeliveryInterval = function (item, index) {
        if (ctrl.selectShipping.TimeOfDelivery) {
            ctrl.changeShipping(item, index);
        }
    };

    ctrl.changeSoonest = function (item, index) {
        if (!ctrl.selectShipping.Asap) return;

        ctrl.selectShipping.TimeOfDelivery = null;
        ctrl.changeShipping(item, index);
    };

    ctrl.initIntervals = function (item, index) {
        ctrl.showSoonest = ctrl.selectShipping.ShowSoonest;
        if (!ctrl.selectShipping.DateOfDeliveryStr) {
            ctrl.changeShipping(item || ctrl.selectShipping, index);
            ctrl.showSoonest = false
            return;
        }
        const dateArr = ctrl.selectShipping.DateOfDeliveryStr.split('.');
        const selectedDate = new Date(dateArr[2], dateArr[1] - 1, dateArr[0]);
        const dayOfWeek = selectedDate.getDay();
        if (!ctrl.deliveryIntervals || !Object.hasOwn(ctrl.deliveryIntervals, dayOfWeek)) {
            ctrl.intervalsOnSelectedDay = null;
            ctrl.showSoonest = false
            return;
        }
        const dateNow = new Date(ctrl.selectShipping.StartDateTime);
        if (
            dateNow.getDay() != dayOfWeek ||
            dateNow.getDate() != selectedDate.getDate() ||
            dateNow.getMonth() != selectedDate.getMonth() ||
            dateNow.getFullYear() != selectedDate.getFullYear()
        ) {
            ctrl.showSoonest = false;
            ctrl.intervalsOnSelectedDay = ctrl.deliveryIntervals[dayOfWeek];
            if (ctrl.intervalsOnSelectedDay.length == 1) {
                ctrl.selectShipping.TimeOfDelivery = ctrl.intervalsOnSelectedDay[0];
                ctrl.changeShipping(item || ctrl.selectShipping, index);
            } else if (
                ctrl.selectShipping.TimeOfDelivery != null &&
                !ctrl.intervalsOnSelectedDay.some((x) => x == ctrl.selectShipping.TimeOfDelivery)
            ) {
                ctrl.selectShipping.TimeOfDelivery = null;
                ctrl.changeShipping(item || ctrl.selectShipping, index);
            }
            return;
        }
        let countInvalidIntervals = 0;
        let minutes = dateNow.getUTCMinutes() + (ctrl.selectShipping.TimeZoneOffset % 1) * 60;
        let hours = dateNow.getUTCHours() + Math.trunc(ctrl.selectShipping.TimeZoneOffset);
        if (minutes >= 60) {
            minutes -= 60;
            hours++;
        }
        if (hours >= 24) hours -= 24;
        let invalidSelectedTime = true;
        ctrl.deliveryIntervals[dayOfWeek].forEach((interval) => {
            const timeArr = interval.split('-')[0].split(':');
            if (invalidSelectedTime && interval == ctrl.selectShipping.TimeOfDelivery) invalidSelectedTime = false;
            if (hours < timeArr[0] || (hours == timeArr[0] && minutes < timeArr[1])) return;
            if (interval == ctrl.selectShipping.TimeOfDelivery)
                //выбранный интервал уже недоступен
                ctrl.selectShipping.TimeOfDelivery = null;
            countInvalidIntervals++;
        });
        if (invalidSelectedTime) ctrl.selectShipping.TimeOfDelivery = null;
        ctrl.intervalsOnSelectedDay = ctrl.deliveryIntervals[dayOfWeek].slice(countInvalidIntervals);
        if (ctrl.intervalsOnSelectedDay.length == 1) {
            ctrl.selectShipping.TimeOfDelivery = ctrl.intervalsOnSelectedDay[0];
            ctrl.changeShipping(item || ctrl.selectShipping, index);
        }
        ctrl.showSoonest = ctrl.selectShipping.ShowSoonest && ctrl.intervalsOnSelectedDay.length != 0;
    };

    ctrl.parseDeliveryInterval = function () {
        ctrl.deliveryIntervals = {};
        if (ctrl.selectShipping.DeliveryIntervalsStr) {
            ctrl.selectShipping.DeliveryIntervalsStr.split('|').forEach((dayStr) => {
                const arr = dayStr.split('!');
                const day = arr[0];
                const intervals = arr[1].split('&').filter((x) => Boolean(x) && x.length != 0);
                ctrl.deliveryIntervals[day] = intervals || [];
            });
        }
        ctrl.initIntervals();
        ctrl.disabledDates = [
            function (date) {
                return !ctrl.deliveryIntervals || !Object.hasOwn(ctrl.deliveryIntervals, date.getDay());
            },
        ];
    };

    //#endregion
}

export default ShippingListCtrl;
