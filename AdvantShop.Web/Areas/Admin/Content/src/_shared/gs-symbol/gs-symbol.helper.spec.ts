import { describe, it, expect } from 'vitest';
import { fixGS, hasGS, GS_SYMBOL } from './gs-symbol.helper';

// GTIN 04680020233884 в разных представлениях (одна и та же контрольная цифра).
const GTIN_14 = '04680020233884';
const GTIN_13 = '4680020233884';
const GTIN_8 = '46800206';

const SERIAL_13 = 'XQJnpEO2HnFmD';
const TAIL_9192 = `91EE08${GS_SYMBOL}92td023DYN6kqSss0PmMI5TEjiK93ql2Rxz7bALGeh1kc=`;

// Хвост из 91/92 отделяется от серийника GS-символом.
const shoeCode = (gtin: string) => `01${gtin}21${SERIAL_13}${GS_SYMBOL}${TAIL_9192}`;
const withoutGS = (code: string) => code.split(GS_SYMBOL).join('');

describe('gs-symbol', () => {
    it('adds GS-symbols to a shoe code (GTIN-14, serial 13, tail 91/92)', () => {
        const expected = shoeCode(GTIN_14);

        expect(fixGS(withoutGS(expected))).toStrictEqual({
            data: expected,
            gtinPadded: false,
        });
    });

    it('pads a shortened GTIN (EAN-13) to 14 digits', () => {
        const shortened = `01${GTIN_13}21${SERIAL_13}${TAIL_9192.split(GS_SYMBOL).join('')}`;

        expect(fixGS(shortened)).toStrictEqual({
            data: shoeCode(GTIN_14),
            gtinPadded: true,
        });
    });

    it('pads a shortened GTIN (EAN-8) to 14 digits', () => {
        const shortened = `01${GTIN_8}21${SERIAL_13}${TAIL_9192.split(GS_SYMBOL).join('')}`;

        expect(fixGS(shortened)).toStrictEqual({
            data: shoeCode(GTIN_8.padStart(14, '0')),
            gtinPadded: true,
        });
    });

    it('handles a short code without a crypto tail', () => {
        const code = `01${GTIN_14}21${SERIAL_13}`;

        expect(fixGS(code)).toStrictEqual({
            data: code,
            gtinPadded: false,
        });
    });

    it('handles a milk code (serial 6, tail 93)', () => {
        expect(fixGS(`01${GTIN_14}21ABCDEF93XYZW`)).toStrictEqual({
            data: `01${GTIN_14}21ABCDEF${GS_SYMBOL}93XYZW`,
            gtinPadded: false,
        });
    });

    it('handles a tobacco code (serial 7, tail 8005 + 93)', () => {
        expect(fixGS(`01${GTIN_14}21ABCDEFG8005123456937ptQ`)).toStrictEqual({
            data: `01${GTIN_14}21ABCDEFG${GS_SYMBOL}8005123456${GS_SYMBOL}937ptQ`,
            gtinPadded: false,
        });
    });

    it('leaves a code that already has GS-symbols untouched', () => {
        const code = shoeCode(GTIN_14);

        expect(fixGS(code)).toStrictEqual({
            data: code,
            gtinPadded: false,
        });
    });

    it('error when not start with "01"', () => {
        expect(fixGS(`${GTIN_14}21${SERIAL_13}`)).toStrictEqual({
            error: 'При исправлении маркировки не найден GTIN',
        });
    });

    it('error when GTIN check digit is wrong', () => {
        expect(fixGS(`010468002023388521${SERIAL_13}`)).toStrictEqual({
            error: 'При исправлении маркировки неверная контрольная цифра GTIN',
        });
    });

    it('error when not found serial with start "21"', () => {
        expect(fixGS(`01${GTIN_14}${SERIAL_13}`)).toStrictEqual({
            error: 'При исправлении маркировки не найден серийный номер',
        });
    });

    it('error when the crypto tail matches no known profile', () => {
        expect(fixGS(`01${GTIN_14}21${SERIAL_13}ZZ1234`)).toStrictEqual({
            error: 'При исправлении маркировки не распознан криптохвост',
        });
    });

    it('error when the structure is ambiguous', () => {
        // serial 13 без хвоста и serial 7 + хвост 93 разбирают одну и ту же строку.
        expect(fixGS(`01${GTIN_14}21ABCDEFG93WXYZ`)).toStrictEqual({
            error: 'Не удалось однозначно определить структуру кода маркировки',
        });
    });

    it('should return true, when has GS-symbol', () => {
        expect(hasGS(shoeCode(GTIN_14))).toBeTruthy();
    });

    it('should return false, when not has GS-symbol', () => {
        expect(hasGS(withoutGS(shoeCode(GTIN_14)))).toBeFalsy();
    });
});
