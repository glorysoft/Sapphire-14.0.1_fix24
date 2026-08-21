export class ModalSheetOverlay {
    private _overlay?: HTMLElement;

    constructor(
        modalEl: HTMLElement,
        private zIndex = 999,
        private onClick?: (...args: any[]) => any,
    ) {
        this.mount(modalEl);
        this.bindEventClick();
    }

    private mount(modalEl: HTMLElement) {
        modalEl.before(this.overlay);
    }

    get overlay(): HTMLElement {
        if (!this._overlay) {
            const overlay = document.createElement('div');
            overlay.style.zIndex = this.zIndex.toString();
            overlay.classList.add('adv-modal-overlay');
            this._overlay = overlay;
        }
        return this._overlay;
    }

    showOverlay() {
        this.overlay.classList.add('adv-modal-overlay--show');
    }

    hideOverlay() {
        this.overlay.classList.remove('adv-modal-overlay--show');
    }

    private bindEventClick() {
        this.overlay.addEventListener('click', this.handleClick);
    }

    private unbindEventClick() {
        this.overlay.removeEventListener('click', this.handleClick);
    }

    private handleClick = (event: MouseEvent) => {
        this.onClick?.(event);
    };

    private removeOverlay() {
        this.overlay.remove();
    }

    destroy() {
        this.unbindEventClick();
        // вызывать в конце т.к. this.overlay создает элемент
        this.removeOverlay();
    }
}
