(function (ng) {
    

    const CategorySelectorCtrl = function (blocksConstructorService, $http, $timeout) {
        let ctrl = this,
            categoriesSelected = [];

        ctrl.setSelectedIds = function (categoryArrayObjs) {
            ctrl.selectedIds = categoryArrayObjs
                .map((item) => item.CategoryId)
                .join(',');
            ctrl.showJSTree = true;
        };

        ctrl.selectCategory = function (event, data) {
            const tree = ng.element(event.target).jstree(true);
            categoriesSelected = ctrl.getCategoriesSelected(tree.get_selected(true));
        };

        ctrl.getCategoriesSelected = function (selectedNodes) {
            return selectedNodes.map((item) => ({
                    CategoryId: item.id,
                    Parents: item.parents,
                    Parent: item.parent,
                    Name: item.original.name,
                    Enabled: item.state.enabled,
                    Opened: item.state.opened,
                }));
        };

        ctrl.deselectCategory = function (event, data) {
            const tree = ng.element(event.target).jstree(true);
            categoriesSelected = ctrl.getCategoriesSelected(tree.get_selected(true));
        };

        ctrl.apply = function (modal) {
            return ctrl.getCategoriesSelectedWithChildrens(categoriesSelected).then((data) => ng.copy(data.obj));
        };

        ctrl.getCategoriesSelectedWithChildrens = function (categoriesSelected) {
            return $http.post('landinginplace/GetCategories', { categoriesSelected }).then((response) => response.data);
        };
    };

    ng.module('blocksConstructor').controller('CategorySelectorCtrl', CategorySelectorCtrl);

    CategorySelectorCtrl.$inject = ['blocksConstructorService', '$http', '$timeout'];
})(window.angular);
