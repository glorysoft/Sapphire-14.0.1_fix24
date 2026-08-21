using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using AdvantShop.Core;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Primitives;
using AdvantShop.Diagnostics;
using AdvantShop.ExportImport;
using AdvantShop.FilePath;
using AdvantShop.Helpers;
using AdvantShop.SEO;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.Seo
{
    public sealed class Import301Redirects : AbstractCommandHandler
    {
        private readonly HttpPostedFileBase _file;

        public Import301Redirects(HttpPostedFileBase file)
        {
            _file = file;
        }

        protected override void Validate()
        {
            if (_file == null || string.IsNullOrEmpty(_file.FileName))
                throw new BlException("Файл не найден");
            
            
        }

        protected override void Handle()
        {
            try
            {
                var result = Import();
                if (!result.IsSuccess)
                    throw new BlException(result.Error.Message);
            }
            catch (BlException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                throw new BlException(T("Admin.Js.Settings.Import301RedCtrl.ErrorImport"));
            }
        }

        private Result Import()
        {
            var filePath = FoldersHelper.GetPathAbsolut(FolderType.PriceTemp);
            var fileName = "redirectsImport.csv";
            var fullFileName = filePath + fileName.FileNamePlusDate();

            FileHelpers.CreateDirectory(filePath);

            _file.SaveAs(fullFileName);

            var errors = new List<string>();

            using (var csvReader = new CsvHelper.CsvReader(new StreamReader(fullFileName), CsvConstants.DefaultCsvConfiguration))
            {
                csvReader.Read();
                csvReader.ReadHeader();
                
                while (csvReader.Read())
                {
                    try
                    {
                        var currentRecord = new RedirectSeo
                        {
                            RedirectFrom = HttpUtility.UrlDecode(csvReader.GetField<string>("RedirectFrom").ToLower()),
                            RedirectTo = HttpUtility.UrlDecode(csvReader.GetField<string>("RedirectTo").ToLower()),
                            ProductArtNo = csvReader.GetField<string>("ProductArtNo")
                        };

                        if (string.IsNullOrWhiteSpace(currentRecord.RedirectFrom) || currentRecord.RedirectFrom == "*")
                            continue;

                        var redirect = RedirectSeoService.GetRedirectsSeoByRedirectFrom(currentRecord.RedirectFrom);

                        if (redirect != null)
                            currentRecord.ID = redirect.ID;

                        if (RedirectSeoService.CheckOnSystemUrl(currentRecord.RedirectFrom)
                            || RedirectSeoService.CheckOnSystemUrl(currentRecord.RedirectTo))
                        {
                            var error = T("Admin.Js.Settings.AddEdit301RedCtrl.SystemUrl", csvReader.Parser.RawRecord);
                            errors.Add(error);
                            Debug.Log.Warn(error);
                            continue;
                        }

                        if (RedirectSeoService.IsToManyRedirects(currentRecord))
                        {
                            var error = T("Admin.Js.Settings.Import301RedCtrl.ErrorToManyRed", csvReader.Parser.RawRecord);
                            errors.Add(error);
                            Debug.Log.Warn(error);
                            continue;
                        }

                        if (redirect == null)
                            RedirectSeoService.AddRedirectSeo(currentRecord);
                        else
                            RedirectSeoService.UpdateRedirectSeo(currentRecord);
                    }
                    catch (CsvHelper.MissingFieldException ex)
                    {
                        Debug.Log.Error(ex);
                        return Result.Failure(new Error(T("Admin.Js.Settings.Import301RedCtrl.ErrorMissingField")));
                    }
                    catch (Exception ex)
                    {
                        errors.Add(T("Admin.Js.Settings.Import301RedCtrl.ErrorInRow", csvReader.Parser.RawRecord));
                        Debug.Log.Error(ex);
                    }
                }
            }

            return
                errors.Count == 0
                    ? Result.Success()
                    : Result.Failure(new Error(T("Admin.Js.Settings.Import301RedCtrl.ErrorsDuringImport", string.Join(", ", errors))));
        }
    }
}