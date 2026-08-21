using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.CMS;

namespace AdvantShop.Core.Services.Configuration
{
    public static class TemplateCarouselInstaller
    {
        private static readonly List<string> VideoExtensions = new List<string>
        {
            ".mp4"
        };

        private static readonly List<string> PhotoExtensions = new List<string>
        {
            ".jpg", ".jpeg", ".gif", ".png", ".bmp", ".webp"
        };

        public static void Install(XElement carouselElement, List<Carousel> carouselSlides)
        {
            if (carouselElement == null)
                return;

            var slideElements = carouselElement.Elements("Slide").ToList();
            if (!slideElements.Any())
                return;

            var isPreview = SettingsDesign.PreviewTemplate != null;
            var slides = slideElements.Select(BuildSlide)
                .Where(slide => !string.IsNullOrWhiteSpace(slide.Path) && slide.IsValidExtension())
                .ToList();

            SettingsDesign.DefaultSlides = string.Join(";", slides.Select(x => x.Path));

            if (isPreview || slides.Count == 0)
                return;

            carouselSlides.DisableCarouselSlides(slides, out var sortOrder);

            foreach (var slide in slides)
            {
                sortOrder += 10;

                var carousel = slide.AddCarousel(sortOrder);
                slide.AddCarouselText(carousel.CarouselId);
                slide.AddCarouselButtons(carousel.CarouselId);
                slide.AddCarouselMedia(carousel.CarouselId);
            }

            SettingsDesign.IsDefaultSlides = true;
        }

        private static Slide BuildSlide(XElement slideElement)
        {
            if (slideElement == null)
                return new Slide();

            var margin = slideElement.Element("Margin");
            var header = slideElement.Element("Header");
            var description = slideElement.Element("Description");
            var textSettings = slideElement.Element("TextSettings");
            var buttons = slideElement.Elements("Button").ToList();

            var slide = new Slide
            {
                Path = slideElement.Attribute("Path")?.Value ?? string.Empty,
                Url = slideElement.Attribute("Url")?.Value ?? string.Empty,
                DisplayInMobile = slideElement.Attribute("DisplayInMobile")?.Value.TryParseBool() ?? true,
                DisplayInOneColumn = slideElement.Attribute("DisplayInOneColumn")?.Value.TryParseBool() ?? true,
                DisplayInTwoColumns = slideElement.Attribute("DisplayInTwoColumns")?.Value.TryParseBool() ?? true,
                Obscuring = slideElement.Attribute("Obscuring")?.Value.TryParseInt() ?? 0,
                IsVideo = slideElement.Attribute("IsVideo")?.Value.TryParseBool() ?? false,
                Margin = new SlideMargin
                {
                    Top = margin?.Attribute("Top")?.Value.TryParseInt() ?? 0,
                    Bottom = margin?.Attribute("Bottom")?.Value.TryParseInt() ?? 0,
                    Right = margin?.Attribute("Right")?.Value.TryParseInt() ?? 0,
                    Left = margin?.Attribute("Left")?.Value.TryParseInt() ?? 0
                },
                TextSettings = new SlideTextSettings
                {
                    Alignment = textSettings?.Attribute("Alignment")?.Value
                                    .TryParseEnum(ETextAlignment.Left)
                                ?? ETextAlignment.Left,
                    PositionHorizontal = textSettings?.Attribute("PositionHorizontal")?.Value
                                             .TryParseEnum(ETextPositionHorizontal.Left)
                                         ?? ETextPositionHorizontal.Left,
                    PositionVertical = textSettings?.Attribute("PositionVertical")?.Value
                                           .TryParseEnum(ETextPositionVertical.Center)
                                       ?? ETextPositionVertical.Center,
                    BlockSize = textSettings?.Attribute("BlockSize")?.Value.TryParseInt() ?? 50,
                }
            };

            if (header != null || description != null)
            {
                slide.Header = new SlideText
                {
                    Text = header?.Attribute("Text")?.Value.Reduce(150) ?? string.Empty,
                    Size = header?.Attribute("Size")?.Value.TryParseInt() ?? 60,
                    ColorCode = header?.Attribute("ColorCode")?.Value.Reduce(10) ?? "000000",
                    LineHeight = header?.Attribute("LineHeight")?.Value.TryParseFloat() ?? 1.2f,
                };

                slide.Description = new SlideText
                {
                    Text = description?.Attribute("Text")?.Value ?? string.Empty,
                    Size = description?.Attribute("Size")?.Value.TryParseInt() ?? 20,
                    ColorCode = description?.Attribute("ColorCode")?.Value.Reduce(10) ?? "ffffff",
                    LineHeight = description?.Attribute("LineHeight")?.Value.TryParseFloat() ?? 1f,
                };
            }

            if (buttons.Any())
            {
                slide.Buttons = buttons.Take(2)
                    .Select(button => new SlideButton
                    {
                        Text = button?.Attribute("Text")?.Value.Reduce(150) ?? string.Empty,
                        Url = button?.Attribute("Url")?.Value.Reduce(150) ?? string.Empty,
                        Blank = button?.Attribute("Blank")?.Value.TryParseBool() ?? false,
                        ButtonColorCode = button?.Attribute("ButtonColorCode")?.Value.Reduce(10) ?? string.Empty,
                        TextColorCode = button?.Attribute("TextColorCode")?.Value.Reduce(10) ?? string.Empty,
                    })
                    .ToList();
            }

            return slide;
        }

