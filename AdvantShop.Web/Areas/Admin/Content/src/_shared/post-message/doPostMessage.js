(function (document, window) {
    

    const deferList = {};

    document.addEventListener('DOMContentLoaded', () => {
        const callbacks = {
            scrollTop () {
                window.scrollTo(0, 0);
            },
            openChat () {
                /* eslint-disable no-undef*/
                jivo_api.open();
                setTimeout(() => {
                    document.querySelector('#jivo-iframe-container').classList.add('shown');
                }, 30);
            },
            //Модальное окно (затемнение)
            removeModalBackground () {
                const iframeWrap = document.querySelector('.js-iframe-wrap');
                const iframe = document.querySelector('iframe');
                const modalBackground = document.querySelectorAll('.post-modal-background');

                if (iframeWrap !== null && modalBackground !== null && modalBackground.length > 0 && iframe !== null) {
                    if (modalBackground.length === 1) {
                        iframe.classList.remove('iframe');
                    }

                    iframeWrap.removeChild(modalBackground[0]);
                }
            },
            //Открыть модальное окно
            openModal () {
                const el = document.createElement('div');
                const iframe = document.querySelector('iframe');
                const iframeWrap = document.querySelector('.js-iframe-wrap');
                if (iframeWrap !== null && iframe !== null) {
                    iframe.classList.add('iframe');
                    el.classList.add('post-modal-background');
                    //el.addEventListener('click', function removeBackgroundModal(e) {
                    //    doPostMessage(iframe, 'closeModal');
                    //    iframe.classList.remove('iframe');
                    //    iframeWrap.removeChild(el);
                    //    el.removeEventListener('click', removeBackgroundModal);
                    //});

                    iframeWrap.appendChild(el);
                }
            },
            //Высота Iframe
            iframeHeight (postData) {
                //doPostMessage(window, 'iframeHeight');

                const iframe = document.querySelector('iframe');

                if (iframe !== null) {
                    iframe.style.height = `${postData.height  }px`;
                }
            },
            openSupportModel () {
                const iframe = document.querySelector('iframe');

                if (iframe !== null) {
                    doPostMessage(
                        iframe,
                        JSON.stringify({
                            name: 'modalPosition',
                            windowScrollHeight: window.pageYOffset,
                        }),
                    );
                }
            },
            tariffs () {
                const iframe = document.querySelector('iframe');

                if (iframe !== null) {
                    iframe.addEventListener('load', () => {
                        window.scrollTo(0, 0);
                    });
                }
            },
            getPageYOffset () {
                const iframe = document.querySelector('iframe');

                if (iframe !== null) {
                    doPostMessage(
                        iframe,
                        JSON.stringify({
                            name: 'pageYOffset',
                            pageYOffset: window.pageYOffset,
                        }),
                    );
                }
            },
        };

        window.addEventListener(
            'message',
            (event) => {
                const postData = getDataAsJSON(event.data);

                const postDataIsString = postData == null && typeof event.data === 'string' && event.data != null && event.data.length > 0;

                if (postDataIsString === false && postData != null && postData.name != null && callbacks[postData.name] != null) {
                    callbacks[postData.name](postData);
                } else if (postDataIsString === true && callbacks[event.data] != null) {
                    callbacks[event.data]();
                }
                if (postData != null && postData.name != null) {
                    checkDefer(postData.name, postData);
                } else if (postDataIsString === true) {
                    checkDefer(event.data);
                }
            },
            false,
        );

        doPostMessage(document.querySelector('iframe'), 'readyPost');

        doPostMessageWait('iframeHeight', callbacks.iframeHeight);

        window.addEventListener('resize', () => {
            doPostMessage(document.querySelector('iframe'), 'readyPost');
        });
    });

    function getDataAsJSON(data) {
        let result;

        try {
            result = JSON.parse(data);
        } catch (e) {
            result = null;
        }

        return result;
    }

    function getEl(element) {
        return element != null && typeof element === 'string' ? document.querySelector(element) : element;
    }

    function doPostMessage(otherWindow, message, targetOrigin) {
        const origin = targetOrigin || '*';
        const obj = getEl(otherWindow);

        if (obj != null) {
            //window может быть iframe
            (obj.contentWindow || obj).postMessage(message, origin);
        }
    }

    function doPostMessageWait(message, callback) {
        if (deferList[message] != null) {
            callback();
        } else {
            deferList[message] = deferList[message] || { callbackList: [] };
            deferList[message].callbackList.push(callback);
        }
    }

    function checkDefer(messageName, data) {
        if (deferList[messageName] != null && deferList[messageName].callbackList != null && deferList[messageName].callbackList.length > 0) {
            deferList[messageName].callbackList.forEach((callback) => {
                callback(data);
            });
        } else {
            deferList[messageName] = { name: messageName };
        }
    }

    function deleteCallback(message) {
        delete deferList[message];
    }

    window.doPostMessage = doPostMessage;
    window.doPostMessageWait = doPostMessageWait;
    window.doPostMessageDeleteCallback = deleteCallback;
})(document, window);
