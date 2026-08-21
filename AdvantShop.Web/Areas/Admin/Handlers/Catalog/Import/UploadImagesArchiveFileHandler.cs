using System;
using System.Collections.Generic;
using System.Web;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.Web.Admin.Models.Catalog.Import;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Catalog.Import
{
    public sealed class UploadImagesArchiveFileHandler : ICommandHandler<UploadFileResult>
    {
        private static readonly List<string> _allowedExtensions = new List<string>
        {
            ".jpg", ".jpeg", ".gif", ".png", ".bmp",
        };

        private readonly HttpPostedFileBase _file;

        public UploadImagesArchiveFileHandler(HttpPostedFileBase file)
        {
            _file = file;

            FileHelpers.CreateDirectory(FoldersHelper.GetPathAbsolut(FolderType.PriceTemp));
        }

        public UploadFileResult Execute()
        {
            if (_file == null
                || string.IsNullOrEmpty(_file.FileName)
                || !FileHelpers.CheckFileExtensionByType(_file.FileName, EFileType.ZipArchive))
                return new UploadFileResult
                {
                    Result = false,
                    Error = LocalizationService.GetResource("Admin.Import.Errors.FileNotFound")
                };

            FileHelpers.CreateDirectory(FoldersHelper.GetPathAbsolut(FolderType.ImageTemp));
            var fullPath = FoldersHelper.GetPathAbsolut(FolderType.ImageTemp, _file.FileName);

            try
            {
                FileHelpers.DeleteFilesFromPath(FoldersHelper.GetPathAbsolut(FolderType.ImageTemp));
                _file.SaveAs(fullPath);

                if (!FileHelpers.CheckFilesExtensionsInZipFile(
                        fullPath,
                        _allowedExtensions,
                        out var errorFileName)
                   )
                {
                    FileHelpers.DeleteFile(fullPath);

                    return new UploadFileResult
                    {
                        Result = false,
                        FilePath = fullPath,
                        Error = LocalizationService.GetResourceFormat(
                            "Admin.Import.UploadImagesArchiveFileHandler.NotAllowedExtensionInZip",
                            errorFileName,
                            string.Join(", ", _allowedExtensions))
                    };
                }

                var res = FileHelpers.UnZipFile(fullPath);
                FileHelpers.DeleteFile(fullPath);

                if (!res)
                    return new UploadFileResult
                    {
                        Result = false,
                        FilePath = fullPath,
                        Error = "Admin_ImportCsv_ErrorAtUnZip"
                    };
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                return new UploadFileResult
                {
                    Result = false,
                    FilePath = fullPath,
                    Error = "Admin_ImportCsv_ErrorAtUploadFile"
                };
            }

            return new UploadFileResult { Result = true, FilePath = fullPath };
        }
    }
}