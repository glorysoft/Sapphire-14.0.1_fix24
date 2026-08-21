using AdvantShop.Configuration;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.FilePath;

namespace AdvantShop.Models.Common
{
    public partial class LogoModel : BaseModel
    {
        public bool DisplayHref { get; set; }

        public string ImgAlt { get; set; }

        public bool Visible { get; set; }

        public string ImgSource { get; set; }

        public string CssClass { get; set; }

        public string Html { get; set; }

        public bool LogoGeneratorEnabled { get; set; }

        public bool LogoGeneratorEditOnPageLoad { get; set; }

        public string ImgId { get; set; }

        public bool IsSvg { get; set; }

        public bool IsAlternative { get; set; }
        
        public bool ForceInplaceDisable { get; set; }

        public LogoModel() : this(false) { }
        
        public LogoModel(bool isAlternative, bool forceInplaceDisable = false)
        {
            ImgAlt = SettingsMain.LogoImageAlt;
            DisplayHref = true;
            Visible = true;
            IsAlternative = isAlternative;
            ForceInplaceDisable = forceInplaceDisable;
            var isSvg = SettingsMain.IsLogoImageSvg;
            var logo = !isAlternative ? SettingsMain.LogoImageName :
                SettingsMain.UseAlternativeLogoImage ? SettingsMain.AlternativeLogoImageName : string.Empty;

            // если превью шаблона и лого стандартное
            if (SettingsDesign.PreviewTemplate != null && (SettingsMain.IsDefaultLogo || string.IsNullOrEmpty(logo)))
            {
                var defaultTemplateLogo = SettingsDesign.DefaultLogo;

                if (!string.IsNullOrEmpty(defaultTemplateLogo))
                    ImgSource = UrlService.GetUrl(defaultTemplateLogo);
            }

            if (ImgSource == null)
            {
                if (!string.IsNullOrEmpty(logo))
                {
                    ImgSource = FoldersHelper.GetPath(FolderType.Pictures, logo, false);
                    IsSvg = isSvg;
                }
            }

            ImgId = "logo" + (isAlternative ? "Alt" : "");
        }
    }

    public partial class DarkLogoModel : BaseModel
    {
        public bool DisplayHref { get; set; }

        public string ImgAlt { get; set; }

        public bool Visible { get; set; }

        public string ImgSource { get; set; }

        public string CssClass { get; set; }

        public string Html { get; set; }

        public bool LogoGeneratorEnabled { get; set; }

        public bool LogoGeneratorEditOnPageLoad { get; set; }

        public string ImgId { get; set; }

        public bool IsSvg { get; set; }

        public DarkLogoModel()
        {
            ImgAlt = SettingsMain.LogoImageAlt;
            DisplayHref = true;
            Visible = true;

            var isSvg = SettingsMain.IsLogoImageSvg;
            var logo = isSvg
                ? SettingsMain.LogoImageName
                : SettingsMain.DarkThemeLogoName;

            // если превью шаблона и лого стандартное
            if (SettingsDesign.PreviewTemplate != null && (SettingsMain.IsDefaultLogo || string.IsNullOrEmpty(logo)))
            {
                var defaultTemplateLogo = SettingsDesign.DefaultLogo;

                if (!string.IsNullOrEmpty(defaultTemplateLogo))
                    ImgSource = UrlService.GetUrl(defaultTemplateLogo);
            }

            if (ImgSource == null)
            {
                if (!string.IsNullOrEmpty(logo))
                {
                    ImgSource = FoldersHelper.GetPath(FolderType.Pictures, logo, false);
                    IsSvg = isSvg;
                }
            }

            ImgId = "darkLogo";
        }
    }
}