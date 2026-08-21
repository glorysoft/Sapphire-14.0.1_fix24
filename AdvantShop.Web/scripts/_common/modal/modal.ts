import { ModalController } from './controllers/modalController';
import { ModalWrapperController } from './controllers/modalWrapperController';
import { ModalService } from './services/modalService';
import {
    modalControl,
    modalFooter,
    modalHeader,
    modalClose,
    modalOpen,
    modalContent,
    modalForm,
    modalTranscludeBottom,
    modalWrapper,
} from './directives/modalDirectives';
import { modalOptionsDefault, modalConfig, type IModalConfig } from './constant/modalConstant';
const MODULE_NAME = 'modal';

angular
    .module(MODULE_NAME, [])
    .constant('modalDefaultOptions', modalOptionsDefault)
    .constant<IModalConfig>('modalConfig', modalConfig)
    .controller('ModalCtrl', ModalController)
    .controller('ModalWrapperCtrl', ModalWrapperController)
    .service('modalService', ModalService)
    .directive('modalControl', modalControl)
    .directive('modalFooter', modalFooter)
    .directive('modalHeader', modalHeader)
    .directive('modalClose', modalClose)
    .directive('modalOpen', modalOpen)
    .directive('modalContent', modalContent)
    .directive('modalTranscludeBottom', modalTranscludeBottom)
    .directive('modalWrapper', modalWrapper)
    .directive('modalForm', modalForm);

export default MODULE_NAME;
