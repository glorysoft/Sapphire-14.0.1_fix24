(function (ng) {
    

    const TechDomainCtrl = function () {
        const ctrl = this;

        ctrl.$onInit = function () {
            const today = new Date();

            const storageShowMessageDate = localStorage.getItem('dateWhenShowMessage');

            if (storageShowMessageDate != null) {
                if (new Date(storageShowMessageDate) - today <= 0) {
                    ctrl.isShowMessage = true;
                    localStorage.removeItem('dateWhenShowMessage');
                } else {
                    ctrl.isShowMessage = false;
                }
            } else {
                ctrl.isShowMessage = true;
                localStorage.removeItem('dateWhenShowMessage');
            }
        };

        ctrl.closeDomainInfo = function () {
            ctrl.isShowMessage = false;

            const clickCloseDate = new Date();
            const dateWhenShowMessage = new Date(
                clickCloseDate.getFullYear(),
                clickCloseDate.getMonth(),
                clickCloseDate.getDate() + 3,
                clickCloseDate.getHours(),
                clickCloseDate.getMinutes(),
            );
            localStorage.setItem('dateWhenShowMessage', dateWhenShowMessage);
        };
    };

    angular.module('techDomain', []).controller('TechDomainCtrl', TechDomainCtrl);

    TechDomainCtrl.$inject = [];
})(window.angular);
