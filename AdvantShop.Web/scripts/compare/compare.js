let container, containerEmpty, listProperties, listProducts, btnsRemove, btnsRemoveAll;

const findRows = function () {
    const containerProducts = container.querySelector('.js-compareproduct-block-products'),
        containerProperty = container.querySelector('.js-compareproduct-block-properties');

    listProducts = !containerProducts ? [] : Array.from(containerProducts.querySelectorAll('.js-compareproduct-block-row'));
    listProperties = !containerProperty ? [] : Array.from(containerProperty.querySelectorAll('.js-compareproduct-block-row'));
};

const itemMouseOver = function (event) {
    let rowIndex;
    const { target } = event,
        row = target.closest('.js-compareproduct-block-row');

    if (row) {
        rowIndex = row.getAttribute('data-row-index');

        if (typeof rowIndex === 'undefined' && rowIndex === null) {
            return;
        }

        for (let i = 0, il = listProperties.length; i < il; i++) {
            if (listProperties[i].getAttribute('data-row-index') === rowIndex) {
                listProperties[i].classList.add('compareproduct-block-item-hover');
                break;
            }
        }

        for (let j = 0, jl = listProducts.length; j < jl; j++) {
            if (listProducts[j].getAttribute('data-row-index') === rowIndex) {
                listProducts[j].classList.add('compareproduct-block-item-hover');
                break;
            }
        }
    }
};

const itemMouseOut = function (event) {
    const { target } = event,
        row = target.closest('.js-compareproduct-block-row');
    let rowIndex;

    if (row) {
        rowIndex = row.getAttribute('data-row-index');

        for (let i = 0, il = listProperties.length; i < il; i++) {
            if (listProperties[i].getAttribute('data-row-index') === rowIndex) {
                listProperties[i].classList.remove('compareproduct-block-item-hover');
                break;
            }
        }

        for (let j = 0, jl = listProducts.length; j < jl; j++) {
            if (listProducts[j].getAttribute('data-row-index') === rowIndex) {
                listProducts[j].classList.remove('compareproduct-block-item-hover');
                break;
            }
        }
    }
};

const itemRemove = function (selector) {
    const itemsForRemove = container.querySelectorAll(selector);

    let tempElement, tempParent;
    for (let i = 0, il = itemsForRemove.length; i < il; i++) {
        tempElement = itemsForRemove[i];
        tempParent = tempElement.parentNode;
        tempParent.removeChild(tempElement);
    }

    rowsRemove();
};

const rowRemove = function (arrayIndexs) {
    let itemProduct, itemProperty, parentItemProduct, parentItemProperty;

    for (let i = 0, il = arrayIndexs.length; i < il; i++) {
        itemProduct = listProducts[arrayIndexs[i]];
        itemProperty = listProperties[arrayIndexs[i]];
        parentItemProduct = itemProduct.parentNode;
        parentItemProperty = itemProperty.parentNode;

        parentItemProduct.removeChild(itemProduct);
        parentItemProperty.removeChild(itemProperty);
    }

    findRows();

    if (listProducts.length === 0) {
        container.style.display = 'none';
        containerEmpty.style.display = 'block';
    }
};

const rowsRemove = function () {
    let isNeedRemove = true,
        row,
        childs;
    const indexesRemove = [];

    //ищем строки которые надо удалить
    for (let j = 0, jl = listProducts.length; j < jl; j++) {
        row = listProducts[j];

        childs = Array.from(row.querySelectorAll('.js-compareproduct-product-item'));

        for (let index = 0, cl = childs.length; index < cl; index++) {
            if (childs[index].innerHTML.trim().length > 0) {
                isNeedRemove = false;
                break;
            }
        }

        if (isNeedRemove === true) {
            indexesRemove.push(j);
        }

        isNeedRemove = true;
    }

    //удаляем найденые строки
    rowRemove(indexesRemove);
};

const remove = function (event) {
    // eslint-disable-next-line no-invalid-this
    const id = this.dataset.compareOfferId;
    itemRemove(`[data-compare-offer-id="${id}"]`);
    event.target.removeEventListener('click', remove, false);
};

const removeAll = function (event) {
    event.target.removeEventListener('click', removeAll, false);
    clearClickEvents(btnsRemove, remove);
    itemRemove('.js-compareproduct-removeall-container');
};

const init = function ({ align }) {
    container = document.querySelector('.js-compareproduct-container');
    containerEmpty = document.querySelector('.js-compareproduct-empty');

    if (!container) {
        return;
    }

    btnsRemove = container.querySelectorAll('[data-compare-remove]');

    btnsRemoveAll = container.querySelectorAll('[data-compare-remove-all]');

    if (btnsRemoveAll) {
        addClickEvents(btnsRemoveAll, removeAll);
    }

    //разделяем по строчкам

    findRows();
    if (align) {
        for (let index = 0, kl = listProperties.length; index < kl; index++) {
            const maxHeight = Math.max(listProperties[index].clientHeight, listProducts[index].clientHeight);

            listProperties[index].style.height = `${maxHeight}px`;
            listProducts[index].style.height = `${maxHeight}px`;
        }

        container.addEventListener('mouseover', itemMouseOver);
        container.addEventListener('mouseout', itemMouseOut);
    }

    addClickEvents(btnsRemove, remove);

    container.classList.remove('visibility-hidden');
};

const addClickEvents = function (nodes, callbackEvent) {
    for (let index = 0, cl = nodes.length; index < cl; index++) {
        nodes[index].addEventListener('click', callbackEvent);
    }
};

const clearClickEvents = function (nodes, callbackEvent) {
    for (let index = 0, cl = nodes.length; index < cl; index++) {
        nodes[index].addEventListener('click', callbackEvent);
    }
};

const load = function () {
    init(window.advantshopComparePageOptions ?? { align: true });

    window.removeEventListener('load', load, false);
};

window.addEventListener('load', load);
