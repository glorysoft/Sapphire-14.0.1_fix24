import type { IController } from 'angular';
import { smoothScroll } from '@/scripts/_common/carousel/carouselNative.helpers';

interface CompareExtend extends IController {

  onGotoStart(distance: number, useAnimate: boolean, speed: number): void;

  onCalc(carousel: any): void;

  updateCarousel(): void;

  initCarousel(carousel: any): void;

  propertiesList?: HTMLElement| null;
  productsCarousel: any;
}

export default class CompareExtendCtrl implements CompareExtend {
  public propertiesList?: HTMLElement | null;
  public productsCarousel: any;

  $postLink() {
    this.propertiesList = document.querySelector('.compareproduct-scroll-container');
  }

  onGotoStart(distance: number, useAnimate: boolean, speed: number) {
    if (this.propertiesList) {
      smoothScroll(this.propertiesList, Math.abs(distance), speed);
    }
  }

  onCalc(carousel) {
    if (this.propertiesList) {
      this.propertiesList.style.setProperty('--properties-item-width', `${carousel.itemsSize.width}px`);
    }
  }

  updateCarousel() {
    if (this.productsCarousel) {
      this.productsCarousel.update();
    }
  }

  initCarousel(carousel) {
    this.productsCarousel = carousel;
  }
}
