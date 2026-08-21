using AdvantShop.Core;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Web.Admin.Models.Designs;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Design
{
    public sealed class RemoveThemeFileHandler : ICommandHandler
    {
        private readonly ThemeFilesModel _model;

        public RemoveThemeFileHandler(ThemeFilesModel model)
        {
            _model = model;
        }
        
        public void Execute()
        {
            var path = FoldersHelper.GetThemeAbsolutePath(_model.Theme, _model.Design);

            if (!path.IsPathValid(_model.RemoveFile))
                throw new BlException("Access denied");
            
            FileHelpers.DeleteFile(path + "/" + _model.RemoveFile);
        }
    }
}