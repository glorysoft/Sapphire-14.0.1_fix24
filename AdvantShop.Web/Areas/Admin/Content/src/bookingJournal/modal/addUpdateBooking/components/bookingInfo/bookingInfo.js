import bookingInfoTemplate from './bookingInfo.html';
(function (ng) {
    

    const BookingInfoCtrl = function ($http, $q, $translate, toaster, bookingService) {
        const ctrl = this;
        ctrl.MonthFreeDays = {};
        ctrl.$onInit = function () {
            ctrl.bookingInfo.dateTimeMode = 'select';
            ctrl.choiceAffiliates = ctrl.mode === 'add' ? ctrl.params.choiceAffiliates || !ctrl.params.affiliateId : false;
            ctrl.selectDateAndTime(ctrl.params.beginDate, ctrl.params.endDate);
            if (ctrl.mode === 'add') {
                if (ctrl.choiceAffiliates) {
                    ctrl.getAffiliates().then(() => {
                        if (!ctrl.bookingInfo.affiliateId && ctrl.affiliates.length === 1) {
                            ctrl.bookingInfo.affiliateId = ctrl.affiliates[0].value;
                            ctrl.selectAffiliate();
                        }
                    });
                }
                if (ctrl.bookingInfo.affiliateId) {
                    ctrl.selectAffiliate();
                }
            }
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    bookingInfo: ctrl,
                });
            }
        };
        ctrl.fpOptions = {
            dateFormat: 'd.m.Y',
            startDateFormat: 'Y-m-d',
            wrap: true,
            enableTime: false,
            onMonthChange (selectedDates, dateStr, instance) {
                ctrl.calendarMonthYearChange(instance);
            },
            onYearChange (selectedDates, dateStr, instance) {
                ctrl.calendarMonthYearChange(instance);
            },
            onDayCreate (selectedDates, dateStr, instance, dayElem) {
                const key = ctrl.getMonthFreeDaysKey(
                    dayElem.dateObj.getFullYear(),
                    dayElem.dateObj.getMonth(),
                    ctrl.bookingInfo.affiliateId,
                    ctrl.bookingInfo.reservationResourceId,
                );
                if (ctrl.MonthFreeDays[key]) {
                    if (ctrl.MonthFreeDays[key].indexOf(dayElem.dateObj.getDate()) !== -1) {
                        dayElem.className += ' weekend';
                    }
                }
            },
        };
        ctrl.fpBeginEndOptions = {
            dateFormat: 'd.m.Y H:i',
            startDateFormat: 'Y-m-d H:i',
            time_24hr: true,
            wrap: true,
            enableTime: true,
            onMonthChange (selectedDates, dateStr, instance) {
                ctrl.calendarMonthYearChange(instance);
            },
            onYearChange (selectedDates, dateStr, instance) {
                ctrl.calendarMonthYearChange(instance);
            },
            onDayCreate (selectedDates, dateStr, instance, dayElem) {
                const key = ctrl.getMonthFreeDaysKey(
                    dayElem.dateObj.getFullYear(),
                    dayElem.dateObj.getMonth(),
                    ctrl.bookingInfo.affiliateId,
                    ctrl.bookingInfo.reservationResourceId,
                );
                if (ctrl.MonthFreeDays[key]) {
                    if (ctrl.MonthFreeDays[key].indexOf(dayElem.dateObj.getDate()) !== -1) {
                        dayElem.className += ' weekend';
                    }
                }
            },
        };
        ctrl.changeDateTimeMode = function (mode) {
            ctrl.bookingInfo.dateTimeMode = mode;
        };
        ctrl.getAffiliates = function () {
            return $http.get('bookingAffiliate/getAffiliates').then((response) => {
                const data = response.data;
                if (data.result === true) {
                    ctrl.affiliates = data.obj.Affiliates;
                } else {
                    data.errors.forEach((error) => {
                        toaster.pop('error', error);
                    });
                    if (!data.errors) {
                        toaster.pop(
                            'error',
                            $translate.instant('Admin.Js.BookingCategories.Error'),
                            $translate.instant('Admin.Js.BookingJournal.FailedLoadAdditionalData'),
                        );
                    }
                }
            });
        };
        ctrl.callGetBookingForm = function () {
            return ctrl.getBookingForm().then((data) => {
                if (ctrl.flatpickr) {
                    ctrl.flatpickr.jumpToDate(new Date(ctrl.bookingInfo.date));
                }
                if (ctrl.flatpickrBegin) {
                    ctrl.flatpickrBegin.jumpToDate(new Date(ctrl.bookingInfo.beginDate));
                }
                if (ctrl.flatpickrEnd) {
                    ctrl.flatpickrEnd.jumpToDate(new Date(ctrl.bookingInfo.endDate));
                }
                ctrl.flatpickrsRedraw();
                return data;
            });
        };
        ctrl.getBookingForm = function () {
            let selectedDate = null;
            if (ctrl.bookingInfo.date) {
                selectedDate = ctrl.bookingInfo.date;
            }
            return $http
                .get('booking/getBookingFormData', {
                    params: {
                        id: ctrl.bookingInfo.id,
                        affiliateId: ctrl.bookingInfo.affiliateId,
                        selectedReservationResourceId: ctrl.bookingInfo.reservationResourceId,
                        selectedDate,
                    },
                })
                .then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        ctrl.reservationResources = data.obj.ReservationResources;
                        ctrl.bookingInfo.managerId = ctrl.bookingInfo.id ? ctrl.bookingInfo.managerId || 0 : data.obj.CurrentManager || 0;
                        ctrl.managers = data.obj.Managers;
                        ctrl.managers.forEach((x) => {
                            if (x.value === null) {
                                x.value = '0';
                            }
                        });
                        ctrl.bookingInfo.orderSourceId = ctrl.bookingInfo.orderSourceId || data.obj.BookingSourceNone;
                        ctrl.bookingSources = data.obj.BookingSources;
                        ctrl.times = data.obj.WorkTimes.slice(0); //data.obj.Times;
                        ctrl.workTimes = data.obj.WorkTimes;
                        if (ctrl.bookingInfo.time && ctrl.times.indexOf(ctrl.bookingInfo.time) === -1) {
                            ctrl.times.unshift(ctrl.bookingInfo.time);
                            ctrl.times = ctrl.times.sort();
                        }
                    } else {
                        data.errors.forEach((error) => {
                            toaster.pop('error', error);
                        });
                        if (!data.errors) {
                            toaster.pop('error', 'Не удалось загрузить список филиалов');
                        }
                    }
                    return data;
                });
        };
        ctrl.onFlatpickrInit = function (flatpickr) {
            ctrl.flatpickr = flatpickr;
        };
        ctrl.onFlatpickrBeginInit = function (flatpickr) {
            ctrl.flatpickrBegin = flatpickr;
        };
        ctrl.onFlatpickrEndInit = function (flatpickr) {
            ctrl.flatpickrEnd = flatpickr;
        };
        ctrl.selectAffiliate = function () {
            ctrl.getBookingForm().then(() => {
                //if (ctrl.bookingInfo.date) {
                //    ctrl.flatpickr.jumpToDate(new Date(ctrl.bookingInfo.date));
                //}
                ctrl.flatpickrsRedraw();
            });
        };
        ctrl.flatpickrsRedraw = function () {
            if (ctrl.flatpickr) {
                ctrl.getMonthFreeDays(
                    ctrl.flatpickr.currentYear,
                    ctrl.flatpickr.currentMonth,
                    ctrl.bookingInfo.affiliateId,
                    ctrl.bookingInfo.reservationResourceId,
                ).then(() => {
                    ctrl.flatpickr.config !== undefined ? ctrl.flatpickr.redraw() : null;
                });
            }
            if (ctrl.flatpickrBegin) {
                ctrl.getMonthFreeDays(
                    ctrl.flatpickrBegin.currentYear,
                    ctrl.flatpickrBegin.currentMonth,
                    ctrl.bookingInfo.affiliateId,
                    ctrl.bookingInfo.reservationResourceId,
                ).then(() => {
                    ctrl.flatpickrBegin.redraw();
                    ctrl.getMonthFreeDays(
                        ctrl.flatpickrEnd.currentYear,
                        ctrl.flatpickrEnd.currentMonth,
                        ctrl.bookingInfo.affiliateId,
                        ctrl.bookingInfo.reservationResourceId,
                    ).then(() => {
                        ctrl.flatpickrEnd.redraw();
                    });
                });
            }
        };
        ctrl.calendarMonthYearChange = function (instance) {
            ctrl.getMonthFreeDays(
                instance.currentYear,
                instance.currentMonth,
                ctrl.bookingInfo.affiliateId,
                ctrl.bookingInfo.reservationResourceId,
            ).then(() => {
                instance.redraw();
            });
        };
        ctrl.getMonthFreeDays = function (year, month, affiliateId, selectedReservationResourceId) {
            if (!ctrl.mustLoadMonthFreeDays(year, month, affiliateId, selectedReservationResourceId)) {
                return $q.resolve();
            }
            const key = ctrl.getMonthFreeDaysKey(year, month, affiliateId, selectedReservationResourceId);
            let monthDate = new Date(year, month, 1);
            const nextMonth = new Date(monthDate.setMonth(monthDate.getMonth() + 1));
            monthDate = new Date(year, month, 1);
            const prevMonth = new Date(monthDate.setMonth(monthDate.getMonth() - 1));
            const nextKey = ctrl.getMonthFreeDaysKey(nextMonth.getFullYear(), nextMonth.getMonth(), affiliateId, selectedReservationResourceId);
            const prevKey = ctrl.getMonthFreeDaysKey(prevMonth.getFullYear(), prevMonth.getMonth(), affiliateId, selectedReservationResourceId);
            return $http
                .get('booking/getMonthFreeDays', {
                    params: {
                        affiliateId: ctrl.bookingInfo.affiliateId,
                        selectedReservationResourceId,
                        year,
                        month: month + 1,
                        loadCurrentMonth: !ctrl.MonthFreeDays[key],
                        loadPrevMonth: !ctrl.MonthFreeDays[prevKey],
                        loadNextMonth: !ctrl.MonthFreeDays[nextKey],
                    },
                })
                .then((response) => {
                    const data = response.data;
                    if (data.result === true) {
                        if (data.obj.CurrentMonth) {
                            ctrl.MonthFreeDays[key] = data.obj.CurrentMonth; //.map(function(d) { return new Date(d).getTime() });
                        }
                        if (data.obj.PrevMonth) {
                            ctrl.MonthFreeDays[prevKey] = data.obj.PrevMonth; //.map(function(d) { return new Date(d).getTime() });
                        }
                        if (data.obj.NextMonth) {
                            ctrl.MonthFreeDays[nextKey] = data.obj.NextMonth; //.map(function(d) { return new Date(d).getTime() });
                        }
                    } else {
                        data.errors.forEach((error) => {
                            toaster.pop('error', error);
                        });
                        if (!data.errors) {
                            toaster.pop(
                                'error',
                                $translate.instant('Admin.Js.BookingCategories.Error'),
                                $translate.instant('Admin.Js.BookingCategories.FailedToLoadWeekends'),
                            );
                        }
                    }
                });
        };
        ctrl.changeStatus = function (status) {
            // if (false && ctrl.mode !== 'add') {
            //     // сохраняем статус как и все данные по кнопке
            //     bookingService.changeStatus(ctrl.bookingInfo.id, status).then(function (data) {
            //         if (data.result === true) {
            //             toaster.pop('success', '', 'Статус сохранен');
            //             ctrl.bookingInfo.status = status;
            //         } else {
            //             data.errors.forEach(function (error) {
            //                 toaster.pop('error', error);
            //             });
            //
            //             if (!data.errors) {
            //                 toaster.pop('error', 'Ошибка сохранения статуса');
            //             }
            //         }
            //     });
            // } else {
            ctrl.bookingInfo.status = status;
            //}
        };
        ctrl.selectTime = function (result) {
            if (result && result.beginDate && result.endDate) {
                ctrl.selectDateAndTime(result.beginDate, result.endDate);
                ctrl.getBookingForm();
                if (ctrl.flatpickr) {
                    ctrl.flatpickr.jumpToDate(new Date(ctrl.bookingInfo.date));
                }
                if (ctrl.flatpickrBegin) {
                    ctrl.flatpickrBegin.jumpToDate(new Date(ctrl.bookingInfo.beginDate));
                }
                if (ctrl.flatpickrEnd) {
                    ctrl.flatpickrEnd.jumpToDate(new Date(ctrl.bookingInfo.endDate));
                }
                ctrl.flatpickrsRedraw();
            }
        };
        ctrl.changeDate = function () {
            ctrl.getBookingForm();
        };
        ctrl.changeBeginDate = function () {
            ctrl.flatpickrEnd.redraw();
        };
        ctrl.changeEndDate = function () {};
        ctrl.changeReservationResource = function () {
            ctrl.getBookingForm();
            ctrl.flatpickrsRedraw();
        };
        ctrl.mustLoadMonthFreeDays = function (year, month, affiliateId, reservationResourceId) {
            const key = ctrl.getMonthFreeDaysKey(year, month, affiliateId, reservationResourceId);
            let monthDate = new Date(year, month, 1);
            const nextMonth = new Date(monthDate.setMonth(monthDate.getMonth() + 1));
            monthDate = new Date(year, month, 1);
            const prevMonth = new Date(monthDate.setMonth(monthDate.getMonth() - 1));
            const nextKey = ctrl.getMonthFreeDaysKey(nextMonth.getFullYear(), nextMonth.getMonth(), affiliateId, reservationResourceId);
            const prevKey = ctrl.getMonthFreeDaysKey(prevMonth.getFullYear(), prevMonth.getMonth(), affiliateId, reservationResourceId);
            return !ctrl.MonthFreeDays[key] || !ctrl.MonthFreeDays[prevKey] || !ctrl.MonthFreeDays[nextKey];
        };
        ctrl.getMonthFreeDaysKey = function (year, month, affiliateId, reservationResourceId) {
            if (affiliateId) {
                return `a${  affiliateId  }y${  year  }m${  month  }${reservationResourceId ? `rr${  reservationResourceId}` : ''}`;
            } 
                return null;
            
        };
        ctrl.selectDateAndTime = function (beginDate, endDate) {
            if (beginDate) {
                if (typeof beginDate === 'string') {
                    beginDate = new Date(beginDate);
                }
                ctrl.bookingInfo.date =
                    `${beginDate.getFullYear()  }-${  (`0${  beginDate.getMonth() + 1}`).slice(-2)  }-${  (`0${  beginDate.getDate()}`).slice(-2)}`;
                if (endDate) {
                    if (typeof endDate === 'string') {
                        endDate = new Date(endDate);
                    }
                    ctrl.bookingInfo.time =
                        `${(`0${  beginDate.getHours()}`).slice(-2) 
                        }:${ 
                        (`0${  beginDate.getMinutes()}`).slice(-2) 
                        }-${ 
                        (`0${  endDate.getHours()}`).slice(-2) 
                        }:${ 
                        (`0${  endDate.getMinutes()}`).slice(-2)}`;
                    ctrl.bookingInfo.beginDate =
                        `${beginDate.getFullYear() 
                        }-${ 
                        (`0${  beginDate.getMonth() + 1}`).slice(-2) 
                        }-${ 
                        (`0${  beginDate.getDate()}`).slice(-2) 
                        } ${ 
                        (`0${  beginDate.getHours()}`).slice(-2) 
                        }:${ 
                        (`0${  beginDate.getMinutes()}`).slice(-2)}`;
                    ctrl.bookingInfo.endDate =
                        `${endDate.getFullYear() 
                        }-${ 
                        (`0${  endDate.getMonth() + 1}`).slice(-2) 
                        }-${ 
                        (`0${  endDate.getDate()}`).slice(-2) 
                        } ${ 
                        (`0${  endDate.getHours()}`).slice(-2) 
                        }:${ 
                        (`0${  endDate.getMinutes()}`).slice(-2)}`;
                    if (
                        beginDate.getFullYear() !== endDate.getFullYear() ||
                        beginDate.getMonth() !== endDate.getMonth() ||
                        beginDate.getDate() !== endDate.getDate()
                    ) {
                        ctrl.bookingInfo.dateTimeMode = 'free';
                    }
                }
            }
        };
        ctrl.changePay = function (pay) {
            ctrl.bookingInfo.payed = pay;
        };
    };
    BookingInfoCtrl.$inject = ['$http', '$q', '$translate', 'toaster', 'bookingService'];
    ng.module('bookingInfo', [])
        .controller('BookingInfoCtrl', BookingInfoCtrl)
        .component('bookingInfo', {
            templateUrl: bookingInfoTemplate,
            controller: 'BookingInfoCtrl',
            bindings: {
                onInit: '&',
                params: '<?',
                bookingInfo: '<',
                mode: '<',
                canBeEditing: '<?',
            },
        });
})(window.angular);
