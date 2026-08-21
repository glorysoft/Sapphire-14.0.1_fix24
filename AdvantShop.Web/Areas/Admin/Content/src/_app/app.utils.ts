import { ITimeoutService } from 'angular';
import { IToasterService } from 'ngtoaster';

const showNotifyMessages = (
    toaster: IToasterService,
) => {
    const toasterContainer = document.querySelector('[data-toaster-container]');

    setTimeout(() => {
        if (toasterContainer != null) {
            const toasterItems = document.querySelectorAll('[data-toaster-type]');
            if (toasterItems != null) {
                for (let i = 0, len = toasterItems.length; i < len; i++) {
                    toaster.pop({
                        type: toasterItems[i].getAttribute('data-toaster-type') ?? 'error',
                        body: toasterItems[i].innerHTML,
                        bodyOutputType: 'trustedHtml',
                    });
                }
            }
        }
    });
};

//old style using anchor
const setTargetToLinks = () => {
    const linkWithAnchors = document.querySelectorAll('a[href*="#"]:not([target])');

    //old style using anchor
    if (linkWithAnchors.length > 0) {
        for (let j = 0, lenJ = linkWithAnchors.length; j < lenJ; j += 1) {
            linkWithAnchors[j].setAttribute('target', '_self');
        }
    }
};

export {
    showNotifyMessages,
    setTargetToLinks,
};
