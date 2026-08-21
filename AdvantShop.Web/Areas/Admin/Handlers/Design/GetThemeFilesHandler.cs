using System.Collections.Generic;
using System.IO;
using System.Linq;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Web.Admin.Models.Designs;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Design
{
    public sealed class GetThemeFilesHandler : ICommandHandler<IEnumerable<object>>
    {
        private readonly ThemeFilesModel _model;

        public GetThemeFilesHandler(ThemeFilesModel model)
        {
            _model = model;
        }

        public IEnumerable<object> Execute()
        {
            var themeFolderPath = FoldersHelper.GetThemeRelativePath(_model.Theme, _model.Design);
            var themeFolder = themeFolderPath.GetThemeAbsolutePath();

            var directory = new DirectoryInfo(themeFolder);

            if (!directory.Exists)
                FileHelpers.CreateDirectory(themeFolder);

            var files = directory
                .GetFiles()
                .Select(file =>
                    new
                    {
                        file.Name,
                        Preview = FileHelpers.CheckFileExtensionByType(file.FullName, EFileType.Image)
                            ? Path.Combine(UrlService.GetUrl(), themeFolderPath, file.Name)
                            : null
                    });

            return files;
        }
    }
}