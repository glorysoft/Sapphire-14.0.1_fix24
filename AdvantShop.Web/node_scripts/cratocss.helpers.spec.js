/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, expect, test } from 'vitest';
import { processCSS } from './cratocss.helpers.js';

/**
 * Заглушка элемента: processCSS вызывает на элементе только matches(),
 * поэтому подменяем его, чтобы (1) зафиксировать точный список селекторов,
 * дошедших до matches, и (2) детерминированно управлять совпадением,
 * не завися от поддержки :has()/:is() в happy-dom.
 */
function createElement(matcher = () => true) {
    const matchesCalls = [];
    return {
        matchesCalls,
        matches(selector) {
            matchesCalls.push(selector);
            return typeof matcher === 'function' ? matcher(selector) : Boolean(matcher);
        },
    };
}

/** Собирает все значения, переданные в callback processCSS. */
function collect(element, selectorText, cssText) {
    const calls = [];
    processCSS(element, selectorText, cssText, (result) => calls.push(result));
    return calls;
}

describe('processCSS', () => {
    describe('selector list parsing', () => {
        test('should not split commas inside :not(:has(...), :has(...))', () => {
            const selector = '.login-auth-methods:not(:has(.login-auth-methods__route), :has(.auth-social__btns-wrap))';
            const element = createElement(() => false);

            processCSS(element, selector, `${selector} { display: none; }`, () => {});

            expect(element.matchesCalls).toEqual([selector]);
        });

        test('should not split nested :is(:has(.a), :has(.b))', () => {
            const selector = '.x:is(:has(.a), :has(.b)):not(:is(.c, .d))';
            const element = createElement(() => false);

            processCSS(element, selector, `${selector} { color: red; }`, () => {});

            expect(element.matchesCalls).toEqual([selector]);
        });

        test('should split top-level commas into separate selectors', () => {
            const element = createElement(() => false);

            processCSS(element, '.a, .b, .c', '.a, .b, .c { color: red; }', () => {});

            expect(element.matchesCalls).toEqual(['.a', '.b', '.c']);
        });

        test('should split only top level and keep nested commas intact', () => {
            const element = createElement(() => false);

            processCSS(element, '.a:has(.x, .y), .b', '.a:has(.x, .y), .b { color: red; }', () => {});

            expect(element.matchesCalls).toEqual(['.a:has(.x, .y)', '.b']);
        });

        test('should not split a comma inside an attribute selector', () => {
            const selector = '.g[data-x="a,b"]:has(.h)';
            const element = createElement(() => false);

            processCSS(element, `${selector}, .i`, `${selector}, .i { color: red; }`, () => {});

            expect(element.matchesCalls).toEqual([selector, '.i']);
        });

        test('should ignore empty list parts (dangling commas)', () => {
            const element = createElement(() => false);

            processCSS(element, '.a, , .b,', '.a, .b { color: red; }', () => {});

            expect(element.matchesCalls).toEqual(['.a', '.b']);
        });
    });

    describe('building CSS via callback', () => {
        test('should return selector + rule body for a matched selector', () => {
            const element = createElement(() => true);

            const calls = collect(element, '.foo', '.foo { display: none; }');

            expect(calls).toEqual([[undefined, '.foo{ display: none; }']]);
        });

        test('should not call callback when the selector does not match', () => {
            const element = createElement(() => false);

            const calls = collect(element, '.foo', '.foo { display: none; }');

            expect(calls).toEqual([]);
        });

        test('should return only matched selectors from a list', () => {
            const element = createElement((selector) => selector === '.b');

            const calls = collect(element, '.a, .b', '.a, .b { color: red; }');

            expect(calls).toEqual([[undefined, '.b{ color: red; }']]);
        });

        test('should call callback for each matched selector in a list', () => {
            const element = createElement(() => true);

            const calls = collect(element, '.a, .b', '.a, .b { color: red; }');

            expect(calls).toEqual([
                [undefined, '.a{ color: red; }'],
                [undefined, '.b{ color: red; }'],
            ]);
        });
    });

    describe('pseudo-elements', () => {
        test('::before — matches gets the selector without the pseudo-element, css keeps it', () => {
            const element = createElement(() => true);

            const calls = collect(element, '.foo::before', '.foo::before { content: ""; }');

            expect(element.matchesCalls).toEqual(['.foo']);
            expect(calls).toEqual([[undefined, '.foo::before{ content: ""; }']]);
        });

        test('should handle :before with a single colon', () => {
            const element = createElement(() => true);

            const calls = collect(element, '.foo:before', '.foo:before { content: ""; }');

            expect(element.matchesCalls).toEqual(['.foo']);
            expect(calls).toEqual([[undefined, '.foo:before{ content: ""; }']]);
        });

        test('should restore "*" before a pseudo-element after a combinator', () => {
            const element = createElement(() => true);

            collect(element, '.foo > ::before', '.foo > ::before { content: ""; }');

            // браузер вырезает "*" из ".foo > *::before"; функция дописывает его обратно
            expect(element.matchesCalls).toEqual(['.foo >  *']);
        });
    });

    describe('edge cases', () => {
        test('selectorText === null — callback is not called and matches is not touched', () => {
            const element = createElement(() => true);

            const calls = collect(element, null, '.foo { display: none; }');

            expect(calls).toEqual([]);
            expect(element.matchesCalls).toEqual([]);
        });

        test('selectorText === undefined — callback is not called', () => {
            const element = createElement(() => true);

            const calls = collect(element, undefined, '.foo { display: none; }');

            expect(calls).toEqual([]);
        });

        test('cssText without a rule body returns a diagnostic error instead of css', () => {
            const element = createElement(() => true);

            const calls = collect(element, '.foo', '.foo');

            expect(calls).toHaveLength(1);
            const [error, css] = calls[0];
            expect(css).toBeUndefined();
            expect(error).toContain('.foo');
        });

        test('SyntaxError regression: deeply nested commas do not throw and split only at top level', () => {
            const selector = '.a:not(:is(:has(:where(.k, .l)))), .m';
            const element = createElement(() => false);

            expect(() => processCSS(element, selector, `${selector} { display: none; }`, () => {})).not.toThrow();
            expect(element.matchesCalls).toEqual(['.a:not(:is(:has(:where(.k, .l))))', '.m']);
        });
    });
});
