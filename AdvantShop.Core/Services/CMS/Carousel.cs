//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System.Collections.Generic;
using AdvantShop.Catalog;

namespace AdvantShop.Core.Services.CMS
{
    public enum ECarouselPageMode
    {
        OneColumn = 0,
        TwoColumns = 1,
        Mobile = 2
    }


    public class Carousel
    {
        public int CarouselId { get; set; }
        public int SortOrder { get; set; }
        public string Url { get; set; }
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

        private CarouselPhoto _picture;

        public CarouselPhoto Picture
        {
            get =>
                _picture ??
                (_picture = PhotoService.GetPhotoByObjId<CarouselPhoto>(CarouselId, PhotoType.Carousel));
            set => _picture = value;
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
        
        private CarouselVideo _video;
        public CarouselVideo Video
        {
            get => _video ?? (_video = CarouselVideoService.GetCarouselVideoByCarousel(CarouselId));
            set => _video = value;
        }
    }
}