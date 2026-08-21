using System.IO;
using System.Web;
using AdvantShop.Core;
using AdvantShop.Core.Services.Localization;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Web.Admin.Models.Designs;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Design
{
    public sealed class UploadThemeFilesHandler : ICommandHandler
    {
        private readonly ThemeFilesModel _model;
        private readonly HttpFileCollectionBase _files;

        public UploadThemeFilesHandler(ThemeFilesModel model, HttpFileCollectionBase files)
        {
            _model = model;
            _files = files;
        }
        
        public void Execute()
        {
            var themeFolder = FoldersHelper.GetThemeAbsolutePath(_model.Theme, _model.Design);
            
            if (_files == null || _files.Count == 0)
                throw new BlException("file is null");

            var hasErrors = false;

            for (var i = 0; i < _files.Count; i++)
            {
                var file = _files.Get(i);
                
                if (file == null)
                    continue;

                if (file.ContentLength > 5000000 ||
                    !FileHelpers.CheckFileExtensionByType(file.FileName, EFileType.Image))
                {
                    hasErrors = true;
                    continue;
                }
                file.SaveAs(Path.Combine(themeFolder, file.FileName));
            }
            
            if (hasErrors)
                throw new BlException(LocalizationService.GetResource("Admin.Designs.FileSizeLimit5MB"));
        }
    }
}