(function (ng) {
    

    const KanbanCardCtrl = function () {
        const ctrl = this;

        ctrl.$onInit = function () {};
        ctrl.getFullDate = () => new Date(ctrl.card.DateAppointed).toLocaleString('ru-RU');
    };

    KanbanCardCtrl.$inject = [];

    ng.module('kanban').controller('KanbanCardCtrl', KanbanCardCtrl);
})(window.angular);
