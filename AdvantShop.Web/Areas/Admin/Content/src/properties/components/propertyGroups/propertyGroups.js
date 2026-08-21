import groupsTemplate from './templates/groups.html';
(function (ng) {
    

    const PropertyGroupsCtrl = function ($http, SweetAlert, toaster, urlHelper, $window, $translate) {
        const ctrl = this;
        ctrl.$onInit = function () {
            ctrl.fetch();
            if (ctrl.onInit != null) {
                ctrl.onInit({
                    propertyGroups: ctrl,
                });
            }
        };
        ctrl.fetch = function () {
            $http.get('properties/getGroups').then((response) => {
                ctrl.groups = response.data;
            });
        };
        ctrl.deleteGroup = function (id, index) {
            SweetAlert.confirm($translate.instant('Admin.Js.Properties.AreYouSureDeleteGroup'), {
                title: $translate.instant('Admin.Js.Properties.DeletingGroup'),
            }).then((result) => {
                if (result === true || result.value) {
                    $http
                        .post('properties/deleteGroup', {
                            propertyGroupId: id,
                        })
                        .then((response) => {
                            //var groupId = urlHelper.getUrlParam('groupId');
                            //if (groupId == id) {
                            //    $window.location.assign('properties');
                            //}
                            //ctrl.fetch();
                            ctrl.selectGroup(0);
                            ctrl.groups.splice(index, 1);
                            toaster.pop('success', '', $translate.instant('Admin.Js.Design.SuccessfullyDeleted'));
                        });
                } else if (!result.isDismissed) {
                        toaster.pop('error', '', $translate.instant('Admin.Js.Catalog.ErrorWhileDeleting'));
                    }
            });
        };
        ctrl.sortableOptions = {
            orderChanged (event) {
                const propertyGroupId = event.source.itemScope.group.PropertyGroupId,
                    prevGroup = ctrl.groups[event.dest.index - 1],
                    nextGroup = ctrl.groups[event.dest.index + 1];
                $http
                    .post('properties/changeGroupSorting', {
                        groupId: propertyGroupId,
                        prevGroupId: prevGroup != null ? prevGroup.PropertyGroupId : null,
                        nextGroupId: nextGroup != null ? nextGroup.PropertyGroupId : null,
                    })
                    .then((response) => {
                        if (response.data.result == true) {
                            toaster.pop('success', '', $translate.instant('Admin.Js.Properties.ChangesSaved'));
                        }
                    });
            },
        };
        ctrl.selectGroup = function (groupId) {
            ctrl.groupId = groupId;
            if (ctrl.onChangeGroup != null) {
                ctrl.onChangeGroup({
                    groupId: ctrl.groupId,
                });
            }
        };
    };
    PropertyGroupsCtrl.$inject = ['$http', 'SweetAlert', 'toaster', 'urlHelper', '$window', '$translate'];
    ng.module('propertyGroups', ['as.sortable'])
        .controller('PropertyGroupsCtrl', PropertyGroupsCtrl)
        .component('propertyGroups', {
            templateUrl: groupsTemplate,
            controller: 'PropertyGroupsCtrl',
            transclude: true,
            bindings: {
                groupId: '<?',
                onInit: '&',
                onChangeGroup: '&',
            },
        });
})(window.angular);
