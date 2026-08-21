// only js-file (not ts), because tsx replace source code and browser not find function
export function processCSS(element, selectorText, cssText, callback) {
    const pseudoElementRegExp = /(?<pseudo>:?:before|:?:after)/u;
    // eslint-disable-next-line require-unicode-regexp
    const cssBodyRegExp = /{.+\s*}$/;
    const symbolsInEndRegExp = /(?<operator>>|~|>)\s*$/u;

    const selectorParsed = parseSelector(selectorText);
    if (selectorParsed.size > 0) {
        for (const [key, value] of selectorParsed) {
            if (key?.length > 0 && element.matches(key)) {
                callback(renderCssText(cssText, key, value));
            }
        }
    }
    // Делит список селекторов по запятым только на верхнем уровне,
    // учитывая вложенность скобок (:not(:has(...), :has(...))) и атрибутов ([href="a,b"]).
    function splitTopLevelCommas(selectorTextParam) {
        const result = [];
        let depth = 0;
        let current = '';
        for (const char of selectorTextParam) {
            if (char === '(' || char === '[') {
                depth += 1;
            } else if (char === ')' || char === ']') {
                depth -= 1;
            }

            if (char === ',' && depth === 0) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        if (current.length > 0) {
            result.push(current);
        }
        return result;
    }

    function parseSelector(selectorTextParam) {
        const result = new Map();

        if (typeof selectorTextParam === 'undefined' || selectorTextParam === null) {
            return result;
        }
        const itemsList = splitTopLevelCommas(selectorTextParam)
            .map((x) => x.trim())
            .filter((x) => x.length > 0);
        for (const item of itemsList) {
            if (pseudoElementRegExp.test(item)) {
                const selectorParsedTemp = item.match(pseudoElementRegExp);
                if (selectorParsedTemp == null) {
                    result.set(item, null);
                    continue;
                }
                let selectorClean = item.replace(selectorParsedTemp[1], '');

                //браузеры вырезают символ "*" из selectorText
                if (symbolsInEndRegExp.test(selectorClean)) {
                    selectorClean += ' *';
                }

                result.set(selectorParsedTemp.length > 1 ? selectorClean : item, selectorParsedTemp.length > 1 ? selectorParsedTemp[1] : null);
            } else {
                result.set(item, null);
            }
        }
        return result;
    }

    function renderCssText(cssTextParam, selector, pseudoElement) {
        const bodyMatch = cssTextParam.match(cssBodyRegExp);
        if (bodyMatch === null) {
            if (cssTextParam.length > 0) {
                return [`\n selector: ${selector}, cssText: ${cssTextParam} !\n`, undefined];
            }
            return [undefined, ''];
        }
        return [undefined, `${pseudoElement != null ? selector + pseudoElement : selector}${bodyMatch[0]}`];
    }
}
