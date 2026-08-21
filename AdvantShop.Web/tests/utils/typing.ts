export function emulateNativeTyping(element: HTMLInputElement | HTMLTextAreaElement, text: string) {
    element.focus();

    for (const char of text) {
        const keyCode = char.charCodeAt(0);

        element.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: char,
                keyCode,
                which: keyCode,
                bubbles: true,
                cancelable: true,
            }),
        );

        element.value += char;

        element.dispatchEvent(
            new Event('input', {
                bubbles: true,
                cancelable: true,
            }),
        );

        element.dispatchEvent(
            new KeyboardEvent('keyup', {
                key: char,
                keyCode,
                which: keyCode,
                bubbles: true,
                cancelable: true,
            }),
        );
    }

    element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
}
