using System;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Screenshot;
using AdvantShop.Core.Services.CMS;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Web.Admin.Models.Cms.Carousel;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Cms.Carousel
{
    public class UpdateCarouselHandler : ICommandHandler
    {
        private readonly CarouselFilterModel _model;

        public UpdateCarouselHandler(CarouselFilterModel model)
        {
            _model = model;
        }

        public void Execute()
        {
            Validate();

            var carousel = CarouselService.GetCarousel(_model.CarouselId);

            carousel.Url = _model.CarouselUrl ?? string.Empty;
            carousel.SortOrder = Convert.ToInt32(_model.SortOrder);
            carousel.Enabled = (bool)_model.Enabled;
            carousel.DisplayInOneColumn = (bool)_model.DisplayInOneColumn;
            carousel.DisplayInTwoColumns = (bool)_model.DisplayInTwoColumns;
            carousel.DisplayInMobile = (bool)_model.DisplayInMobile;
            carousel.Blank = (bool)_model.Blank;
            carousel.Obscuring = _model.Obscuring ?? carousel.Obscuring;
            carousel.MarginTop = _model.MarginTop ?? carousel.MarginTop;
            carousel.MarginBottom = _model.MarginBottom ?? carousel.MarginBottom;
            carousel.MarginLeft = _model.MarginLeft ?? carousel.MarginLeft;
            carousel.MarginRight = _model.MarginRight ?? carousel.MarginRight;
            carousel.HeaderTextColorCode = _model.HeaderTextColorCode;
            carousel.IsVideo = _model.IsVideo ?? carousel.IsVideo;

            CarouselService.UpdateCarousel(carousel);

            UpdateCarouselPhoto(carousel);

            UpdateStoreScreenShotInBackground(carousel);

            AddUpdateCarouselText();

            AddUpdateCarouselButtons();
        }

        private void UpdateCarouselPhoto(Core.Services.CMS.Carousel carousel)
        {
            if(carousel.Picture != null && carousel.Picture.Description != _model.Description)
            {
                var photo = PhotoService.GetPhoto(carousel.Picture.PhotoId);
                if(photo != null)
                {
                    photo.Description = _model.Description;
                    PhotoService.UpdatePhoto(photo);
                }
            }
        }

        private void UpdateStoreScreenShotInBackground(Core.Services.CMS.Carousel carousel)
        {
            var minSortOrder = CarouselService.GetAllCarousels().Min(x => x.SortOrder);
            if (minSortOrder == carousel.SortOrder)
                new ScreenshotService().UpdateStoreScreenShotInBackground();
        }

        private void AddUpdateCarouselText()
        {
            if (string.IsNullOrWhiteSpace(_model.TextTitle) && _model.Text == null) return;

            if (_model.Text == null)
            {
                _model.Text = new CarouselText
                {
                    TitleSize = 60,
                    TextSize = 20,
                    ColorCode = "ffffff",
                    PositionHorizontal = ETextPositionHorizontal.Center,
                    PositionVertical = ETextPositionVertical.Center,
                    Alignment = ETextAlignment.Center,
                    Animation = ETextAnimation.None,
                    Enabled = true,
                    BlockSize = 50,
                    TextLineHeight = 1.2f,
                    TitleLineHeight = 1
                };
            }

            _model.Text.CarouselId = _model.CarouselId;
            if (_model.TextTitle.IsNotEmpty()) _model.Text.Title = _model.TextTitle;
            
            var existingText = CarouselService.GetCarouselTextByCarousel(_model.CarouselId);
            if (existingText != null) CarouselService.UpdateCarouselText(_model.Text);
            else CarouselService.AddCarouselText(_model.Text);
        }

        private void AddUpdateCarouselButtons()
        {
            if (_model.Buttons != null)
            {
                foreach (var button in _model.Buttons)
                {
                    button.CarouselId = _model.CarouselId;
                    var oldButton = CarouselService.GetCarouselButton(button.Id);
                    if (oldButton != null) CarouselService.UpdateCarouselButton(button);
                    else CarouselService.AddCarouselButton(button);
                }
            }
        }

        private void Validate()
        {
            if (_model.CarouselId == 0)
                throw new BlException(LocalizationService.GetResource("Admin.Carousel.Errors.CarouselSlideNotFound"));
            if (_model.ImageSrc.IsNullOrEmpty() && _model.VideoSrc.IsNullOrEmpty())
                throw new BlException(LocalizationService.GetResource("Admin.Carousel.Errors.ImageOrVideoNotFound"));
        }
    }
}