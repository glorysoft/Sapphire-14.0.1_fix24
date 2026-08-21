(function (ng) {
    

    /* @ngInject */
    const NotificationMessageCtrl = function (domService, $document, $scope, $element, $http, $window, urlHelper, $attrs) {
        let ctrl = this,
            document = $document[0],
            timer,
            documentIsVisible = $document[0].visibilityState === 'visible',
            adminInformerShared = new SJ.iwc.SharedData(`${SJ.iwc.getLocalStoragePrefix()  }_adminInformer`);

        ctrl.$onInit = function () {
            ctrl.shown = false;
            ctrl.iframes = document.querySelectorAll('iframe');

            ctrl.fetch();

            adminInformerShared.onChanged((data) => {
                ctrl.data = data;
            });
        };

        ctrl.fetch = function () {
            if (documentIsVisible !== true) return;

            const notify = urlHelper.getUrlParam('notify');

            $http.get('common/getNotifications', { params: { notify } }).then((response) => {
                if (ctrl.data && ctrl.data.unseenCount < response.data.unseenCount && $document[0].visibilityState === 'visible') {
                    const audio = new Audio('../areas/admin/content/src/_shared/notification-message/sounds/message.mp3');
                    audio.play();
                }
                ctrl.data = response.data;

                try {
                    adminInformerShared.set(response.data);
                } catch (e) {
                    console.log(e);
                }

                if (timer != null) {
                    clearTimeout(timer);
                }
                timer = setTimeout(ctrl.fetch, 30 * 1000);
            });
        };

        $document.on('visibilitychange', () => {
            documentIsVisible = $document[0].visibilityState === 'visible';
            if (documentIsVisible === true) {
                ctrl.fetch();
            }
        });

        ctrl.$postLink = function () {
            ctrl.element = $element[0];
            ctrl.notificationMessageWrap = ctrl.element.querySelector('.notification-message-wrap');
            if (ctrl.notificationMessageWrap != null) {
                ctrl.elCoordinates = ctrl.notificationMessageWrap.getBoundingClientRect();
            } else {
                return;
            }

            ctrl.checkPosition(ctrl.elCoordinates);

            let resizeTimer;
            $window.addEventListener('resize', () => {
                if (resizeTimer != null) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(() => {
                    ctrl.checkPosition(ctrl.notificationMessageWrap.getBoundingClientRect());
                }, 500);
            });
        };

        ctrl.checkPosition = function (elCoordinates) {
            let marginLeft;
            const offsetRight = parseFloat(ctrl.element.getAttribute('offset-right')) || 0;
            const body = $document[0].body;

            ctrl.notificationMessageWrap.style.marginLeft = 0;

            if (body.offsetWidth < body.scrollWidth) {
                marginLeft = body.offsetWidth - body.scrollWidth;
            } else if ($window.innerWidth < elCoordinates.right) {
                marginLeft = $window.innerWidth - elCoordinates.right;
            }

            if (marginLeft != null) {
                ctrl.notificationMessageWrap.style.marginLeft = `${marginLeft - offsetRight  }px`;
            }
        };

        ctrl.closeNotificationMessage = function (e) {
            const target = domService.closest(e.target, '.notification-message-wrap');
            if (target != null && target.classList.contains('notification-message-wrap')) {
                
            } else {
                ctrl.shown = false;
                ctrl.enableIframes(ctrl.iframes);
                document.removeEventListener('click', ctrl.closeNotificationMessage);
                $scope.$digest();
            }
        };

        ctrl.disabledIframes = function (iframes) {
            if (iframes.length === 0) return;
            for (let i = 0; i < iframes.length; i++) {
                iframes[i].style.pointerEvents = 'none';
            }
        };

        ctrl.enableIframes = function (iframes) {
            if (iframes.length === 0) return;
            for (let i = 0; i < iframes.length; i++) {
                iframes[i].style.pointerEvents = 'auto';
            }
        };

        ctrl.toggleNotificationMessage = function (event) {
            ctrl.shown = ctrl.shown == false;
            if (!ctrl.shown) {
                ctrl.enableIframes(ctrl.iframes);
                document.removeEventListener('click', ctrl.closeNotificationMessage);
            } else {
                ctrl.disabledIframes(ctrl.iframes);
                event.stopPropagation();
                document.addEventListener('click', ctrl.closeNotificationMessage);
            }
        };

        ctrl.calcPositionNotificationMessage = function () {
            document.body.style.overflowY = 'hidden';
            if (window.innerWidth < ctrl.elCoordinates.right) {
                const marginLeft = window.innerWidth - ctrl.notificationMessageWrap.getBoundingClientRect().right;
                ctrl.notificationMessageWrap.style.marginLeft = `${marginLeft - (parseFloat($attrs.offsetRight) || 0)  }px`;
            }
            document.body.style.overflowY = 'auto';
        };

        ctrl.goTo = function (event, item) {
            if (item == null || item.Link == null || item.Link.length === 0) return;

            let url = item.Link;

            if (!item.Seen) {
                url = '';
                const urlArr = item.Link.split('#');

                for (let i = 0; i < urlArr.length; i++) {
                    let urlPart = urlArr[i];
                    if (i === 0) {
                        urlPart += `${urlPart.indexOf('?') === -1 ? '?' : '&'  }notify=${  item.InformerId}`;
                    }
                    url += (i !== 0 ? '#' : '') + urlPart;
                }
            }

            event.preventDefault();
            window.location.assign(url);
        };

        ctrl.hideNotification = function (event, item) {
            event.preventDefault();
            event.stopPropagation();

            $http.get('common/getNotifications', { params: { notify: item.InformerId } }).then((response) => {
                ctrl.data = response.data;
            });
        };

        ctrl.getIcon = function (type) {
            let icon_group, icon_class;

            if (['vk', 'facebook', 'telegram', 'ok'].indexOf(type) !== -1) {
                icon_group = 'fab';
            } else {
                icon_group = 'fa';
            }

            if (type == 'email') {
                icon_class = 'envelope';
            } else if (type == 'review') {
                icon_class = 'commenting';
            } else if (type == 'ok') {
                icon_class = 'odnoklassniki';
            } else {
                icon_class = type;
            }

            return [icon_group, `fa-${  icon_class}`];
        };
    };

    NotificationMessageCtrl.$inject = ['domService', '$document', '$scope', '$element', '$http', '$window', 'urlHelper'];

    ng.module('notificationMessage', []).controller('NotificationMessageCtrl', NotificationMessageCtrl);
})(window.angular);
