(function (ng) {
    

    ng.module('validation').filter('validationUnique', () => function (errors) {
            return unboxing({ ...errors});
        });

    function unboxing(collection) {
        let result = {};

        Object.keys(collection).forEach((key) => {
            const item = collection[key];
            if (Array.isArray(item)) {
                collection[key].forEach((item) => {
                    if (item.constructor.name === 'FormController') {
                        result = merge(result, unboxing(item.$error));
                    } else {
                        result[key] = result[key] || [];
                        if (item.$error != null && item.validationInputText == null) {
                            const resultChild = unboxing(item.$error);

                            result = { ...result, ...resultChild};
                        } else {
                            result[key].push({ ...item});
                        }
                    }
                });
            }
        });

        return result;
    }

    function merge(source, dest) {
        const cloneDest = ng.copy(dest);

        Object.keys(source).forEach((key) => {
            if (cloneDest[key] != null) {
                source[key] = source[key].concat(cloneDest[key]);
                delete cloneDest[key];
            }
        });

        Object.keys(cloneDest).forEach((key) => {
            source[key] = cloneDest[key];
        });

        return source;
    }
})(window.angular);
