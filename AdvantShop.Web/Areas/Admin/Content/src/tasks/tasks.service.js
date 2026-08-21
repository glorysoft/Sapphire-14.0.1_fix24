import completeTaskTemplate from './modal/completeTask/completeTask.html';
import editTaskTemplate from './modal/editTask/editTask.html';
import changeTaskStatusTemplate from './modal/changeTaskStatus/changeTaskStatus.html';

(function (ng) {
    
    /* @ngInject */
    const tasksService = function ($http, $uibModal, toaster, $translate, $q) {
        const service = this;

        service.getTasks = function () {
            return $http.get('tasks/getTasks').then((response) => response.data);
        };

        service.getFormData = function (id, taskGroupId) {
            return $http.get('tasks/getTaskFormData', { params: { id, taskGroupId } }).then((response) => response.data);
        };

        service.getTaskGroups = function () {
            return $http.get('taskgroups/getTaskGroupsSelectOptions').then((response) => response.data);
        };

        service.getTaskPriorities = function () {
            return $http.get('tasks/getTaskPrioritiesSelectOptions').then((response) => response.data);
        };

        service.getTaskStatuses = function () {
            return $http.get('tasks/getTaskStatusesSelectOptions').then((response) => response.data);
        };

        service.getTaskAttachments = function (id) {
            return $http.post('tasks/getTaskAttachments', { id }).then((response) => response.data);
        };

        service.getTask = function (id) {
            return $http.post('tasks/getTask', { id }).then((response) => response.data);
        };

        service.deleteTask = function (id) {
            return $http.post('tasks/deleteTask', { id }).then((response) => response.data);
        };

        service.addTask = function (params) {
            return $http.post('tasks/addTask', params).then((response) => response.data);
        };

        service.editTask = function (params) {
            return $http.post('tasks/editTask', params).then((response) => response.data);
        };

        service.changeTaskStatus = function (id, status) {
            return $http.post('tasks/changeTaskStatus', { id, status }).then((response) => response.data);
        };

        service.changeAssignedManager = function (id, managerIds) {
            return $http.post('tasks/changeAssignedManager', { id, managerIds }).then((response) => response.data);
        };

        service.changeAssignedManager = function (id, managerIds) {
            return $http.post('tasks/changeAssignedManager', { id, managerIds }).then((response) => response.data);
        };

        service.changeAppointedManager = function (id, appointedManagerId) {
            return $http.post('tasks/changeAppointedManager', { id, appointedManagerId }).then((response) => response.data);
        };

        service.changeDueDate = function (id, date) {
            return $http.post('tasks/changeDueDate', { id, date }).then((response) => response.data);
        };

        service.changeReminder = function (id, reminder) {
            return $http.post('tasks/changeReminder', { id, reminder }).then((response) => response.data);
        };

        service.removeReminder = function (id) {
            return $http.post('tasks/removeReminder', { id }).then((response) => response.data);
        };

        service.changeTaskStatuses = function (params) {
            return $http.post('tasks/changeTaskStatuses', params).then((response) => response.data);
        };

        service.changePriority = function (id, priority) {
            return $http.post('tasks/changePriority', { id, priority }).then((response) => response.data);
        };

        service.completeTask = function (id, result, orderStatusId, dealStatusId, taskGroupId, taskStatusId) {
            return $http
                .post('tasks/completeTask', {
                    id,
                    taskResult: result,
                    orderStatusId,
                    dealStatusId,
                    taskGroupId,
                    taskStatusId,
                })
                .then((response) => response.data);
        };

        service.getOrderStatuses = function (orderId) {
            return $http.post('tasks/getOrderStatuses', { orderId }).then((response) => response.data);
        };

        service.getDealStatuses = function (leadId) {
            return $http.post('tasks/getDealStatuses', { leadId }).then((response) => response.data);
        };

        service.acceptTask = function (id) {
            return $http.post('tasks/acceptTask', { taskId: id }).then((response) => response.data);
        };

        service.cancelTask = function (id) {
            return $http.post('tasks/cancelTask', { taskId: id }).then((response) => response.data);
        };

        service.acceptTasks = function (params) {
            return $http.post('tasks/accepttasks', params).then((response) => response.data);
        };

        service.changeSorting = function (id, prevId, nextId) {
            return $http.post('tasks/changeSorting', { id, prevId, nextId }).then((response) => response.data);
        };

        service.deleteAttachment = function (id, taskId) {
            return $http.post('tasks/deleteAttachment', { id, taskId }).then((response) => response.data);
        };

        service.loadTask = function (id, modalOptions) {
            const options = {
                
                bindToController: true,
                    controller: 'ModalEditTaskCtrl',
                    controllerAs: 'ctrl',
                    templateUrl: editTaskTemplate,
                    resolve: {
                        id () {
                            return id;
                        },
                    },
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'modal__window--scrollbar-no',
                ...modalOptions,
            };

            return $uibModal.open(options);
        };

        service.getHistory = function (id) {
            return $http.get('tasks/getHistory', { params: { id } }).then((response) => response.data);
        };

        service.validateTaskGroupManager = function (managerIds, taskGroupId) {
            return $http
                .get('tasks/validateTaskGroupManager', { params: { managerIds, taskGroupId } })
                .then((response) => response.data);
        };

        service.validateTaskGroupManagerByRoles = function (managerIds, managerRoleIds, participantIds) {
            return $http
                .get('tasks/validateTaskGroupManagerByRoles', {
                    params: { managerIds, managerRoleIds, participantIds },
                })
                .then((response) => response.data);
        };

        service.validateTaskData = function (appointedManagerId, taskGroupId) {
            return $http
                .get('tasks/validateTaskData', {
                    params: { appointedManagerId, taskGroupId },
                })
                .then((response) => response.data);
        };

        service.getTaskManagers = function (id, taskGroupId) {
            return $http.get('tasks/getManagers', { params: { id, taskGroupId } }).then((response) => response.data);
        };

        service.copyTask = function (id) {
            return $http.post('tasks/copyTask', { id }).then((response) => response.data);
        };

        service.completeTaskShowModal = function (taskData) {
            return $uibModal.open({
                bindToController: true,
                controller: 'ModalCompleteTaskCtrl',
                controllerAs: 'ctrl',
                templateUrl: completeTaskTemplate,
                windowClass: 'modal--strecth',
                resolve: {
                    task: taskData,
                },
            }).result;
        };

        service.changeTaskGroup = function (params) {
            return $http.post('tasks/changeTaskGroup', params).then((response) => response.data);
        };

        service.changeTaskGroups = function (params) {
            return $http.post('tasks/changeTaskGroups', params).then((response) => response.data);
        };

        service.changeObserver = function (id, observerIds) {
            return $http.post('tasks/changeObserver', { id, observerIds }).then((response) => response.data);
        };

        service.getTaskGroupsCanBeCompleted = function () {
            return $http.get('tasks/getTaskGroupsCanBeCompleted').then((response) => response.data);
        };

        service.getProjectStatuses = function (taskGroupId, statusType) {
            return $http.get('tasks/getProjectStatusesByStatusType', { params: { taskGroupId, statusType } }).then((response) => 
                 response.data
                //return response;
            );
        };

        service.getAvailableStatusesByTaskGroupId = function (taskGroupId, currentStatusId) {
            return $http.get('tasks/getAvailableStatusesByTaskGroupId', { params: { taskGroupId, currentStatusId } }).then((response) => 
                 response.data
                //return response;
            );
        };

        service.selectStatusByList = function (statusList) {
            if (statusList == null || statusList.length === 0) {
                return $q.resolve(null);
            } else if (statusList.length === 1) {
                return $q.resolve(statusList[0]);
            } 
                return $uibModal
                    .open({
                        bindToController: true,
                        controller: 'ModalChangeTaskStatusCtrl',
                        controllerAs: 'ctrl',
                        templateUrl: changeTaskStatusTemplate,
                        resolve: {
                            statusList () {
                                return statusList;
                            },
                        },
                    })
                    .result.then((result) => {
                        if (result !== false) {
                            return $q.resolve(result);
                        } 
                            return $q.resolve(null);
                        
                    })
                    .catch((result) => {
                        if ([`backdrop`, `crossClick`, `escape`].some((x) => result.includes(x))) {
                            return $q.resolve(null);
                        } 
                            return $q.reject(result);
                        
                    });
            
        };
    };

    ng.module('tasks').service('tasksService', tasksService);
})(window.angular);
