using System.Collections.Generic;
using AdvantShop.Catalog;
using AdvantShop.Core.Services.CMS;
using AdvantShop.Web.Infrastructure.Admin;

namespace AdvantShop.Web.Admin.Models.Cms.Carousel
{
    public class CarouselResultFilterModel : BaseFilterModel
    {
        public int CarouselId { get; set; }
        public int SortOrder { get; set; }
        public string CarouselUrl { get; set; }
        public bool Enabled { set; get; }

        public bool DisplayInOneColumn { get; set; }
        public bool DisplayInTwoColumns { get; set; }
        public bool DisplayInMobile { get; set; }
        public bool Blank { get; set; }
        public int Obscuring { get; set; }
        public int MarginTop { get; set; }
        public int MarginBottom { get; set; }
        public int MarginLeft { get; set; }
        public int MarginRight { get; set; }
        public string HeaderTextColorCode { get; set; }
        public bool IsVideo { get; set; }
        public string ImageSrc { get; set; }
        public string PhotoName { get; set; }
        public string Description { get; set; }
        public string TextTitle { get; set; }

        private CarouselPhoto _picture;

        public CarouselPhoto Picture
        {
            get
            {
                return _picture ??
                       (_picture = PhotoService.GetPhotoByObjId<CarouselPhoto>(CarouselId, PhotoType.Carousel));
            }
            set { _picture = value; }
        }
        
        private CarouselText _text;
        public CarouselText Text
        {
            get => _text ?? (_text = CarouselService.GetCarouselTextByCarousel(CarouselId));
            set => _text = value;
        }
        
        private List<CarouselButton> _buttons;
        public List<CarouselButton> Buttons
        {
            get => _buttons ?? (_buttons = CarouselService.GetCarouselButtonsByCarousel(CarouselId));
            set => _buttons = value;
        }
        
        public string VideoSrc { get; set; }
        public string VideoName { get; set; }
        
        private CarouselVideo _video;
        public CarouselVideo Video
        {
            get => _video ?? (_video = CarouselVideoService.GetCarouselVideoByCarousel(CarouselId));
            set => _video = value;
        }
    }
}