/* @ngInject */
const ModalBringFriendTriggerCtrl = function (modalService) {
    const ctrl = this;

    ctrl.$onInit = () => {
        ctrl.modalId = 'bringFriendModal';
    };

    ctrl.openModal = () => {
        modalService.renderModal(ctrl.modalId, null, `<modal-bring-friend-content></modal-bring-friend-content>`, null, {
            destroyOnClose: true,
        });

        modalService.getModal(ctrl.modalId).then((modal) => {
            modal.modalScope.open();
        });
    };
};

export default ModalBringFriendTriggerCtrl;
