import { IDirective, IScope } from 'angular';
import { IStickyElementService } from '../stickyElement.types';

const classNameActive = 'is-pinned';
const classNameInitialized = 'sticky-element--initialized';

interface IStickyElementScope extends IScope {
    stickyElement: {
        isPinned: boolean;
    };
}

/* @ngInject */
export function StickyElement(stickyElementService: IStickyElementService): IDirective<IStickyElementScope> {
    return {
        restrict: 'A',
        /*attributes
            top: number | string - example: 10 , bottom-self
            bottom: number
        */
        scope: true,
        link(scope, element, attrs) {
            if (typeof attrs.top !== 'undefined' && attrs.top !== null && typeof attrs.bottom !== 'undefined' && attrs.bottom !== null) {
                throw new Error('StickyElement: "top" and "bottom" mutually exclusive');
            }

            scope.stickyElement = { isPinned: false };

            const init = () => {
                const dereg = stickyElementService.addElementToObserver(
                    element[0],
                    (isPinned, scrollParent, scrollY) =>
                        new Promise((resolve) => {
                            scope.stickyElement.isPinned = isPinned;
                            element[0].classList[isPinned ? 'add' : 'remove'](classNameActive);
                            resolve({ isPinned, scrollParent, scrollY });
                            scope.$digest();
                        }),
                );

                element.on('$destroy', () => {
                    dereg();
                    element[0].classList.remove(classNameInitialized);
                });

                element[0].classList.add(classNameInitialized);
            };

            if (document.readyState !== 'complete') {
                window.addEventListener('load', () => setTimeout(init, 500));
            } else {
                init();
            }
        },
    };
}
