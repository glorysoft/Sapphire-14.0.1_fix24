(function (ng) {
    

    /* @ngInject */
    const SalesChannelsCtrl = function ($window, SweetAlert, $http, toaster) {
        const ctrl = this;

        ctrl.removeChannel = function (type) {
            SweetAlert.confirm('Вы уверены что хотите удалить канал?', { title: 'Удаление' }).then((result) => {
                if (result && !result.isDismissed) {
                    $http.post('salesChannels/delete', { type }).then(() => {
                        toaster.pop('success', '', 'Канал продаж удален');

                        const basePath = document.getElementsByTagName('base')[0].getAttribute('href');
                        $window.location.assign(basePath);
                    });
                }
            });
        };

        ctrl.addSalesChannel = function (type) {
            $http.post('salesChannels/add', { type }).then((response) => {
                if (response != null && response.data.errors != null) {
                    response.data.errors.forEach((err) => {
                        toaster.pop('error', '', err);
                    });
                } else {
                    $window.location.reload();
                }
            });
        };
    };

    ng.module('salesChannels', []).controller('SalesChannelsCtrl', SalesChannelsCtrl);
})(window.angular);
