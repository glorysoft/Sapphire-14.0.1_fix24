(function (ng) {
    

    const lpGridService = function ($http, $q) {
        const service = this;

        service.resolveObjectFromPath = function (object, path) {
            path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
            path = path.replace(/^\./, ''); // strip a leading dot
            const a = path.split('.');
            while (a.length) {
                const n = a.shift();
                if (n in object) {
                    object = object[n];
                } else {
                    return;
                }
            }
            return object;
        };

        service.getObjectFromProperties = function (obj, path, val) {
            const stringToPath = function (path) {
                if (typeof path !== 'string') return path;
                const output = [];
                path.split('.').forEach((item, index) => {
                    item.split(/\[([^}]+)\]/g).forEach((key) => {
                        if (key.length > 0) {
                            output.push(key);
                        }
                    });
                });

                return output;
            };

            path = stringToPath(path);

            const length = path.length;
            let current = obj;

            path.forEach((key, index) => {
                if (index === length - 1) {
                    current[key] = val;
                } else {
                    if (!current[key]) {
                        current[key] = {};
                    }
                    current = current[key];
                }
            });
        };
    };

    ng.module('lpGrid').service('lpGridService', lpGridService);

    lpGridService.$inject = ['$http', '$q'];
})(window.angular);
