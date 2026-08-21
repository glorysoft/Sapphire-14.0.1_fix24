(function (ng) {
    

    let counter = 0;

    ng.module('cmStat').directive('cmStat', [
        '$parse',
        'cmStatService',
        function ($parse, cmStatService) {
            return {
                controller: 'CmStatCTrl',
                controllerAs: 'cmStat',
                bindToController: true,
                link (scope, element, attrs, ctrl) {
                    ctrl.onTick = attrs.onTick != null ? $parse(attrs.onTick) : null;
                    ctrl.onFinish = attrs.onFinish != null ? $parse(attrs.onFinish) : null;

                    if (ctrl.onTick != null || ctrl.onFinish != null) {
                        cmStatService.addCallback(`cmStat_${  counter += 1}`, (data) => {
                            if (ctrl.onTick != null) {
                                ctrl.onTick(scope, { data });
                            }

                            if (ctrl.onFinish != null && data.ProcessedPercent === 100 && !data.IsRun) {
                                ctrl.onFinish(scope, { data });
                            }
                        });
                    }
                },
            };
        },
    ]);
})(window.angular);
