(function (ng) {
    

    const InplaceLandingSwitchCtrl = function ($window) {
        const ctrl = this;

        ctrl.change = function (enabled) {
            $window.location.search = ctrl.updateQueryStringParameter($window.location.search, 'inplace', enabled);
        };

        ctrl.updateQueryStringParameter = function (uri, key, value) {
            const re = new RegExp(`([?&])${  key  }=.*?(&|$)`, 'i');
            const separator = uri.indexOf('?') !== -1 ? '&' : '?';

            if (uri.match(re)) {
                return uri.replace(re, `$1${  key  }=${  value  }$2`);
            } 
                return `${uri + separator + key  }=${  value}`;
            
        };
    };

    ng.module('inplaceLanding').controller('InplaceLandingSwitchCtrl', InplaceLandingSwitchCtrl);

    InplaceLandingSwitchCtrl.$inject = ['$window'];
})(window.angular);
