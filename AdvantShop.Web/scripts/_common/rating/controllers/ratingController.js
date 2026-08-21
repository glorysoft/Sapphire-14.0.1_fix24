/* @ngInject */
function RatingCtrl($http, $q) {
    const ctrl = this;

    ctrl.items = [];

    ctrl.select = function (val) {
        if (ctrl.readonly === false) {
            ctrl.current = val;

            for (let i = 0; i < val; i++) {
                ctrl.items[i].isSelected = true;
            }

            if (ctrl.url) {
                return $http.post(ctrl.url, { objId: ctrl.objId, rating: ctrl.current }).then((response) => (ctrl.current = response.data));
            } 
                return $q.resolve(ctrl.current);
            
        }
    };
}

export default RatingCtrl;
