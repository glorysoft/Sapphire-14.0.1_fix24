import { IAttributes, IAugmentedJQuery, ICompiledExpression, IControllerService, IParseService, IScope } from 'angular';

const isTouchDevice = 'ontouchstart' in document.documentElement;

type EventShowType = 'mouseenter' | 'click';
type EventHideType = 'mouseleave' | 'click';
const eventHideDictionary = new Map<EventShowType, EventHideType>();
eventHideDictionary.set('mouseenter', 'mouseleave');
eventHideDictionary.set('click', 'click');

class RootMenuCtrl {
    private onShow?: ICompiledExpression;
    private onHide?: ICompiledExpression;
    /* @ngInject */
    constructor(
        private readonly $element: IAugmentedJQuery,
        private readonly submenuService: any,
        private readonly $attrs: IAttributes,
        private readonly $scope: IScope,
        private readonly domService: any,
        private readonly $parse: IParseService,
    ) {}

    rootMenuIsOpen = false;

    $postLink() {
        if (isTouchDevice) {
            this.$element[0].addEventListener(`click`, (event) => {
                if (!this.$element[0].classList.contains(`active`)) {
                    event.preventDefault();
                }
            });

            this.$element[0].addEventListener(`mouseleave`, () => {
                this.hide();
                this.$scope.$digest();
            });
        }

        const eventShow: EventShowType = this.$attrs.eventShow ?? 'mouseenter';
        this.onShow = this.$attrs.onShow ? this.$parse(this.$attrs.onShow) : undefined;
        this.onHide = this.$attrs.onHide ? this.$parse(this.$attrs.onHide) : undefined;

        this.$element[0].addEventListener(eventShow, (event) => {
            if (eventShow === 'click') {
                if (event.target && event.target instanceof HTMLElement) {
                    if (event.target.closest('a.menu-dropdown-root')) {
                        event.preventDefault();
                    }else if (event.target.closest('.js-root-menu-stop-propagation')) {
                        event.stopPropagation();
                        return;
                    }
                }

                if (this.rootMenuIsOpen) {
                    this.hide();
                } else {
                    this.show();
                }
            } else {
                this.show();
            }
            this.$scope.$apply();
        });

        const eventHide = eventHideDictionary.get(eventShow);
        if (typeof eventHide === 'undefined') {
            throw new Error(`rootMenu: not match eventHide on eventShow "${eventShow}"`);
        }

        if (eventHide !== 'click') {
            this.$element[0].addEventListener(eventHide, () => {
                this.hide();
                this.$scope.$apply();
            });
        }

        const closeOnOutsideClick = this.$attrs.closeOnOutsideClick === 'true';
        if (closeOnOutsideClick) {
            window.addEventListener('click', (event) => {
                if (event.target && event.target instanceof HTMLElement && this.domService.closest(event.target, this.$element[0]) === null) {
                    this.hide();
                    this.$scope.$apply();
                }
            });
        }
    }

    show() {
        this.$element[0].classList.add(`active`);
        document.documentElement.classList.add('root-menu--active');
        const otherActive = this.submenuService.closeAnotherMenu();

        if (typeof otherActive !== 'undefined' && otherActive !== null) {
            otherActive.getBlockOrientation().style.zIndex = 0;
        }

        this.rootMenuIsOpen = true;

        if (this.onShow) {
            this.onShow(this.$scope);
        }
    }

    hide() {
        this.$element[0].classList.remove(`active`);
        document.documentElement.classList.remove('root-menu--active');

        this.rootMenuIsOpen = false;

        if (this.onHide) {
            this.onHide(this.$scope);
        }
    }
}

export default RootMenuCtrl;
