(function (ng) {
    const telephonyService = function ($http, modalService) {
        const service = this,
            modalId = 'telephonyModal',
            modalRendered = false;

        service.dialogOpen = function (title, message) {
            if (modalRendered === false) {
                modalService.renderModal(modalId, title, message);
            }

            modalService.getModal(modalId).then((modal) => {
                modal.modalScope.open();
            });
        };

        service.call = function (phone, check) {
            return $http.post('common/callBack', { phone: phone.replace(/\D+/g, ''), check }).then((response) => response.data);
        };
    };

    angular.module('telephony').service('telephonyService', telephonyService);

    telephonyService.$inject = ['$http', 'modalService'];
})(window.angular);
