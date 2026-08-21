(function (ng) {
    

    const transformerService = function () {
        const service = this;
        let scrollWidth;
        let storage = [];

        service.getTransformersStorage = function () {
            return storage;
        };

        service.addInStorage = function (transformer) {
            const sortOrder = transformer.sortOrder || 0;
            let isPasted = false;

            if (storage.length > 0) {
                for (let i = 0, len = storage.length; i < len; i++) {
                    if (sortOrder > storage[i].sortOrder) {
                        storage.splice(i, 0, transformer);
                        isPasted = true;
                        break;
                    }
                }
            }

            if (isPasted === false) {
                storage.push(transformer);
            }
        };

        service.getOffsetByParents = function (self) {
            let result = 0;
            for (let i = 0, len = storage.length; i < len; i++) {
                if (storage[i] === self) {
                    break;
                } else if (storage[i].scrollOver === true || storage[i].freeze === true) {
                    result += storage[i].getBottomPoint();
                }
            }

            return result;
        };

        service.getSummHeightTransformers = function (self) {
            let result = 0;
            for (let i = 0, len = storage.length; i < len; i++) {
                if (storage[i] === self) {
                    break;
                } else if (storage[i].scrollOver === true || storage[i].freeze === true) {
                    result += storage[i].getHeightElement();
                }
            }

            return result;
        };

        service.getWidthScroll = function () {
            const div = document.createElement('div');
            div.style.overflowY = 'scroll';
            div.style.width = '50px';
            div.style.height = '50px';
            document.body.append(div);
            scrollWidth = div.offsetWidth - div.clientWidth;
            div.remove();
            return scrollWidth;
        };

        service.deleteFromStorageDestroyedCtrl = function (ctrl) {
            storage = storage.filter((it) => it !== ctrl);
        };
    };

    angular.module('transformer').service('transformerService', transformerService);

    transformerService.$inject = [];
})(window.angular);
