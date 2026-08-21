(function (ng) {
    

    const SidebarUserTriggerCtrl = function (sidebarUserService) {
        const ctrl = this;

        ctrl.open = function (customerId) {
            sidebarUserService
                .getUser(customerId)
                .then((user) => {
                    if (user.HeadCustomerId) {
                        return sidebarUserService.getUser(user.HeadCustomerId).then((headUser) => {
                            user.HeadCustomer = headUser;
                            return user;
                        });
                    } 
                        return user;
                    
                })
                .then(sidebarUserService.addUser);
        };
    };

    SidebarUserTriggerCtrl.$inject = ['sidebarUserService'];

    ng.module('sidebarUser').controller('SidebarUserTriggerCtrl', SidebarUserTriggerCtrl);
})(window.angular);
