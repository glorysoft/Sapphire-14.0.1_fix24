/* @ngInject */
function productsCarouselService($http) {
    const service = this;

    service.getData = function (ids, title, type, visibleItems, carouselResponsive) {
        return $http
            .post('catalog/productsbyIds', {
                ids,
                title,
                type,
                visibleItems,
                enabledCarousel: true,
                carouselResponsive: toMvcDictionary(carouselResponsive),
            })
            .then((response) => response.data);
    };

    function toMvcDictionary(carouselResponsive) {
        const result = [];
        if (carouselResponsive != null) {
            Object.keys(carouselResponsive).forEach((key) => {
                result.push({
                    key,
                    value: carouselResponsive[key],
                });
            });
        }

        return result;
    }
}

export default productsCarouselService;
