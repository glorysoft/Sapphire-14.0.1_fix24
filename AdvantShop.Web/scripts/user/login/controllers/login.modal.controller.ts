import type { IController } from 'angular';
import type { IModalService } from '../../../_common/modal/services/modalService';
import type { LoginProps } from '../login.directives';
import type { RenderFrom } from './login.controller';

export interface ILoginModalController extends IController, LoginProps {
    modalId: string;

    openModal(): void;

    closeModal(): void;
    onClose?: (modalId: string) => void;
}

export default class LoginModalController implements ILoginModalController {
    modalId = 'LoginModal';
    renderFrom?: RenderFrom;
    redirectTo?: string;
    lpId?: number;
    onClose?: (modalId: string) => void;
    /* @ngInject */
    constructor(readonly modalService: IModalService) {}

    openModal() {
        this.modalService.renderModal(
            this.modalId,
            null,
            `
                <login render-from="'modal'"
                       ${this.redirectTo ? `redirect-to="'${this.redirectTo}'"` : ''}
                       ${this.lpId ? `lp-id=" ${this.lpId}"` : ''}>
                </login>
            `,
            null,
            {
                modalClass: 'login-modal',
                destroyOnClose: true,
                callbackClose: 'loginCtrl.closeModal()',
                isForm: false,
            },
            {
                loginCtrl: this,
            },
        );

        this.modalService.getModal(this.modalId).then((modal) => {
            modal.modalScope.open();
        });
    }

    closeModal() {
        this.onClose?.(this.modalId);
        this.modalService.destroy(this.modalId);
    }
}
