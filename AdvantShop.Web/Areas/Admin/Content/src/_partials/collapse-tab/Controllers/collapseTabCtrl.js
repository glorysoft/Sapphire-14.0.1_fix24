/* @ngInject */
const CollapseTabCtrl = function ($translate) {
    const ctrl = this;

    ctrl.init = function init(tabs) {
        if (tabs.length === 0) {
            return;
        }
        ctrl.inProcess = true;
        const dropdownWidth = 0;

        let tabsChild, tabsChildCount, widthChild, dropdownWrap, otherEl, otherElWidth;

        const dropdownHTML =
            `<a class="btn dropdown-toggle" data-bs-toggle="dropdown" href="#">${$translate.instant(
                'Admin.Js.CollapseTab.More',
            )}<span class="caret"></span>` +
            `</a>` +
            `<ul class="dropdown-menu pull-left dropdown-menu-right tabsCollapsed">` +
            `</ul>`;

        let i;

        for (i = 0; i < tabs.length; i++) {
            otherEl = tabs[i].querySelector('.js-not-tabs');

            if (otherEl !== null) {
                otherElWidth = otherEl.offsetWidth;
            } else {
                otherElWidth = 0;
            }

            tabsChild = tabs[i].children;

            tabsChildCount = tabsChild.length;

            let j;
            for (j = 0; j < tabsChild.length; j++) {
                widthChild = tabsChild[j].offsetWidth;
                tabsChild[j].dataset.widthEl = widthChild;
            }

            dropdownWrap = document.createElement('li');

            dropdownWrap.classList.add('js-last-tab');

            dropdownWrap.classList.add('hidden');

            dropdownWrap.style.width = `${83}px`;

            dropdownWrap.innerHTML = dropdownHTML;

            if (otherEl !== null) {
                tabs[i].insertBefore(dropdownWrap, tabsChild[tabsChildCount - 1]);
            } else {
                tabs[i].appendChild(dropdownWrap);
            }

            ctrl.autocollapse(tabs[i], dropdownWidth, otherEl, otherElWidth);
        }

        ctrl.resizeEvent();

        ctrl.recalc = () => {
            ctrl.inProcess = true;
            for (const item of tabs) {
                ctrl.autocollapse(item, dropdownWidth, otherEl, otherElWidth);
            }
            setTimeout(() => {
                ctrl.inProcess = false;
            });
        };

        tabs.addClass('nav-collapse-tab--initialized');
        ctrl.initialized = true;
        ctrl.inProcess = false;
    };

    ctrl.resizeEvent = function () {
        window.addEventListener('resize', () => {
            ctrl.recalc();
        });
    };

    ctrl.autocollapse = function (tabs, dropdownWidth, otherEl, otherElWidth) {
        const dropdown = tabs.querySelector('.js-last-tab'),
            dropdownList = tabs.querySelector('.tabsCollapsed'),
            tabsWidth = tabs.offsetWidth;

        let childList = tabs.children,
            widthChildren = 0,
            i,
            children,
            tabsCollection,
            count,
            dropdownListEl,
            collapsedItem;

        if (otherEl) {
            childList = [].slice.apply(childList, [0, -2]);
        } else {
            childList = [].slice.apply(childList, [0, -1]);
        }

        for (i = 0; i < childList.length; i++) {
            widthChildren += parseFloat(childList[i].dataset.widthEl);
        }

        if (ctrl.flag) {
            dropdownWidth = dropdown.offsetWidth;
        }

        if (widthChildren + parseFloat(dropdownWidth) + parseFloat(otherElWidth) >= tabsWidth) {
            ctrl.flag = true;

            if (ctrl.flag) {
                dropdownWidth = 83;
            }

            while (widthChildren + parseFloat(dropdownWidth) + parseFloat(otherElWidth) >= tabsWidth) {
                dropdown.classList.remove('hidden');

                tabsCollection = tabs.children;

                if (otherEl) {
                    children = [].slice.apply(tabsCollection, [0, -2]);
                } else {
                    children = [].slice.apply(tabsCollection, [0, -1]);
                }

                if (children) {
                    count = children.length;

                    if (count <= 0) {
                        break;
                    }

                    widthChildren -= parseFloat(children[count - 1].dataset.widthEl);

                    if (count > 0) {
                        collapsedItem = children[count - 1];

                        // eslint-disable-next-line max-depth
                        if (dropdownList.children.length === 0) {
                            dropdownList.appendChild(collapsedItem);
                        } else {
                            dropdownList.insertBefore(collapsedItem, dropdownList.children[0]);
                        }
                    }
                }
            }
        } else {
            dropdownListEl = dropdownList.children;

            if (dropdownListEl.length !== 0) {
                if (tabsWidth < widthChildren + parseFloat(dropdownWidth) + parseFloat(dropdownListEl[dropdownListEl.length - 1].dataset.widthEl)) {
                } else {
                    while (
                        dropdownListEl.length > 0 &&
                        tabsWidth >=
                            widthChildren +
                                parseFloat(dropdownListEl[dropdownListEl.length - 1].dataset.widthEl) +
                                (dropdownListEl.length > 1 ? parseFloat(dropdownWidth) : 0) +
                                parseFloat(otherElWidth)
                    ) {
                        if (dropdownListEl.length === 1) {
                            dropdown.classList.add('hidden');
                        }

                        count = dropdownListEl.length;

                        widthChildren += parseFloat(dropdownListEl[dropdownListEl.length - 1].dataset.widthEl);

                        if (otherEl != null) {
                            tabs.insertBefore(dropdownListEl[0], tabs.children[tabs.children.length - 2]);
                            //tabs.insertBefore(dropdownListEl[dropdownListEl.length - 1], tabs.children[tabs.children.length - 2]);
                        } else {
                            tabs.insertBefore(dropdownListEl[0], tabs.children[tabs.children.length - 1]);
                            //tabs.insertBefore(dropdownListEl[dropdownListEl.length - 1], tabs.children[tabs.children.length - 1]);
                        }

                        dropdownListEl = dropdownList.children;
                    }

                    if (widthChildren + parseFloat(dropdownWidth) + parseFloat(otherElWidth) >= tabsWidth) {
                        ctrl.autocollapse(tabs, dropdownWidth, otherEl, otherElWidth);
                    }
                }
            }
        }
    };
};

angular.module('collapseTab').controller('CollapseTabCtrl', CollapseTabCtrl);
