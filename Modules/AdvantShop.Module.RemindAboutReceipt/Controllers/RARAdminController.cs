using System;
using System.Web.Mvc;
using AdvantShop.Web.Infrastructure.Controllers;
using AdvantShop.Module.RemindAboutReceipt.Models;
using AdvantShop.Module.RemindAboutReceipt.Service;
using AdvantShop.Module.RemindAboutReceipt.Handlers;
using Newtonsoft.Json;
using AdvantShop.Web.Infrastructure.Filters;
using AdvantShop.Web.Infrastructure.Admin;
using System.Web;
using System.Collections.Generic;

namespace AdvantShop.Module.RemindAboutReceipt.Controllers
{
    public class RARAdminController : ModuleAdminController
    {
        public ActionResult ModuleSettingsReceipt()
        {
            return PartialView("~/modules/" + RemindAboutReceipt.ModuleStringId + "/Views/Admin/_ModuleSettingsReceipt.cshtml");
        }

        #region ModuleSettings
        [HttpGet]
        public JsonResult GetModuleSettings()
        {
            return Json(new ModuleSettingsModel()
            {
                Active = ModuleSettings.RarActive,
                ShowCommentInForm = ModuleSettings.ShowCommentInForm,
                ShowEmailInForm = ModuleSettings.ShowEmailInForm,
                ShowNameInForm = ModuleSettings.ShowNameInForm,
                ShowSurnameInForm = ModuleSettings.ShowSurnameInForm,
                ShowPhoneNumberInForm = ModuleSettings.ShowPhoneNumberInForm,
                FormHeader = ModuleSettings.FormHeader,
                AfterFormTextForUser = ModuleSettings.AfterFormTextForUser,
                MailSubject = ModuleSettings.MailSubject,
                MailBody = ModuleSettings.MailBody,
                CreateLead = ModuleSettings.CreateLead,
                SalesFunnelId = ModuleSettings.SalesFunnelId
            });
        }

        [HttpPost]
        public JsonResult SaveModuleSettings(ModuleSettingsModel settings)
        {
            try
            {
                ModuleSettings.RarActive = settings.Active;
                ModuleSettings.AfterFormTextForUser = settings.AfterFormTextForUser ?? string.Empty;
                ModuleSettings.FormHeader = settings.FormHeader ?? string.Empty;
                ModuleSettings.ShowCommentInForm = settings.ShowCommentInForm;
                ModuleSettings.ShowEmailInForm = settings.ShowEmailInForm;
                ModuleSettings.ShowNameInForm = settings.ShowNameInForm;
                ModuleSettings.ShowPhoneNumberInForm = settings.ShowPhoneNumberInForm;
                ModuleSettings.ShowSurnameInForm = settings.ShowSurnameInForm;
                ModuleSettings.MailSubject = settings.MailSubject ?? string.Empty;
                ModuleSettings.MailBody = settings.MailBody ?? string.Empty;
                ModuleSettings.CreateLead = settings.CreateLead;
                ModuleSettings.SalesFunnelId = settings.SalesFunnelId;

                return Json( new { success = true });
            }
            catch(Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { success = false });
            }
        }
        #endregion

        #region PROMO Feedback

        public ActionResult Feedback()
        {
            return PartialView("~/modules/" + RemindAboutReceipt.ModuleStringId + "/Views/Admin/_Feedback.cshtml", JsonConvert.SerializeObject(new FeedbackModel(Customers.CustomerContext.CurrentCustomer)));
        }

