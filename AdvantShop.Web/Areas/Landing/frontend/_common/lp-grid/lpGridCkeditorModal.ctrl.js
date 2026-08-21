(function (ng) {


    const LpGridCkeditorModalCtrl = function ($element, modalService) {
        const ctrl = this;

        ctrl.$postLink = function () {
            $element.on('click', () => {
                ctrl.showModal();
            });
        };

        ctrl.showModal = function () {
            modalService.renderModal(
                'lpGridCkeditorModal',
                ctrl.header,
                '<textarea ckeditor ng-model="modalData.value" rows="10"></textarea>',
                '<button type="button" class="blocks-constructor-btn-confirm" ng-click="modalData.onApplyModal(modalData.value)">{{\'Admin.Js.Landings.LpGrid.CkeditirModal.Save\'|translate}}</button><button class="blocks-constructor-btn-cancel blocks-constructor-btn-mar" type="button" data-modal-close="">{{\'Admin.Js.Landings.LpGrid.CkeditirModal.Cancel\'|translate}}</button>',
                { modalClass: 'lp-grid-ckeditor-modal__form', modalOverlayClass: '', destroyOnClose: true },
                {
                    modalData: {
                        onApplyModal: ctrl.onApplyModal,
                        value: ctrl.value,
                    },
                },
            );

            modalService.getModal('lpGridCkeditorModal').then((modal) => {
                modal.modalScope.open();
            });
        };

        ctrl.onApplyModal = function (value) {
            ctrl.onApply({ value });
            modalService.getModal('lpGridCkeditorModal').then((modal) => {
                modal.modalScope.close();
            });
        };
    };

    ng.module('lpGrid').controller('LpGridCkeditorModalCtrl', LpGridCkeditorModalCtrl);

    LpGridCkeditorModalCtrl.$inject = ['$element', 'modalService'];
})(window.angular);
