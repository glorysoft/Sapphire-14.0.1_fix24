(function (ng) {
    

    ng.module('bookingCart', []).constant('bookingCartConfig', {
        callbackNames: {
            // список на рассмотрерии
            get: 'get',
            remove: 'remove',
            add: 'add',
            clear: 'clear',
            open: 'open',
        },
    });
})(window.angular);
