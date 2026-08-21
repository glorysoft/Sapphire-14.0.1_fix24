using System;
using System.Collections.Generic;
using AdvantShop.CMS;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.CMS;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Models;

namespace AdvantShop.ViewModel.Home
{
    public partial class CarouselViewModel : BaseModel
    {
        [ObsoleteAttribute("This method is obsolete. Use field Options", false)]
        public int Speed { get; set; } = SettingsDesign.CarouselAnimationSpeed;

        [ObsoleteAttribute("This method is obsolete. Use field Options", false)]
        public int Pause { get; set; } = SettingsDesign.CarouselAnimationDelay;

        public List<Carousel> Sliders { get; set; }

        public CarouselOptions Options { get; set; }
    }

    public class CarouselOptions
    {
        public bool IsVertical { get; set; }
        public int? ScrollCount { get; set; }
        public bool Nav { get; set; } = true;
        public bool Dots { get; set; } = true;
        public int Speed { get; set; } = SettingsDesign.CarouselAnimationSpeed;
        public bool Auto { get; set; } = true;
        public int AutoPause { get; set; } = SettingsDesign.CarouselAnimationDelay;
        public int IndexActive { get; set; }
        public string PrevIcon { get; set; }
        public string NextIcon { get; set; }
        public string FilterFn { get; set; }
        public string PrevIconVertical { get; set; }
        public string NextIconVertical { get; set; }
        public string PrevClass { get; set; } = "carousel-main-prev icon-left-circle-after";
        public string NextClass { get; set; } = "carousel-main-next icon-right-circle-after";
        public string DotsClass { get; set; } = SettingsDesign.IsMobileTemplate ? "carousel-mobile-dots" : "carousel-main-dots";
        public string DotsItemClass { get; set; } = SettingsDesign.IsMobileTemplate ?  "cs-bg-i-11" : "cs-bg-i-1 carousel-main-dots-item";
        public string DotsItemSelectedClass { get; set; } = SettingsDesign.IsMobileTemplate ?  "cs-selected" : string.Empty;
        public string DotsItemInnerSelectedClass { get; set; }
        public int? VisibleMax { get; set; } = 1;
        public int? VisibleMin { get; set; }
        public string ItemSelectClass { get; set; }
        public string ItemActiveClass { get; set; }
        public string CarouselClass { get; set; } = SettingsDesign.IsMobileTemplate ? "carousel-mobile" : string.Empty;
        public bool Stretch { get; set; } = false;
        public ECarouselNavPosition NavPosition { get; set; } = ECarouselNavPosition.Inside;
        public bool InitOnLoad { get; set; }
        public bool Load { get; set; }
        public string InitFn { get; set; }
        public string ItemSelect { get; set; }
        public string InitilazeTo { get; set; }
        public Dictionary<int, CarouselOptionResponsive> Responsive { get; set; }
        public string AsNavFor { get; set; }
        public bool ScrollNav { get; set; }
        public string OnGotoStart { get; set; }
        public string OnGotoFinish { get; set; }
        public string OnUpdate { get; set; }
        public string OnCalc { get; set; }
        public bool HeightAuto { get; set; }
        public string DragContainer { get; set; }
    }

    public class CarouselOptionResponsive
    {
        public int SlidesToShow { get; set; }
    }

    public enum ECarouselNavPosition
    {
        Inside = 0,
        Outside = 1
    }
}