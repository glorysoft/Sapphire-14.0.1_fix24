import './styles.scss';

let cursor: HTMLElement | null = null;

const promiseLoad = new Promise<void>(resolve => {
    if (document.readyState !== 'complete') {
        window.addEventListener('load', () => {
            resolve();
        });
    } else {
        resolve();
    }
});

promiseLoad.then(() => {

    cursor = document.querySelector('.js-custom-cursor');

    if(cursor == null) {
        return;
    }

    setTimeout(() => {
        initCursor({
            targets: [{
                selector: '.slider-main-block .carousel-nav-prev',
                cursorClassActive: 'cursor-arrow-left',
            },
                {
                    selector: '.slider-main-block .carousel-nav-next',
                    cursorClassActive: 'cursor-arrow-right',
                }],
        });
    }, 500);
});

interface CursorTargetOptions {
    selector: string;
    cursorClassActive?: string;
}

interface CursorOptions {
    targets: CursorTargetOptions[] | CursorTargetOptions;
}

const initCursor = (options: CursorOptions) => {
    (Array.isArray(options.targets) ? options.targets : [options.targets])
        .forEach(targetOptions => {

            Array.from(document.querySelectorAll(targetOptions.selector))
                .forEach(item => {
                    item.classList.add('custom-cursor-target');
                    bindItem(item as HTMLElement, targetOptions);

                    if (item.matches(':hover')) {
                        active(targetOptions);
                    }
                });

        });
};


const getCursor = () => {
    if (cursor) {
        return cursor;
    }

    throw new Error('custom cursor: not found element');
};

const active = (targetOptions: CursorTargetOptions) => {
    const _cur = getCursor();
    _cur.classList.remove('custom-cursor--hide');
    if (targetOptions.cursorClassActive) {
        _cur.classList.add(targetOptions.cursorClassActive);
    }
};

const deactivate = (targetOptions: CursorTargetOptions) => {
    const _cur = getCursor();
    _cur.classList.add('custom-cursor--hide');
    if (targetOptions.cursorClassActive) {
        _cur.classList.remove(targetOptions.cursorClassActive);
    }
};

const bindItem = (target: HTMLElement, targetOptions: CursorTargetOptions) => {

    target.addEventListener('mouseenter', () => {
        active(targetOptions);
    });

    target.addEventListener('mousemove', (event: MouseEvent) => {
        getCursor().style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    });

    target.addEventListener('mouseleave', () => {
        deactivate(targetOptions);
    });
};
