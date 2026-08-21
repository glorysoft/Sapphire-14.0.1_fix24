using AdvantShop.Configuration;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Core.Services.Localization;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Trial;
using AdvantShop.Web.Admin.Models.Settings;
using System.IO;
using Image = System.Drawing.Image;

namespace AdvantShop.Web.Admin.Handlers.Settings.Common
{
    public class UploadLogoPictureByLinkHandler
    {
        private readonly string _fileLink;
        private readonly bool _isLogoMobile;
        private readonly bool _isSvg;
        private readonly bool _isDarkThemeLogo;
        private readonly bool _isLogoBlog;
        private readonly bool _isAlternativeLogo;

        public UploadLogoPictureByLinkHandler(string fileLink, bool isLogoMobile = false, bool isSvg = false, bool isLogoBlog = false, bool isDarkThemeLogo = false, bool isAlternativeLogo = false)
        {
            _fileLink = fileLink;
            _isDarkThemeLogo = isDarkThemeLogo;
            _isLogoMobile = isLogoMobile;
            _isSvg = isSvg;
            _isLogoBlog = isLogoBlog;
            _isAlternativeLogo = isAlternativeLogo;
        }

        public UploadPictureResult Execute()
        {
            if (string.IsNullOrEmpty(_fileLink))
                return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Error.FileNotFound") };

            return !_isSvg ? AddLogo(_fileLink) : AddLogoSvg(_fileLink);
        }


        private UploadPictureResult AddLogo(string fileLink)
        {
            var fileName = fileLink.Substring(fileLink.LastIndexOf("/") + 1);
            var newFileName = fileName.FileNamePlusDate("logo" + (_isLogoMobile ? "_mobile" : _isLogoBlog ? "_blog" : _isDarkThemeLogo ? "_dark" : _isAlternativeLogo ? "_alternative" : ""));

            if (!FileHelpers.CheckFileExtensionByType(newFileName, EFileType.Image))
                return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Error.InvalidLogoFormat") };

            var photoFullName = FoldersHelper.GetPathAbsolut(FolderType.Pictures, newFileName);

            if (FileHelpers.DownloadRemoteImageFile(fileLink, photoFullName, out var error))
            {
                FileHelpers.CreateDirectory(FoldersHelper.GetPathAbsolut(FolderType.ImageTemp));

                var imageName = _isLogoMobile ? SettingsMobile.LogoImageName : _isLogoBlog ? SettingsMain.LogoBlogImageName : _isDarkThemeLogo ? SettingsMain.DarkThemeLogoName : _isAlternativeLogo ? SettingsMain.AlternativeLogoImageName : SettingsMain.LogoImageName;

                FileHelpers.DeleteFile(FoldersHelper.GetPathAbsolut(FolderType.Pictures, imageName));


                var img = Image.FromFile(photoFullName, true);

                if (_isLogoMobile)
                {
                    SettingsMobile.LogoImageName = newFileName;
                    SettingsMobile.LogoImageWidth = img.Width;
                    SettingsMobile.LogoImageHeight = img.Height;
                }
                else if (_isLogoBlog)
                {
                    SettingsMain.LogoBlogImageName = newFileName;
                }
                else if(_isDarkThemeLogo)
                {
                    SettingsMain.DarkThemeLogoName = newFileName;
                    SettingsMain.DarkThemeLogoImageWidth = img.Width;
                    SettingsMain.DarkThemeLogoImageHeight = img.Height;
                }
                else if (_isAlternativeLogo)
                {
                    SettingsMain.AlternativeLogoImageName = newFileName;
                    SettingsMain.AlternativeLogoImageWidth = img.Width;
                    SettingsMain.AlternativeLogoImageHeight = img.Height;
                }
                else
                {
                    SettingsMain.LogoImageName = newFileName;
                    SettingsMain.IsLogoImageSvg = false;
                    SettingsMain.LogoImageWidth = img.Width;
                    SettingsMain.LogoImageHeight = img.Height;
                }

                TrialService.TrackEvent(TrialEvents.ChangeLogo, "");

                // if (!SettingsCongratulationsDashboard.LogoDone)
                // {
                //     SettingsCongratulationsDashboard.LogoDone = true;
                //     Track.TrackService.TrackEvent(Track.ETrackEvent.Dashboard_LogoDone);
                // }

                return new UploadPictureResult
                {
                    Result = true,
                    Picture = FoldersHelper.GetPath(FolderType.Pictures, newFileName, true)
                };
            }

            return new UploadPictureResult { Error = error ?? LocalizationService.GetResource("Admin.Error.FileNotFound") };
        }

        private UploadPictureResult AddLogoSvg(string fileLink)
        {
            var fileName = fileLink.Substring(fileLink.ToLower().Split('?')[0].LastIndexOf("/") + 1);
            var newFileName = fileName.FileNamePlusDate(_isAlternativeLogo ? "logo_alternative" : "logo");
                        
            if (Path.GetExtension(fileName) != ".svg")
                return new UploadPictureResult { Error = LocalizationService.GetResource("Admin.Error.InvalidLogoFormat") };

            var photoFullName = FoldersHelper.GetPathAbsolut(FolderType.Pictures, newFileName);

            if (FileHelpers.DownloadRemoteImageFile(fileLink, photoFullName, out var error))
            {
                FileHelpers.CreateDirectory(FoldersHelper.GetPathAbsolut(FolderType.ImageTemp));
                FileHelpers.DeleteFile(FoldersHelper.GetPathAbsolut(FolderType.Pictures, _isAlternativeLogo ? SettingsMain.AlternativeLogoImageName : SettingsMain.LogoImageName));

                if (_isAlternativeLogo)
                {
                    SettingsMain.AlternativeLogoImageName = newFileName;
                    SettingsMain.IsAlternativeLogoImageSvg = true;
                    SettingsMain.AlternativeLogoImageWidth = 0;
                    SettingsMain.AlternativeLogoImageHeight = 0;
                }
                else
                {
                    SettingsMain.LogoImageName = newFileName;
                    SettingsMain.IsLogoImageSvg = true;
                    SettingsMain.LogoImageWidth = 0;
                    SettingsMain.LogoImageHeight = 0;
                }

                TrialService.TrackEvent(TrialEvents.ChangeLogo, "");

                // if (!SettingsCongratulationsDashboard.LogoDone)
                // {
                //     SettingsCongratulationsDashboard.LogoDone = true;
                //     Track.TrackService.TrackEvent(Track.ETrackEvent.Dashboard_LogoDone);
                // }

                return new UploadPictureResult
                {
                    Result = true,
                    Picture = FoldersHelper.GetPath(FolderType.Pictures, newFileName, true)
                };
            }

            return new UploadPictureResult { Error = error ?? LocalizationService.GetResource("Admin.Error.FileNotFound") };
        }
    }
}
