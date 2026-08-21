import addTaskTemplate from './../_shared/modal/addTask/addTask.html';
(function (ng) {
    

    const TasksCreateCtrl = function ($element, $scope, $uibModal) {
        const ctrl = this;
        ctrl.$postLink = function () {
            $element.on('click', () => $uibModal
                    .open({
                        bindToController: true,
                        controller: 'ModalAddTaskCtrl',
                        controllerAs: 'ctrl',
                        templateUrl: addTaskTemplate,
                        resolve: ctrl.resolve,
                        windowClass: 'modal__window--scrollbar-no',
                        size: 'lg',
                        backdrop: 'static',
                    })
                    .result.then(
                        (result) => {
                            if (ctrl.onAfter != null) {
                                ctrl.onAfter({
                                    result,
                                });
                            }
                            return result;
                        },
                        (result) => {
                            if (ctrl.onAfter != null) {
                                ctrl.onAfter({
                                    result,
                                });
                            }
                            return result;
                        },
                    ));
        };
    };
    TasksCreateCtrl.$inject = ['$element', '$scope', '$uibModal'];
    ng.module('tasks').controller('TasksCreateCtrl', TasksCreateCtrl);
})(window.angular);
