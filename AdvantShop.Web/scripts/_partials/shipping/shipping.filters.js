export const visibleShippings = () => (input, isCollapsed, countVisible, selectedIndex) => {
    if (!isCollapsed || !input) {
        return input;
    }

    let inputCopy;
    if (countVisible < selectedIndex + 1) {
        inputCopy = input.slice(0, countVisible - 1);
        inputCopy.push(input[selectedIndex]);
    } else {
        inputCopy = input.slice(0, countVisible);
    }
    return inputCopy;
};
