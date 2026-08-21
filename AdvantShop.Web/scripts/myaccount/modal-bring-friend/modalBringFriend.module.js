import './modalBringFriend.scss';
import ModalBringFriendTriggerCtrl from './modalBringFriendTrigger.ctrl.js';
import ModalBringFriendContentCtrl from './modalBringFriendContent.ctrl.js';
import { modalBringFriendTrigger, modalBringFriendContent } from './modalBringFriend.components.js';

const moduleName = 'modalBringFriend';

angular
    .module(moduleName, [])
    .controller('ModalBringFriendTriggerCtrl', ModalBringFriendTriggerCtrl)
    .controller('ModalBringFriendContentCtrl', ModalBringFriendContentCtrl)
    .directive('modalBringFriendTrigger', modalBringFriendTrigger)
    .directive('modalBringFriendContent', modalBringFriendContent);

export default moduleName;
