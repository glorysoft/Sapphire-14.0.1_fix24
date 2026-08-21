function catalogFilterService() {
    let service = this,
        filterStorage;

    service.buildUrl = function (filterSelectedItems) {
        let result = [],
            obj;

        for (const item in filterSelectedItems) {
            if (filterSelectedItems[item] == null || filterSelectedItems[item] == '') {
                continue;
            }

            if (angular.isArray(filterSelectedItems[item]) === true) {
                obj =
                    `${item 
                    }=${ 
                    filterSelectedItems[item]
                        .map((val) => angular.isArray(val) ? val.join(',') : val)
                        .join('-')}`;
            } else {
                obj = `${item  }=${  filterSelectedItems[item]}`;
            }

            result.push(obj);
        }

        return result.join('&');
    };

    service.getSelectedData = function (filterData) {
        if (filterData == null) {
            return null;
        }

        let arraySelected, selectedItems, item, nameRangeMin, nameRangeMax;

        for (let i = filterData.length - 1; i >= 0; i--) {
            item = filterData[i];

            if (item == null) continue;

            selectedItems = null;

            //ищем выбранные значения
            if (item.Control == 'select' || item.Control == 'selectSearch') {
                if (item.Selected != null && item.Selected.Id !== '0') {
                    selectedItems = item.Selected.Id;
                }
            } else {
                selectedItems = item.Values.filter((item) => item.Selected).map((item) => item.Id);
            }

            //добавляем эти значения в массив
            if (selectedItems != null && selectedItems.length > 0) {
                arraySelected ||= {};

                arraySelected[item.Type] = arraySelected[item.Type] || [];

                arraySelected[item.Type].push(selectedItems);
            }

            //добавляем текст для поиска
            if (item.Control == 'input' && item.Text.length > 0) {
                arraySelected ||= {};
                arraySelected.q = [item.Text];
            }

            //добавляем значения из ползунков
            if (item.Control == 'range') {
                arraySelected ||= {};

                if (item.Type == 'price') {
                    nameRangeMin = 'pricefrom';
                    nameRangeMax = 'priceto';
                } else {
                    nameRangeMin = `${item.Type  }_${  item.Values[0].Id  }_min`;
                    nameRangeMax = `${item.Type  }_${  item.Values[0].Id  }_max`;
                }

                if (item.Values[0].Min !== item.Values[0].CurrentMin || item.Values[0].Max !== item.Values[0].CurrentMax) {
                    //if (item.dirty) {
                    arraySelected[nameRangeMin] = [item.Values[0].CurrentMin];
                    arraySelected[nameRangeMax] = [item.Values[0].CurrentMax];
                }

                //}
            }
        }

        return arraySelected;
    };

    service.parseSearchString = function (str) {
        let index = str.indexOf('?'),
            strNormalize = str,
            parameters = {},
            arrayKeyValues,
            temp;

        if (index > -1) {
            strNormalize = strNormalize.substring(index + 1);
        }

        arrayKeyValues = strNormalize.split('&');

        for (let i = arrayKeyValues.length - 1; i >= 0; i--) {
            temp = arrayKeyValues[i].split('=');

            if (temp.length === 2) {
                parameters[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
            }
        }

        return parameters;
    };

    service.saveFilterData = function (filter) {
        filterStorage = filter;
    };

    service.getFilterData = function () {
        return filterStorage;
    };
}

export default catalogFilterService;