        private static bool IsValidExtension(this Slide slide) =>
            slide.IsVideo
                ? VideoExtensions.Any(extension =>
                    slide.Path.EndsWith(extension, StringComparison.OrdinalIgnoreCase)
                )
                : PhotoExtensions.Any(extension =>
                    slide.Path.EndsWith(extension, StringComparison.OrdinalIgnoreCase)
                );

        private static void DisableCarouselSlides(
            this List<Carousel> carouselSlides,
            List<Slide> slides,
            out int sortOrder
        )
        {
            sortOrder = int.MinValue;

            foreach (var carouselSlide in carouselSlides)
            {
                var existedSlide = slides.Find(slide =>
                    carouselSlide.IsVideo
                        ? slide.Path.Equals(carouselSlide.Video?.VideoName, StringComparison.Ordinal)
                        : slide.Path.Equals(carouselSlide.Picture?.PhotoName, StringComparison.Ordinal)
                );

                if ((carouselSlide.Picture != null || carouselSlide.Video != null)
                    && existedSlide != null)
                {
                    CarouselService.DeleteCarousel(carouselSlide.CarouselId);
                }
                else
                {
                    carouselSlide.Enabled = false;
                    CarouselService.UpdateCarousel(carouselSlide);
                }

                if (sortOrder < carouselSlide.SortOrder)
                    sortOrder = carouselSlide.SortOrder;
            }
        }

        private static Carousel AddCarousel(this Slide slide, int sortOrder)
        {
            var carousel = new Carousel
            {
                Url = slide.Url,
                Enabled = true,
                DisplayInMobile = slide.DisplayInMobile,
                DisplayInOneColumn = slide.DisplayInOneColumn,
                DisplayInTwoColumns = slide.DisplayInTwoColumns,
                SortOrder = sortOrder,
                Obscuring = slide.Obscuring,
                MarginTop = slide.Margin.Top,
                MarginBottom = slide.Margin.Bottom,
                MarginLeft = slide.Margin.Left,
                MarginRight = slide.Margin.Right,
                IsVideo = slide.IsVideo,
                HeaderTextColorCode = slide.Header?.ColorCode,
            };

            CarouselService.AddCarousel(carousel);

            return carousel;
        }

        private static void AddCarouselText(this Slide slide, int carouselId)
        {
            if (slide.Header == null || slide.Description == null)
                return;

            CarouselService.AddCarouselText(new CarouselText
            {
                CarouselId = carouselId,
                Enabled = true,
                Title = slide.Header.Text,
                TitleSize = slide.Header.Size,
                TitleLineHeight = slide.Header.LineHeight,
                Text = slide.Description.Text,
                TextSize = slide.Description.Size,
                TextLineHeight = slide.Description.LineHeight,
                ColorCode = slide.Description.ColorCode,
                Alignment = slide.TextSettings.Alignment,
                PositionHorizontal = slide.TextSettings.PositionHorizontal,
                PositionVertical = slide.TextSettings.PositionVertical,
                BlockSize =  slide.TextSettings.BlockSize
            });
        }

        private static void AddCarouselMedia(this Slide slide, int carouselId)
        {
            if (!slide.IsVideo)
                PhotoService.AddPhotoWithOrignName(new Photo(0, carouselId, PhotoType.Carousel)
                {
                    PhotoName = slide.Path,
                });
            else
                CarouselVideoService.AddCarouselVideo(new CarouselVideo
                {
                    CarouselId = carouselId,
                    VideoName = slide.Path,
                    ModifiedDate = DateTime.Now,
                });
        }

        private static void AddCarouselButtons(this Slide slide, int carouselId)
        {
            if (slide.Buttons == null || slide.Buttons.Count == 0)
                return;

            foreach (var button in slide.Buttons)
            {
                var useStoreColorScheme = !string.IsNullOrWhiteSpace(button.ButtonColorCode)
                                          && !string.IsNullOrWhiteSpace(button.TextColorCode);

                CarouselService.AddCarouselButton(new CarouselButton
                {
                    CarouselId = carouselId,
                    Enabled = true,
                    Text = button.Text,
                    Url = button.Url,
                    UseStoreColorScheme = useStoreColorScheme,
                    ButtonColorCode = useStoreColorScheme ? string.Empty : button.ButtonColorCode,
                    TextColorCode = useStoreColorScheme ? string.Empty : button.TextColorCode,
                });
            }
        }

        private sealed class Slide
        {
            public string Path { get; set; }
            public string Url { get; set; }
            public bool DisplayInMobile { get; set; }
            public bool DisplayInOneColumn { get; set; }
            public bool DisplayInTwoColumns { get; set; }
            public int Obscuring { get; set; }
            public bool IsVideo { get; set; }
            public SlideMargin Margin { get; set; }
            public SlideText Header { get; set; }
            public SlideText Description { get; set; }
            public SlideTextSettings TextSettings { get; set; }
            public List<SlideButton> Buttons { get; set; }
        }

        private sealed class SlideMargin
        {
            public int Top { get; set; }
            public int Bottom { get; set; }
            public int Right { get; set; }
            public int Left { get; set; }
        }

        private sealed class SlideText
        {
            public string Text { get; set; }
            public int Size { get; set; }
            public string ColorCode { get; set; }
            public float LineHeight { get; set; }
        }

        private sealed class SlideTextSettings
        {
            public ETextAlignment Alignment { get; set; }
            public ETextPositionHorizontal PositionHorizontal { get; set; }
            public ETextPositionVertical PositionVertical { get; set; }
            public int BlockSize { get; set; }
        }

        private sealed class SlideButton
        {
            public string Text { get; set; }
            public string Url { get; set; }
            public bool Blank { get; set; }
            public string ButtonColorCode { get; set; }
            public string TextColorCode { get; set; }
        }
    }
}