        [HttpPost]
        public JsonResult Feedback(FeedbackModel feedback)
        {
            if (string.IsNullOrEmpty(feedback.Message))
            {
                return Json(new { success = false, msg = "Заполните поле 'Сообщение'" });
            }

            try
            {
                Core.Modules.ModulesService.SendModuleMail(Guid.Empty, "Обратная связь. " + RemindAboutReceipt.ModuleName, GenerateHtmlMessage(feedback), Service.ModuleSettings.PromoHelpEmail, true);
                return Json(new { success = true, msg = "Сообщение отправлено" });
            }
            catch (Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { success = false, msg = "Ошибка при отправке сообщения. см. лог ошибок" });
            }
        }

        private string GenerateHtmlMessage(FeedbackModel feedback)
        {
            var mailBody = "<b>Сообщение:</b><br />" + feedback.Message + "<br /><br />";
            mailBody += string.Format("<b>URL магазина:</b> {0}<br/> <b>ФИО:</b> {1}<br/> <b>Почта администратора:</b> {2}<br/> <b>Телефон:</b> {3}",
                Configuration.SettingsMain.SiteUrl,
                feedback.Name,
                feedback.Email,
                feedback.Phone);
            return mailBody;
        }

        #endregion

        #region clients list

        public ActionResult ClientsListTab()
        {
            return PartialView("~/modules/" + RemindAboutReceipt.ModuleStringId + "/Views/Admin/_ClientsListTab.cshtml");
        }
        
        [HttpGet]
        public JsonResult GetClients(RarClientFilterModel model)
        {
            var handler = new GetRarClientsHandler(model);
            var result = handler.Execute();

            return Json(result);
        }

        [HttpPost]
        [ValidateJsonAntiForgeryToken]
        public JsonResult InplaceClient(RarClientFilterModel model)
        {
            var dbModel = RarService.GetRarClient(model.Id);
            if (dbModel == null || string.IsNullOrEmpty(model.Email))
                return Json(new { result = false });

            try
            {
                dbModel.Email = model.Email;
                RarService.UpdateRarClient(dbModel);

                return JsonOk();
            }
            catch (Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { result = false });
            }
        }

        private void CommandRarClient(RarClientFilterModel command, Func<int, RarClientFilterModel, bool> func)
        {
            if (command.SelectMode == SelectModeCommand.None)
            {
                foreach (var id in command.Ids)
                {
                    func(id, command);
                }
            }
            else
            {
                var handler = new GetRarClientsHandler(command);
                var ids = handler.GetItemsIds("Id");

                foreach (int id in ids)
                {
                    if (command.Ids == null || !command.Ids.Contains(id))
                        func(id, command);
                }
            }
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult DeleteClients(RarClientFilterModel command)
        {
            CommandRarClient(command, (id, c) =>
            {
                RarService.DeleteRarClient(id);
                return true;
            });
            return Json(true);
        }

        [HttpGet]
        public JsonResult GetClient(int id)
        {
            var dbModel = RarService.GetRarClient(id);
            if (dbModel == null)
                return Json(new { result = false });

            return Json(dbModel);
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult AddClient(RarClient client)
        {
            if (string.IsNullOrEmpty(client.Email))
                return Json(new { result = false });

            try
            {
                RarService.AddRarClient(client);
                return Json(new { result = true });
            }
            catch (Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { result = false });
            }
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult UpdateClient(RarClient client)
        {
            var dbModel = RarService.GetRarClient(client.Id);
            if (dbModel == null || string.IsNullOrEmpty(client.Email))
                return Json(new { result = false });

            try
            {
                RarService.UpdateRarClient(client);
                return Json(new { result = true });
            }
            catch (Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { result = false });
            }
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult DeleteClient(int id)
        {
            RarService.DeleteRarClient(id);

            return Json(new { result = true });
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult CreateLeadByClient(int id)
        {
            try
            {
                var client = RarService.GetRarClient(id);
                if (client == null)
                    return Json(new { result = false, msg = "Ошибка" });

                var leadId = 0;
                if (client.LeadId.HasValue)
                    leadId = client.LeadId.Value;

                var isLeadExists = leadId > 0 && ModuleService.IsLeadExists(leadId);
                if(isLeadExists)
                    return Json(new { result = false, msg = "Для этой записи лид уже создан" });

                var formRequest = new FormRequestModel
                {
                    Email = client.Email,
                    ProductId = client.ProductId,
                    ProductOfferId = client.ProductOfferId
                };

                leadId = ModuleService.CreateLead(formRequest, true);
                client.LeadId = leadId;

                RarService.UpdateRarClient(client);

                return Json(new { result = true, msg = "Лид успешно создан", leadId = leadId, leadTitle = ModuleService.GetLeadTitle(leadId) });
            }
            catch (Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { result = false, msg = "Ошибка" });
            }

        }

        #endregion

        #region discount
        public ActionResult ModuleSettingsDiscount()
        {
            return PartialView("~/modules/" + RemindAboutReceipt.ModuleStringId + "/Views/Admin/_ModuleSettingsDiscount.cshtml");
        }

        [HttpGet]
        public JsonResult GetModuleRadSettings()
        {
            return Json(new ModuleRadSettingsModel()
            {
                Active = ModuleSettings.RadActive,
                ShowCommentInForm = ModuleSettings.RadShowCommentInForm,
                ShowEmailInForm = ModuleSettings.RadShowEmailInForm,
                ShowNameInForm = ModuleSettings.RadShowNameInForm,
                ShowSurnameInForm = ModuleSettings.RadShowSurnameInForm,
                ShowPhoneNumberInForm = ModuleSettings.RadShowPhoneNumberInForm,
                FormHeader = ModuleSettings.RadFormHeader,
                AfterFormTextForUser = ModuleSettings.RadAfterFormTextForUser,
                TextForUser = ModuleSettings.RadTextForUser,
                CheckAmount = ModuleSettings.RadCheckAmount,
                ImagePath = ModuleSettings.RadImagePath,
                LetterSubject = ModuleSettings.RadLetterSubject,
                LetterBody = ModuleSettings.RadLetterBody,
                CreateLead = ModuleSettings.RadCreateLead,
                SalesFunnelId = ModuleSettings.RadSalesFunnelId
            });
        }

        [HttpPost]
        public JsonResult SaveModuleRadSettings(ModuleRadSettingsModel settings)
        {
            try
            {
                ModuleSettings.RadActive = settings.Active;
                ModuleSettings.RadAfterFormTextForUser = settings.AfterFormTextForUser ?? string.Empty;
                ModuleSettings.RadFormHeader = settings.FormHeader ?? string.Empty;
                ModuleSettings.RadShowCommentInForm = settings.ShowCommentInForm;
                ModuleSettings.RadShowEmailInForm = settings.ShowEmailInForm;
                ModuleSettings.RadShowNameInForm = settings.ShowNameInForm;
                ModuleSettings.RadShowPhoneNumberInForm = settings.ShowPhoneNumberInForm;
                ModuleSettings.RadShowSurnameInForm = settings.ShowSurnameInForm;
                ModuleSettings.RadCheckAmount = settings.CheckAmount;
                ModuleSettings.RadTextForUser = settings.TextForUser ?? string.Empty;
                ModuleSettings.RadImagePath = settings.ImagePath ?? string.Empty;
                ModuleSettings.RadLetterSubject = settings.LetterSubject ?? string.Empty;
                ModuleSettings.RadLetterBody = settings.LetterBody ?? string.Empty;
                ModuleSettings.RadCreateLead = settings.CreateLead;
                ModuleSettings.RadSalesFunnelId = settings.SalesFunnelId;

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { success = false });
            }
        }

        #endregion
        
        #region Image

        [HttpPost]
        public JsonResult RadUploadImage(HttpPostedFileBase imageFile)
        {
            var fileName = imageFile.FileName;

            if (string.IsNullOrEmpty(fileName))
            {
                return Json(new { success = false, newImagePath = string.Empty, msg = "Файл не выбран!" }, JsonRequestBehavior.AllowGet);
            }

            if (!Helpers.FileHelpers.CheckFileExtension(fileName, Helpers.EAdvantShopFileTypes.Image))
            {
                return Json(new { success = false, newImagePath = string.Empty, msg = "Недопустимый тип файла" }, JsonRequestBehavior.AllowGet);
            }

            var path = ModuleService.GetPath(ModuleService.ImagesPath);
            if (!System.IO.Directory.Exists(path))
            {
                System.IO.Directory.CreateDirectory(path);
            }
            
            var oldFileName = ModuleSettings.RadImagePath;
            if (System.IO.File.Exists(path + oldFileName))
            {
                System.IO.File.Delete(path + oldFileName);
            }

            var resultFileName = fileName;
            while (System.IO.Directory.Exists(path + resultFileName))
            {
                int DotLastId = resultFileName.LastIndexOf(".");
                resultFileName = resultFileName.Insert(DotLastId, "n");
            }

            imageFile.SaveAs(path + resultFileName);

            ModuleSettings.RadImagePath = resultFileName;

            return Json(new { success = true, newImagePath = resultFileName, msg = "Изображение успешно загружено!" });
        }

        [HttpPost]
        public JsonResult RadDeleteimage(string imageName)
        {
            var path = ModuleService.GetPath(ModuleService.ImagesPath);

            if (System.IO.File.Exists(path + imageName))
            {
                System.IO.File.Delete(path + imageName);
            }

            ModuleSettings.RadImagePath = string.Empty;
            return Json(new { success = true, newImagePath = string.Empty, msg = "Изображение успешно удалено!" });
        }

        #endregion

        #region banners data

        public ActionResult GetPromoContentBannersData()
        {
            var bannersData = ModuleService.GetPromoContentBannersData();

            if (bannersData == null)
                return new EmptyResult();

            if (!bannersData.BannersSettingsActive || (string.IsNullOrEmpty(bannersData.FirstBannerImage) &&
                                                       string.IsNullOrEmpty(bannersData.SecondBannerImage) &&
                                                       string.IsNullOrEmpty(bannersData.ThirdBannerImage)))
                return new EmptyResult();

            bannersData.Host = "http://crm.promo-z.ru/";

            return PartialView("~/modules/" + RemindAboutReceipt.ModuleStringId + "/Views/Admin/_BannersData.cshtml",
                bannersData);
        }

        #endregion


        #region rad clients list
        public ActionResult RadClientsListTab()
        {
            return PartialView("~/modules/" + RemindAboutReceipt.ModuleStringId + "/Views/Admin/_RadClientsListTab.cshtml");
        }

        [HttpGet]
        public JsonResult GetRadClients(RadClientFilterModel model)
        {
            var handler = new GetRadClientsHandler(model);
            var result = handler.Execute();

            return Json(result);
        }

        [HttpPost]
        [ValidateJsonAntiForgeryToken]
        public JsonResult InplaceRadClient(RadClientFilterModel model)
        {
            var dbModel = RadService.GetRadClient(model.Id);
            if (dbModel == null || string.IsNullOrEmpty(model.Email))
                return Json(new { result = false });

            try
            {
                dbModel.Email = model.Email;
                RadService.UpdateRadClient(dbModel);

                return JsonOk();
            }
            catch (Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { result = false });
            }
        }

        private void CommandRadClient(RadClientFilterModel command, Func<int, RadClientFilterModel, bool> func)
        {
            if (command.SelectMode == SelectModeCommand.None)
            {
                foreach (var id in command.Ids)
                {
                    func(id, command);
                }
            }
            else
            {
                var handler = new GetRadClientsHandler(command);
                var ids = handler.GetItemsIds("Id");

                foreach (int id in ids)
                {
                    if (command.Ids == null || !command.Ids.Contains(id))
                        func(id, command);
                }
            }
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult DeleteRadClients(RadClientFilterModel command)
        {
            CommandRadClient(command, (id, c) =>
            {
                RadService.DeleteRadClient(id);
                return true;
            });
            return Json(true);
        }

        [HttpGet]
        public JsonResult GetRadClient(int id)
        {
            var dbModel = RadService.GetRadClient(id);
            if (dbModel == null)
                return Json(new { result = false });

            return Json(dbModel);
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult AddRadClient(RadClient client)
        {
            if (string.IsNullOrEmpty(client.Email))
                return Json(new { result = false });

            try
            {
                RadService.AddRadClient(client);
                return Json(new { result = true });
            }
            catch (Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { result = false });
            }
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult UpdateRadClient(RadClient client)
        {
            var dbModel = RadService.GetRadClient(client.Id);
            if (dbModel == null || string.IsNullOrEmpty(client.Email))
                return Json(new { result = false });

            try
            {
                RadService.UpdateRadClient(client);
                return Json(new { result = true });
            }
            catch (Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { result = false });
            }
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult DeleteRadClient(int id)
        {
            RadService.DeleteRadClient(id);

            return Json(new { result = true });
        }

        [HttpPost, ValidateJsonAntiForgeryToken]
        public JsonResult CreateLeadByRadClient(int id)
        {
            try
            {
                var client = RadService.GetRadClient(id);
                if (client == null)
                    return Json(new { result = false, msg = "Ошибка" });

                var leadId = 0;
                if (client.LeadId.HasValue)
                    leadId = client.LeadId.Value;

                var isLeadExists = leadId > 0 && ModuleService.IsLeadExists(leadId);
                if (isLeadExists)
                    return Json(new { result = false, msg = "Для этой записи лид уже создан" });

                var formRequest = new FormRequestModel
                {
                    Email = client.Email,
                    ProductId = client.ProductId,
                    ProductOfferId = client.ProductOfferId
                };

                leadId = ModuleService.CreateLead(formRequest, false);
                client.LeadId = leadId;

                RadService.UpdateRadClient(client);

                return Json(new { result = true, msg = "Лид успешно создан", leadId = leadId, leadTitle = ModuleService.GetLeadTitle(leadId) });
            }
            catch (Exception ex)
            {
                Diagnostics.Debug.Log.Error(ex);
                return Json(new { result = false, msg = "Ошибка" });
            }

        }

        #endregion


        [HttpGet]
        public JsonResult GetSalesFunnelIds(bool remind)
        {
            var salesFunnelIds = new List<object>();

            var currentSalesFunnelId = remind ? ModuleSettings.SalesFunnelId : ModuleSettings.RadSalesFunnelId;
            var salesFunnels = ModuleService.GetSalesFunnelList();

            foreach (var salesFunnel in salesFunnels)
            {
                salesFunnelIds.Add(new { Id = salesFunnel.Id, Value = salesFunnel.Name, Selected = salesFunnel.Id == currentSalesFunnelId });
            }

            salesFunnelIds.Insert(0, new { Id = -1, Value = "Не выбран", Selected = currentSalesFunnelId == -1 });

            return Json(salesFunnelIds, JsonRequestBehavior.AllowGet);
        }

    }
}
