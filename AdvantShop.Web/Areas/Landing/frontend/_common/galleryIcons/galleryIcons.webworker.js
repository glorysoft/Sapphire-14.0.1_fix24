function mergeStyles(items) {
    const result = {};
    const destCopy = { ...items[0]};
    const listCopy = items.slice(1);

    const keyList = Object.keys(destCopy.iconList);

    keyList.forEach((key) => {
        result[key] = [{ prefix: destCopy.prefix, icon: destCopy.iconList[key] }];

        if (listCopy.length > 0) {
            listCopy.forEach((item) => {
                if (item.iconList[key] != null) {
                    result[key].push({ prefix: item.prefix, icon: item.iconList[key] });

                    delete item.iconList[key];
                }
            });
        }

        delete destCopy.iconList[key];
    });

    return Object.assign(result, listCopy.length > 0 ? mergeStyles(listCopy) : null);
}

export const dataProcess = (data, dataGroups) => {
    const dataSorted = [];
    dataGroups.forEach((groupName) => {
        const obj = {
            prefix: groupName,
            iconList: { ...data[groupName]},
        };

        dataSorted.push(obj);
    });

    dataSorted.sort((a, b) => Object.keys(a.iconList).length - Object.keys(b.iconList).length);

    return mergeStyles(dataSorted);
};
