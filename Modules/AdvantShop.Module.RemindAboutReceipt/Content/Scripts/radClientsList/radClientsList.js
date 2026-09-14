; (function (ng) {

    'use strict';

    var RadModuleClientsListCtrl = function ($uibModal, uiGridConstants, uiGridCustomConfig, SweetAlert, $q) {
        var ctrl = this;

        ctrl.$onInit = function () {
            var menuBlock = $('.row .flex-grow-n.col-fixed-size-md')[0];
            var contentBlock = $('.row .flex-grow.flex-basis-n.flex-width-n')[0];

            if (menuBlock !== undefined && menuBlock.classList !== undefined) {
                menuBlock.classList.add('col-xs-2');
            }

            if (contentBlock !== undefined && contentBlock.classList !== undefined) {
                contentBlock.classList.remove('flex-width-n');
                contentBlock.classList.add('col-xs-12');
            }
        };

        var columnDefs = [
            {
                name: 'Email',
                displayName: 'Email',
                cellTemplate: '<div class="ui-grid-cell-contents" data-ng-if="row.entity.CustomerId !== null"><a href="customers#?customerIdInfo={{ row.entity.CustomerId }}" target="_blank">{{COL_FIELD}}</a></div> ' +
                    '<div class="ui-grid-cell-contents" data-ng-if="row.entity.CustomerId === null">{{COL_FIELD}}</div>',
                filter: {
                    placeholder: 'Email',
                    type: uiGridConstants.filter.INPUT,
                    name: 'Email'
                }
            },
            {
                name: 'ProductName',
                displayName: 'Товар',
                cellTemplate: '<div class="ui-grid-cell-contents"><a href="product/edit/{{ row.entity.ProductId }}" target="_blank">{{ COL_FIELD }}</a></div>'
            },
            {
                name: 'LeadId',
                displayName: 'Ссылка на лид',
                cellTemplate: '<div class="ui-grid-cell-contents" data-ng-if="row.entity.LeadId === null">Лид не создан</div>' +
                    '<div class="ui-grid-cell-contents" data-ng-if="row.entity.LeadId !== null"><a href="leads?salesFunnelId=-1&useKanban=False#?leadIdInfo={{ COL_FIELD }}" target="_blank">{{ row.entity.LeadTitle }}</a></div>'
            },
            {
                name: 'OldPrice',
                displayName: 'Старая цена',
                cellEdit: false
            },
            {
                name: 'SendNotification',
                displayName: 'Отправлено',
                cellTemplate:
                    '<div class="ui-grid-cell-contents"><div class="adv-checkbox-label">' +
                    '<input type="checkbox" ng-model="row.entity.SendNotification" readonly class="adv-checkbox-input control-checkbox pointer-events-none" data-e2e="switchOnOffSelect" />' +
                    '<span class="adv-checkbox-emul" data-e2e="switchOnOffInput"></span>' +
                    '</div></div>',
                width: 65,
                headerCellClass: 'ui-grid-text-center',
                cellClass: 'ui-grid-text-center'
            },
            {
                name: '_serviceColumn',
                displayName: '',
                width: 80,
                cellTemplate:
                    '<div class="ui-grid-cell-contents"><div>' +
                    '<a href="" class="link-invert ui-grid-custom-service-icon fa fa-pencil fa-pencil-alt" ng-click="grid.appScope.$ctrl.gridExtendCtrl.loadClient(row.entity.Id)"></a>' +
                    '<ui-grid-custom-delete url="../module/raradmin/deleteRadClient" params="{\'id\': row.entity.Id }"></ui-grid-custom-delete>' +
                    '</div></div>'
            }
        ];

        ctrl.gridClientsOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs: columnDefs,
            uiGridCustom: {
                selectionOptions: [
                    {
                        text: 'Удалить выделенные',
                        url: '../module/raradmin/deleteRadClients',
                        field: 'Id',
                        before: function () {
                            return SweetAlert.confirm("Вы уверены, что хотите удалить?", { title: "Удаление" }).then(function (result) {
                                return result === true || result.value ? $q.resolve('sweetAlertConfirm') : $q.reject('sweetAlertCancel');
                            });
                        }
                    }
                ]
            }
        });

        ctrl.gridClientsOnInit = function (grid) {
            ctrl.gridClients = grid;
        };

        ctrl.loadClient = function (id) {
            $uibModal.open({
                bindToController: true,
                controller: 'ModalAddEditRadClientCtrl',
                controllerAs: 'ctrl',
                templateUrl: '../modules/RemindAboutReceipt/content/scripts/radClientsList/modal/AddEditRadClient.html',
                resolve: {
                    id: function () {
                        return id;
                    }
                },
                size: "xs-6"
            }).result.then(function (result) {
                ctrl.gridClients.fetchData();
                return result;
            }, function (result) {
                return result;
            });
        };
    };

    RadModuleClientsListCtrl.$inject = ['$uibModal', 'uiGridConstants', 'uiGridCustomConfig', 'SweetAlert', '$q'];

    ng.module('RADModuleSettings', [])
        .controller('RadModuleClientsListCtrl', RadModuleClientsListCtrl)
        .component('radModuleClientsList', {
            templateUrl: '../modules/RemindAboutReceipt/content/scripts/radClientsList/templates/radClientsList.html',
            controller: 'RadModuleClientsListCtrl'
        });

})(window.angular);