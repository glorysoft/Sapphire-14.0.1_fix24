(function (ng) {
    

    ng.module('simpleEdit')
        .component('simpleEdit', {
            require: {},
            controller: 'SimpleEditCtrl',
            bindings: {
                onChange: '&',
                emptyText: '@',
                timeout: '<?',
                defaultValue: '@',
            },
        })
        .directive('simpleEditContent', () => ({
                require: {
                    simpleEdit: '^simpleEdit',
                },
                bindToController: true,
                controller: [
                    '$element',
                    '$scope',
                    function ($element, $scope) {
                        this.$postLink = function () {
                            const ctrl = this;

                            $element.attr('contenteditable', 'true');

                            ctrl.simpleEdit.addContent($element[0]);

                            $element.on('focus', () => {
                                let value = ctrl.simpleEdit.getValue();

                                if (value === ctrl.simpleEdit.emptyText) {
                                    value = ctrl.simpleEdit.defaultValue || '';

                                    ctrl.simpleEdit.setValue(value);

                                    setTimeout(() => {
                                        ctrl.simpleEdit.setCursorPosition(ctrl.simpleEdit.getContent());
                                    });
                                }

                                ctrl.simpleEdit.saveAsOldValue(value);

                                $scope.$apply();
                            });

                            $element.on('paste', () => {
                                ctrl.simpleEdit.change(ctrl.simpleEdit.getValue());
                                $scope.$apply();
                            });

                            let timer;
                            const time = ctrl.simpleEdit.timeout || 2000;
                            $element.on('input', () => {
                                if (timer != null) {
                                    clearTimeout(timer);
                                }

                                timer = setTimeout(() => {
                                    ctrl.simpleEdit.change(ctrl.simpleEdit.getValue());

                                    setTimeout(() => {
                                        window.getSelection().removeAllRanges();
                                        $element.blur();

                                        $scope.$digest();
                                    }, 0);

                                    $scope.$apply();
                                }, time);
                            });

                            $element.on('blur', () => {
                                const value = ctrl.simpleEdit.getValue();

                                if (value.length === 0) {
                                    ctrl.simpleEdit.setValue(ctrl.simpleEdit.defaultValue || ctrl.simpleEdit.emptyText);
                                    ctrl.simpleEdit.change(ctrl.simpleEdit.defaultValue || ctrl.simpleEdit.emptyText);
                                }
                                $scope.$apply();
                            });

                            $element.on('keydown', (event) => {
                                if (event.keyCode === 13) {
                                    event.preventDefault();
                                } else if (event.keyCode === 27) {
                                    ctrl.simpleEdit.revertValue();
                                }

                                $scope.$apply();
                            });
                        };
                    },
                ],
            }))
        .component('simpleEditTrigger', {
            require: {
                simpleEdit: '^simpleEdit',
            },
            controller: [
                '$element',
                function ($element) {
                    const ctrl = this;

                    this.$postLink = function () {
                        ctrl.simpleEdit.addTrigger($element[0]);

                        $element.on('click', () => {
                            ctrl.simpleEdit.setCursorPosition(ctrl.simpleEdit.getContent());
                        });
                    };
                },
            ],
        });
})(window.angular);
