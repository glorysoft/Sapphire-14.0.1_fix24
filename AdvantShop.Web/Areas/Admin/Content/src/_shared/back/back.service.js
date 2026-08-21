(function () {
    const backHistory = new Map();

    const eventName = 'back';
    const backService = function () {
        const service = this;

        const pubSubExist = window.PubSub != null;

        service.pushHistoryItem = function (idRecord, data) {
            const accessMove = true;

            if (accessMove === true && backHistory.has(idRecord)) {
                backHistory.delete(idRecord);
            }

            backHistory.set(idRecord, data);
        };

        service.popHistoryItem = function () {
            const item = [...backHistory].pop();
            if (item && item.length > 0) {
                backHistory.delete(item[0]);

                if (pubSubExist) {
                    window.PubSub.publish(eventName, { old: item, current: service.getLast() });
                }

                return item;
            }

            return null;
        };

        service.getLast = function () {
            const array = [...backHistory.entries()];
            return array[array.length - 1];
        };

        service.addListener = function (callback) {
            if (pubSubExist) {
                window.PubSub.subscribe(eventName, callback);
            } else {
                console.log('Not found PubSub for observe back trigger');
            }
        };
    };

    angular.module('back').service('backService', backService);
})();
