export default class CarouselMainController {
    onGoto(slide: any) {
        if (slide.carouselItemData?.parameters?.headerTextColorCode) {
            document.documentElement.style.setProperty('--carousel-header-text-color-code', slide.carouselItemData?.parameters?.headerTextColorCode);
        }
    }
}
