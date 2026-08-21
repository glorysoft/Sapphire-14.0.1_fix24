// info https://www.cleverence.ru/support/77127/

// Сырой байт 0x1D в исходнике невидим и теряется при копировании, поэтому задаём его кодом.
export const GS_SYMBOL = String.fromCharCode(0x1d);

const AI_GTIN = '01';
const AI_SERIAL = '21';

// GTIN-14, EAN-13, UPC-12, EAN-8. Сканер может отдать код без ведущих нулей,
// поэтому длину GTIN определяем перебором, а не константой.
const GTIN_LENGTHS = [14, 13, 12, 8];

// Длина серийного номера зависит от товарной группы:
// 13 — обувь, легпром; 7 — табак; 6 — молоко.
const SERIAL_LENGTHS = [13, 7, 6];

// Разрешённый алфавит серийного номера (подмножество GS1 AI 82).
const SERIAL_PATTERN = /^[!-"%-/0-9:-?A-Z_a-z]+$/u;

// Варианты криптохвоста. len: null — сегмент занимает остаток строки.
const TAIL_PROFILES = [
    [], // укороченный код маркировки — криптохвоста нет
    [{ ai: '93', len: 4 }], // молоко, вода, табак (пачка)
    [
        { ai: '8005', len: 6 },
        { ai: '93', len: 4 },
    ], // табак с МРЦ
    [
        { ai: '91', len: 4 },
        { ai: '92', len: null },
    ], // обувь, легпром
];

const ERROR_GTIN = 'При исправлении маркировки не найден GTIN';
const ERROR_GTIN_CHECK = 'При исправлении маркировки неверная контрольная цифра GTIN';
const ERROR_SERIAL = 'При исправлении маркировки не найден серийный номер';
const ERROR_TAIL = 'При исправлении маркировки не распознан криптохвост';
const ERROR_AMBIGUOUS = 'Не удалось однозначно определить структуру кода маркировки';

// Как далеко удалось продвинуться по разбору — по этому выбираем текст ошибки.
const PASSED_NOTHING = 0;
const PASSED_GTIN = 1;
const PASSED_SERIAL_AI = 2;

const gtinCheckDigit = (body) => {
    let sum = 0;

    for (let i = body.length - 1, multiplier = 3; i >= 0; i--, multiplier = 4 - multiplier) {
        sum += Number(body[i]) * multiplier;
    }

    return (10 - (sum % 10)) % 10;
};

const isValidGtin = (raw) => /^\d+$/u.test(raw) && gtinCheckDigit(raw.slice(0, -1)) === Number(raw[raw.length - 1]);

const parseTail = (rest) => {
    for (const profile of TAIL_PROFILES) {
        let position = 0;
        let matched = true;

        const segments = [];

        for (const segment of profile) {
            if (!rest.startsWith(segment.ai, position)) {
                matched = false;
                break;
            }

            position += segment.ai.length;

            const body = segment.len === null ? rest.slice(position) : rest.substr(position, segment.len);

            if (body.length === 0 || (segment.len !== null && body.length !== segment.len)) {
                matched = false;
                break;
            }

            position += body.length;
            segments.push(segment.ai + body);
        }

        // Профиль подходит, только если разобрал строку до самого конца.
        if (matched && position === rest.length) {
            return segments;
        }
    }

    return null;
};

const tryParse = (value, gtinLength, stage) => {
    const gtin = value.substr(AI_GTIN.length, gtinLength);

    if (gtin.length !== gtinLength || !isValidGtin(gtin)) {
        return [];
    }

    stage.reached = Math.max(stage.reached, PASSED_GTIN);

    const serialStart = AI_GTIN.length + gtinLength;

    if (value.substr(serialStart, AI_SERIAL.length) !== AI_SERIAL) {
        return [];
    }

    stage.reached = Math.max(stage.reached, PASSED_SERIAL_AI);

    const results = [];
    const serialValueStart = serialStart + AI_SERIAL.length;

    for (const serialLength of SERIAL_LENGTHS) {
        const serial = value.substr(serialValueStart, serialLength);

        if (serial.length !== serialLength || !SERIAL_PATTERN.test(serial)) {
            continue;
        }

        const tail = parseTail(value.slice(serialValueStart + serialLength));

        if (tail === null) {
            continue;
        }

        results.push({
            gtin: gtin.padStart(14, '0'),
            gtinPadded: gtinLength !== 14,
            serial,
            tail,
        });
    }

    return results;
};

const buildCode = ({ gtin, serial, tail }) => AI_GTIN + gtin + AI_SERIAL + serial + tail.map((segment) => GS_SYMBOL + segment).join('');

export const hasGS = (value) => typeof value === 'string' && value.includes(GS_SYMBOL);

export const fixGS = (value) => {
    if (typeof value !== 'string' || !value.startsWith(AI_GTIN)) {
        return { error: ERROR_GTIN };
    }

    // Код уже размечен — не трогаем.
    if (hasGS(value)) {
        return { data: value, gtinPadded: false };
    }

    const stage = { reached: PASSED_NOTHING };
    const parsed = [];

    for (const gtinLength of GTIN_LENGTHS) {
        parsed.push(...tryParse(value, gtinLength, stage));
    }

    const variants = new Map(parsed.map((item) => [buildCode(item), item]));

    if (variants.size > 1) {
        return { error: ERROR_AMBIGUOUS };
    }

    if (variants.size === 0) {
        if (stage.reached === PASSED_SERIAL_AI) {
            return { error: ERROR_TAIL };
        }

        // Структура кода целая, но GTIN не проходит проверку по контрольной цифре —
        // почти всегда это опечатка, а не другой формат. Диагноз точнее общего «не найден».
        const gtin = value.substr(AI_GTIN.length, 14);
        const looksLikeGtin14 = /^\d{14}$/u.test(gtin) && value.substr(AI_GTIN.length + 14, AI_SERIAL.length) === AI_SERIAL;

        if (looksLikeGtin14) {
            return { error: ERROR_GTIN_CHECK };
        }

        return { error: stage.reached === PASSED_GTIN ? ERROR_SERIAL : ERROR_GTIN };
    }

    const [[data, item]] = variants;

    return { data, gtinPadded: item.gtinPadded };
};
