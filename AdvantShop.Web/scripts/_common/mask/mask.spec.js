import { createTestApp } from '../../../tests/mocks/angularjs-mocks.ts';
import maskModule from './mask.module.js';
import { emulateNativeTyping } from '../../../tests/utils/typing.ts';

describe('maskControl', () => {
    const getTestApp = () => createTestApp([maskModule]);

    it('should equal model and value', () => {
        const { render } = getTestApp();
        const props = { testPhone: '' };
        const { element, scope } = render(
            `<input type="tel" id="btTel" class="input-small" ng-model="testPhone"
                                           mask-control-preset="phone" mask-control
                                           required/> />`,
            props,
        );

        emulateNativeTyping(element[0], '9999999');

        expect(element[0].value).toEqual(scope.testPhone);
    });

    it.each([
        { text: '1', result: '+1(___)___-__-__' },
        { text: '7', result: '+7(___)___-__-__' },
        { text: '998', result: '+998(__)___-__-__' },
        { text: '995', result: '+995(___)__-__-__' },
        { text: '996', result: '+996(___)__-__-__' },
        { text: '994', result: '+994(__)___-__-__' },
        { text: '993', result: '+993(__)__-__-__' },
        { text: '992', result: '+992(___)__-__-__' },
        { text: '972', result: '+972(__)___-__-__' },
        { text: '381', result: '+381(__)___-__-__' },
        { text: '380', result: '+380(__)___-__-__' },
        { text: '375', result: '+375(__)___-__-__' },
        { text: '374', result: '+374(__)__-__-__' },
        { text: '49', result: '+49(___)___-___-_' },
        { text: '358', result: '+358(__)___-__-__' },
        { text: '2134', result: '+213(4' },
    ])('should correctly detect country format "$result" by text "$text"', ({ text, result }) => {
        const { render, $injector } = getTestApp();
        const props = { testPhone: '' };

        const { element, scope } = render(
            `<input type="tel" id="btTel" class="input-small" ng-model="testPhone"
                                           mask-control-preset="phone" mask-control
                                           required/> />`,
            props,
        );

        emulateNativeTyping(element[0], text);
        scope.testPhone = text;

        $injector.get('$timeout').flush();
        scope.$digest();

        expect(element[0].value).toEqual(result);
    });

    describe('validation of initial value', () => {
        const renderWithValue = (testPhone) => {
            const { render, $injector } = getTestApp();
            const { element } = render(
                `<input type="tel" id="btTel" class="input-small" ng-model="testPhone"
                                           mask-control-preset="phone" mask-control
                                           required/> />`,
                { testPhone },
            );

            $injector.get('$timeout').flush();

            return element;
        };

        it('should be invalid when initialized with an incomplete value (browser form restoration)', () => {
            const element = renderWithValue('+7(926)123-42-6');

            expect(element[0].classList.contains('ng-invalid-mask')).toBe(true);
        });

        it('should be valid when initialized with a complete value', () => {
            const element = renderWithValue('+7(926)123-42-67');

            expect(element[0].classList.contains('ng-invalid-mask')).toBe(false);
        });
    });

    describe('for RU', () => {
        it('should not add + ', () => {
            const { render } = getTestApp();
            const props = { testPhone: '' };

            const { element } = render(
                `<input type="tel" id="btTel" class="input-small" ng-model="testPhone"
                                           mask-control-preset="phone" mask-control
                                           required/> />`,
                props,
            );

            emulateNativeTyping(element[0], '+');

            expect(element[0].value).toEqual('+_(___)___-__-__');
        });

        it('should not replace 8 when have one number', () => {
            const { render } = getTestApp();
            const props = { testPhone: '' };

            const { element } = render(
                `<input type="tel" id="btTel" class="input-small" ng-model="testPhone"
                                           mask-control-preset="phone" mask-control
                                           required/> />`,
                props,
            );

            emulateNativeTyping(element[0], '8');

            expect(element[0].value).toEqual('+8');
        });

        it('should replace 89 -> +79 ', () => {
            const { render } = getTestApp();
            const props = { testPhone: '' };

            const { element } = render(
                `<input type="tel" id="btTel" class="input-small" ng-model="testPhone"
                                           mask-control-preset="phone" mask-control
                                           required/> />`,
                props,
            );

            emulateNativeTyping(element[0], '89');

            expect(element[0].value).toEqual('+7(9__)___-__-__');
        });

        it('should auto add +7 when not have other number', () => {
            const { render } = getTestApp();
            const props = { testPhone: '' };

            const { element } = render(
                `<input type="tel" id="btTel" class="input-small" ng-model="testPhone"
                                           mask-control-preset="phone" mask-control
                                           required/> />`,
                props,
            );

            emulateNativeTyping(element[0], '902');

            expect(element[0].value).toEqual('+7(902)___-__-__');
        });
    });
});
