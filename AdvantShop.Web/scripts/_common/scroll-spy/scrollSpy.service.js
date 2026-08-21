/* @ngInject */
export const scrollSpyService = function ($rootScope, $document) {
    // eslint-disable-next-line no-invalid-this
    const service = this;
    const data = new Map();
    let activeTarget;
    let observer;
    let isStopWorking = false;

    const processItems = () => {
        const dataItems = Array.from(data.entries());
        let result = null;
        for (const [currentTarget, currentItemData] of dataItems) {
            if (currentItemData.some((x) => x.scope.entry.isIntersecting === true)) {
                result = [currentTarget, currentItemData];
            }
        }

        if (result) {
            service.setActive(result[0]);
        }

        $rootScope.$apply();
    };

    service.setActive = (target) => {
        if (activeTarget) {
            data.get(activeTarget).forEach((x) => (x.scope.isActive = false));
        }

        activeTarget = target;

        data.get(target).forEach((current) => {
            current.scope.isActive = true;
            if (current.scope.options.alignHorizontal === true) {
                alignHorizontal(current.elementSpy);
            }
            if ($document[0].activeElement.dataset.scrollSpy && $document[0].activeElement !== current.elementSpy) {
                current.elementSpy.focus();
            }
        });
    };

    const alignHorizontal = (element) => {
        const parent = element.parentElement;
        const elWidth = element.offsetWidth;
        const parentCenter = parent.offsetWidth / 2;
        parent.scroll({ behavior: `smooth`, left: element.offsetLeft - parentCenter + elWidth / 2 });
    };

    service.addSpy = (elementSpy, elementTarget, spyCtrl) => {
        let timerId;
        if (!observer) {
            observer = new IntersectionObserver((entries) => {
                if (isStopWorking === true) {
                    return;
                }

                for (const entry of entries) {
                    data.get(entry.target).forEach((x) => {
                        x.scope.entry = entry;
                    });
                }

                if (timerId) {
                    clearTimeout(timerId);
                }
                timerId = setTimeout(() => processItems(entries), 300);
            }, spyCtrl.options.observe);
        }

        if (data.has(elementTarget)) {
            data.get(elementTarget).push({ elementSpy, scope: spyCtrl });
        } else {
            data.set(elementTarget, [{ elementSpy, scope: spyCtrl }]);
        }

        observer.observe(elementTarget);

        return () => observer.unobserve(elementTarget);
    };

    service.activate = () => (isStopWorking = false);
    service.deactivate = () => (isStopWorking = true);
};
