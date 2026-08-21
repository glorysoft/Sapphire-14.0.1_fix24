import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { GS_SYMBOL } from './gs-symbol.helper';
import './gs-symbol.js';

const CODE_WITHOUT_GS = '010468002023388421XQJnpEO2HnFmD91EE0892td023DYN';
const CODE_WITH_GS = `010468002023388421XQJnpEO2HnFmD${GS_SYMBOL}91EE08${GS_SYMBOL}92td023DYN`;

const DEBOUNCE_MS = 500;

interface ToasterMock {
    error: Mock;
    warning: Mock;
}

interface CodeScope extends ng.IScope {
    code: string;
}

interface CompiledInput {
    scope: CodeScope;
    input: ng.IAugmentedJQuery;
}

describe('gsSymbol directive', () => {
    let toaster: ToasterMock;
    let autoFix: boolean;

    // Без angular-mocks: поднимаем инжектор вручную, таймеры двигаем vitest'ом.
    const compileInput = (): CompiledInput => {
        const injector = angular.injector([
            'ng',
            'gs-symbol',
            [
                '$provide',
                ($provide: ng.auto.IProvideService) => {
                    $provide.value('toaster', toaster);
                    $provide.value('settingFeaturesKey', { GsSymbolAutoFix: 'GsSymbolAutoFix' });
                    $provide.factory('settingFeaturesService', [
                        '$q',
                        ($q: ng.IQService) => ({
                            isEnabled: (): ng.IPromise<boolean> => $q.resolve(autoFix),
                        }),
                    ]);
                },
            ],
        ]);

        const rootScope = injector.get<ng.IRootScopeService>('$rootScope');
        const scope = rootScope.$new() as CodeScope;
        scope.code = '';

        const input = injector.get<ng.ICompileService>('$compile')('<input ng-model="code" data-gs-symbol />')(scope);
        // Промис настройки резолвится только на digest корневого scope.
        rootScope.$digest();

        return { scope, input };
    };

    const typeInto = ({ input }: CompiledInput, value: string) => {
        const element = input[0] as HTMLInputElement;
        element.value = value;
        element.dispatchEvent(new Event('input'));
        vi.advanceTimersByTime(DEBOUNCE_MS);
    };

    beforeEach(() => {
        vi.useFakeTimers();
        toaster = { error: vi.fn(), warning: vi.fn() };
        autoFix = true;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('writes the fixed code into ngModel, not only into the DOM', () => {
        const context = compileInput();

        typeInto(context, CODE_WITHOUT_GS);

        expect(context.scope.code).toBe(CODE_WITH_GS);
        expect((context.input[0] as HTMLInputElement).value).toBe(CODE_WITH_GS);
    });

    // Сканер отдаёт GS как Alt+0 2 9 на цифровой клавиатуре: символ в input не попадает,
    // директива запоминает позицию и вставляет его сама.
    const scan = ({ input }: CompiledInput, raw: string, gsPositions: number[]) => {
        const element = input[0] as HTMLInputElement;

        for (let i = 0; i < raw.length; i++) {
            if (gsPositions.includes(i)) {
                for (const digit of ['0', '2', '9']) {
                    element.dispatchEvent(new KeyboardEvent('keydown', { key: digit, altKey: true }));
                }
            }

            element.dispatchEvent(new KeyboardEvent('keydown', { key: raw[i], altKey: false }));
            element.value = raw.slice(0, i + 1);
            element.dispatchEvent(new Event('input'));
        }

        vi.advanceTimersByTime(DEBOUNCE_MS);
    };

    it('inserts every scanned GS at its own position, not shifted by the previous one', () => {
        const context = compileInput();

        scan(context, CODE_WITHOUT_GS, [31, 37]);

        expect(context.scope.code).toBe(CODE_WITH_GS);
    });

    it('reports an error and keeps the model untouched when the code cannot be parsed', () => {
        const context = compileInput();

        typeInto(context, '01046800202338842');

        expect(toaster.error).toHaveBeenCalledTimes(1);
        expect(context.scope.code).toBe('01046800202338842');
    });

    it('reports a padded GTIN', () => {
        const context = compileInput();

        typeInto(context, '01468002023388421XQJnpEO2HnFmD91EE0892td023DYN');

        expect(toaster.warning).toHaveBeenCalledTimes(1);
        expect(context.scope.code).toBe(CODE_WITH_GS);
    });

    it('does nothing when the feature is disabled', () => {
        autoFix = false;

        const context = compileInput();

        typeInto(context, CODE_WITHOUT_GS);

        expect(context.scope.code).toBe(CODE_WITHOUT_GS);
        expect(toaster.error).not.toHaveBeenCalled();
    });
});
