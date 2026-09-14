using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Services.Crm;
using AdvantShop.Diagnostics;
using AdvantShop.Mails;
using AdvantShop.Module.RemindAboutReceipt.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;

namespace AdvantShop.Module.RemindAboutReceipt.Service
{
    public class ModuleService
    {
        public static bool CreateTables()
        {
            try
            {
                var query = string.Empty;
                if (!ModulesRepository.IsExistsModuleTable("Module", "RemindAboutReceiptClients"))
                {
                    query = @"CREATE TABLE [Module].[RemindAboutReceiptClients]
                                (
                                    Id int not null IDENTITY(1, 1) CONSTRAINT PK_RemindAboutReceiptClients_Id PRIMARY KEY,
                                    Email nvarchar(max) not null,
                                    ProductId int not null,
                                    ProductOfferId nvarchar(100) not null,
                                    SendNotification bit not null,
                                    LeadId int null CONSTRAINT FK_RemindAboutReceiptClients_LeadId FOREIGN KEY REFERENCES [Order].[Lead] ([Id]) ON UPDATE CASCADE ON DELETE SET NULL
                                )";

                    ModulesRepository.ModuleExecuteNonQuery(query, CommandType.Text);
                }

                if (!ModulesRepository.IsExistsModuleTable("Module", "RemindAboutDiscountClients"))
                {
                    query = @"CREATE TABLE [Module].[RemindAboutDiscountClients]
                                (
                                    Id int not null IDENTITY(1, 1) CONSTRAINT PK_RemindAboutDiscountClients_Id PRIMARY KEY,
                                    Email nvarchar(max) not null,
                                    ProductId int not null,
                                    ProductOfferId nvarchar(100) not null,
                                    OldPrice float not null,
                                    SendNotification bit not null,
                                    LeadId int null CONSTRAINT FK_RemindAboutDiscountClients_LeadId FOREIGN KEY REFERENCES [Order].[Lead] ([Id]) ON UPDATE CASCADE ON DELETE SET NULL
                                )";

                    ModulesRepository.ModuleExecuteNonQuery(query, CommandType.Text);
                }

                return true;
            }
            catch(Exception ex)
            {
                Debug.Log.Error(ex);
                return false;
            }
        }

        public static bool Install()
        {
            return ModuleSettings.SetDefaultSettings() && CreateTables();
        }

        public static bool UnInstall()
        {
            return ModuleSettings.RemoveSettings();
        }
        
        public static string GetProductName(int productId)
        {
            return ModulesRepository.ModuleExecuteScalar<string>(
                "SELECT [Name] FROM [Catalog].[Product] WHERE [ProductID] = @ProductID",
                CommandType.Text,
                new SqlParameter("@ProductID", productId));
        }

        public static string GetProductUrlPath(int productId)
        {
            return ModulesRepository.ModuleExecuteScalar<string>(
                "SELECT [UrlPath] FROM [Catalog].[Product] WHERE [ProductID] = @ProductID",
                CommandType.Text,
                new SqlParameter("@ProductID", productId));
        }

        public static Guid GetCustomerId(string email)
        {
            return ModulesRepository.ModuleExecuteReadOne<Guid>(
                "SELECT [CustomerID] FROM [Customers].[Customer] WHERE [Email] = @Email",
                CommandType.Text,
                reader => ModulesRepository.ConvertTo<Guid>(reader, "CustomerID"),
                new SqlParameter("@Email", email));
        }

        public static bool IsLeadExists(int leadId)
        {
            return ModulesRepository.ModuleExecuteScalar<int>(
                "SELECT COUNT([Id]) FROM [Order].[Lead] WHERE [Id] = @LeadId",
                CommandType.Text,
                new SqlParameter("@LeadId", leadId)) > 0;
        }

        public static string GetLeadTitle(int leadId)
        {
            return ModulesRepository.ModuleExecuteScalar<string>(
                "SELECT [Title] FROM [Order].[Lead] WHERE [Id] = @LeadId",
                CommandType.Text,
                new SqlParameter("@LeadId", leadId));
        }

        private static FormRequestModel GetClientsForMessagesReader(SqlDataReader reader)
        {
            return new FormRequestModel
            {
                Id = ModulesRepository.ConvertTo<int>(reader, "Id"),
                ProductOfferId = ModulesRepository.ConvertTo<string>(reader, "ProductOfferId"),
                ProductId = ModulesRepository.ConvertTo<int>(reader, "ProductId"),
                Email = ModulesRepository.ConvertTo<string>(reader, "Email"),
                SendNotification = ModulesRepository.ConvertTo<bool>(reader, "SendNotification"),
            };
        }

        public static List<FormRequestModel> GetClientsForMessages()
        {
            return ModulesRepository.ModuleExecuteReadList<FormRequestModel>(
                "SELECT * FROM [Module].[RemindAboutReceiptClients] WHERE [SendNotification] = 0", 
                CommandType.Text,
                GetClientsForMessagesReader);
        }

        public static int AddClientForMessage(FormRequestModel formRequest)
        {
            return ModulesRepository.ModuleExecuteScalar<int>(
                "INSERT INTO Module.RemindAboutReceiptClients (ProductOfferId, ProductId, Email, SendNotification)" +
                " VALUES (@ProductOfferId, @ProductId, @Email, @SendNotification)",
                CommandType.Text,
                new SqlParameter("@Email", ModuleSettings.ShowEmailInForm ? formRequest.Email : string.Empty),
                new SqlParameter("@ProductOfferId", formRequest.ProductOfferId ?? string.Empty),
                new SqlParameter("@ProductId", formRequest.ProductId),
                new SqlParameter("@SendNotification", formRequest.SendNotification));
        }

        public static int DeleteClientAfterSendingMessage(FormRequestModel formRequest)
        {
            return ModulesRepository.ModuleExecuteScalar<int>(
                "DELETE FROM Module.RemindAboutReceiptClients  WHERE Id = @Id",
                CommandType.Text,
                new SqlParameter("@Id", formRequest.Id));
        }

        public static void DeleteClientRemindAboutReceipt(int id)
        {
            ModulesRepository.ModuleExecuteNonQuery(
                "DELETE FROM [Module].[RemindAboutReceiptClients]  WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", id));
        }

        public static int EditClient(FormRequestModel formRequest)
        {
            return ModulesRepository.ModuleExecuteScalar<int>("UPDATE Module.RemindAboutReceiptClients SET SendNotification = @SendNotification WHERE Email = @Email AND ProductOfferId = @ProductOfferId",
                CommandType.Text,
                new SqlParameter("@SendNotification", true),
                new SqlParameter("@Email", formRequest.Email),
                new SqlParameter("@ProductOfferId", formRequest.ProductOfferId));
        }

        public static void SendClientInformation(FormRequestModel formRequest, Product product)
        {
            try
            {
                var mailSubject = ModuleSettings.MailSubject ?? "Уведомление о поступлении";
                mailSubject = mailSubject.Replace("#PRODUCT_NAME#", product.Name);

                var mailBody = ModuleSettings.MailBody;

                if (string.IsNullOrEmpty(mailBody))
                    return;

                var logo = !string.IsNullOrEmpty(SettingsMain.LogoImageName)
                           ? string.Format("<img src=\"{0}\" alt=\"{1}\" title=\"{1}\" />",
                                           SettingsMain.SiteUrl.Trim('/') + '/' +
                                           FilePath.FoldersHelper.GetPathRelative(FilePath.FolderType.Pictures, SettingsMain.LogoImageName, false),
                                           SettingsMain.ShopName)
                           : string.Empty;

                mailBody = mailBody.Replace("#LOGO#", logo);
                mailBody = mailBody.Replace("#SITE_NAME#", SettingsMain.ShopName);
                mailBody = mailBody.Replace("#PRODUCT_NAME#", product.Name);
                mailBody = mailBody.Replace("#PRODUCT_LINK#", SettingsMain.SiteUrl + "/products/" + product.UrlPath);

                ModulesService.SendModuleMail(Guid.Empty, mailSubject, mailBody, formRequest.Email, true);
            }
            catch(Exception ex)
            {
                Debug.Log.Error(ex);
            }
        }

        public static int CreateLead(FormRequestModel formRequest, bool remind)
        {
            try
            {
                formRequest.Email = HttpUtility.HtmlEncode(formRequest.Email);
                formRequest.Name = HttpUtility.HtmlEncode(formRequest.Name);
                formRequest.Surname = HttpUtility.HtmlEncode(formRequest.Surname);
                formRequest.PhoneNumber = HttpUtility.HtmlEncode(formRequest.PhoneNumber);
                formRequest.Comment = HttpUtility.HtmlEncode(formRequest.Comment);
                
                var customer =
                    (!string.IsNullOrEmpty(formRequest.Email)
                        ? Customers.CustomerService.GetCustomerByEmail(formRequest.Email.ToLower())
                        : null) ??
                    new Customers.Customer
                    {
                        EMail = formRequest.Email,
                        FirstName = formRequest.Name,
                        LastName = formRequest.Surname,
                        Phone = !string.IsNullOrEmpty(formRequest.PhoneNumber) ? "8" + formRequest.PhoneNumber : null,
                        IsAgreeForPromotionalNewsletter = SettingsDesign.ShowUserAgreementForPromotionalNewsletter 
                                                          && SettingsDesign.SetUserAgreementForPromotionalNewsletterChecked
                    };

                var productLink = GetProductUrlPath(formRequest.ProductId);
                if (!string.IsNullOrEmpty(productLink))
                    productLink = SettingsMain.SiteUrl + "/products/" + productLink;
                
                var CommentString = new StringBuilder();
                string BrHtml = "<br>";
                string TagA = "<a href='" + productLink + "'target='_blank'>";

                CommentString.AppendLine(!string.IsNullOrEmpty(formRequest.Comment) ? formRequest.Comment : "");
                
                if (!string.IsNullOrEmpty(formRequest.Comment))
                {
                    CommentString.Append(BrHtml);
                    CommentString.Append(BrHtml);
                }

                CommentString.AppendLine("Ссылка на продукт покупателя:");
                CommentString.AppendLine(productLink);

                var lead = new Lead
                {
                    Customer = customer,
                    Email = !string.IsNullOrEmpty(formRequest.Email) ? formRequest.Email : customer.EMail,
                    Phone = !string.IsNullOrEmpty(formRequest.PhoneNumber) ? formRequest.PhoneNumber : customer.Phone,
                    FirstName = !string.IsNullOrEmpty(formRequest.Name) ? formRequest.Name : customer.FirstName,
                    LastName = !string.IsNullOrEmpty(formRequest.Surname) ? formRequest.Surname : customer.LastName,
                    Comment = CommentString.ToString().Replace("'", "\""),
                    OrderSourceId = ModuleSettings.OrderSourseId
                };

                var offer = !string.IsNullOrEmpty(formRequest.ProductOfferId) ? OfferService.GetOffer(formRequest.ProductOfferId) : null;

                if(offer != null)
                    lead.LeadItems.Add(new LeadItem(offer, 1, offer.RoundedPrice));

                if (lead.LeadItems != null && lead.LeadItems.Count > 0)
                    lead.Sum = lead.LeadItems.Sum(x => x.Amount * x.Price);

                var salesFunnelId = remind ? ModuleSettings.SalesFunnelId : ModuleSettings.RadSalesFunnelId;
                if (salesFunnelId > 0)
                    lead.SalesFunnelId = salesFunnelId;

                LeadService.AddLead(lead, false);

                return lead.Id;
            }
            catch(Exception ex)
            {
                Debug.Log.Error(ex);
                return -1;
            }
        }

        public static void CheckProductsEveryThreeHours()
        {
            
            var clients = GetClientsForMessages();
            if (clients.Count > 0)
            {
                foreach (FormRequestModel client in clients)
                {
                    try
                    {
                        var product = ProductService.GetProduct(client.ProductId);
                        if (product == null)
                        {
                            DeleteClientRemindAboutReceipt(client.Id);
                            continue;
                        }

                        CheckOffer(product, client);
                    }
                    catch (Exception ex)
                    {
                        Debug.Log.Error(ex);
                    }
                }
            }

            clients = GetRadClientsForMessages();
            if(clients.Count > 0)
            {
                foreach (FormRequestModel client in clients)
                {
                    try
                    {
                        var offer = OfferService.GetOffer(client.ProductOfferId);
                        if (offer == null)
                        {
                            DeleteRadClientRemindAboutReceipt(client.Id);
                            continue;
                        }
                        
                        var oldPrice = client.OldPrice;
                        RadCheckOffer(offer, oldPrice, client);
                    }
                    catch (Exception ex)
                    {
                        Debug.Log.Error(ex);
                    }
                }
            }
        }

        public static void CheckOffer(Product product, FormRequestModel client)
        {
            var productOffers = product.Offers != null && product.Offers.Count > 0
                                ? product.Offers
                                : null;

            if (productOffers == null)
                return;

            var offer = productOffers.FirstOrDefault(x => x.ArtNo == client.ProductOfferId && x.Amount > 0);
            if(offer != null)
            {
                SendClientInformation(client, product);
                EditClient(client);
            }

            /*var notNullProductAmount = productOffers.Count(x => x.Amount > 0);

            if (notNullProductAmount > 0)
            {
                foreach (FormRequestModel client in clients)
                {
                    if (client.SendNotification)
                        continue;

                    if (productOffers.Where(x => x.Amount > 0).Select(x => x.ArtNo).Contains(client.ProductOfferId))
                    {
                        SendClientInformation(client);
                        EditClient(client);
                        //DeleteClientAfterSendingMessage(client);
                    }
                }
            }*/
        }

        public static int AddOrderSource()
        {
            var orderSource = Orders.OrderSourceService.GetOrderSource(string.Format("Модуль \"{0}\"", RemindAboutReceipt.ModuleName));
            int orderSourceId = 0;
            if (orderSource != null) {
                orderSourceId = orderSource.Id;
                return orderSourceId;
            }

            var maxSortOrder = ModulesRepository.ModuleExecuteScalar<int>("SELECT MAX([SortOrder]) FROM [Order].[OrderSource]", CommandType.Text);
            orderSource = new Orders.OrderSource
            {
                Name = string.Format("Модуль \"{0}\"", RemindAboutReceipt.ModuleName),
                SortOrder = maxSortOrder + 10,
                Type = Core.Services.Orders.OrderType.None,
                Main = false
            };

            orderSourceId = Orders.OrderSourceService.AddOrderSource(orderSource);
            return orderSourceId;
        }

        public static void DeleteOrderSource()
        {
            var orderSource = Orders.OrderSourceService.GetOrderSource(string.Format("Модуль \"{0}\"", RemindAboutReceipt.ModuleName));
            if (orderSource == null) { return; }

            Orders.OrderSourceService.DeleteOrderSource(orderSource.Id);
        }

        public static int CreateMailFormat()
        {
            var text = new StringBuilder();

            text.AppendFormat("<div style='color:#4c4f56; font-family: Arial, Helvetica, sans-serif; font-size: 15px;'><div class='header' style='border-bottom: 1px solid #ededed; display: table; margin-bottom: 25px; padding-bottom: 25px; width: 100%;'><div class='logo' style='display: table-cell; text-align: left; vertical-align: middle;'>#LOGO#</div>" +
                "<div class='phone' style='display: table - cell; text - align: right; vertical - align: middle;'><div class='tel' style='font-size: 26px; font-weight: bold; line-height: 1; margin-bottom: 5px;'>&nbsp;</div>" +
                "<div class='inform' style='font-size: 15px;'><span style='line-height:115%'>Здравствуйте!</span></div></div></div>" +
                "<p>В интернет-магазине {0} Вы были подписаны на получение информации о поступлении в наличие товара:&nbsp;&nbsp;#PRODUCT_NAME#</p>" +
                "<p>Для покупки, перейдите по ссылке:&nbsp;<a href='#PRODUCT_LINK#'>#PRODUCT_LINK#<a></p>", SettingsMain.ShopName);

            var MailFormatId = MailFormatService.Add(new MailFormat()
            {
                MailFormatTypeId = 11,
                FormatName = "Уведомление о поступлении товара",
                FormatSubject = "Уведомление о поступлении товара",
                FormatText = text.ToString().Replace("'", "\""),
                Enable = true,
                SortOrder = 10
            });

            //ModuleSettings.MailForUserId = MailFormatId;
            return MailFormatId;
        }

        #region Image
        public const string ImagesPath = "pictures/modules/RemindAboutReceipt/";

        public static string GetPath(string path)
        {
            return System.Web.Hosting.HostingEnvironment.MapPath("~/") + path;
        }

        public static bool RadSetDefaultImage()
        {
            try
            {
                var path = GetPath(ImagesPath);
                if (!System.IO.Directory.Exists(path))
                {
                    System.IO.Directory.CreateDirectory(path);
                }

                var imageFile = GetPath("modules/remindaboutreceipt/content/images/" + ModuleSettings.RadImagePath);
                if (System.IO.File.Exists(imageFile))
                {
                    System.IO.File.Copy(imageFile, path + ModuleSettings.RadImagePath);
                }
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }

            return true;
        }

        #endregion

        #region discount 
        public static void RadCheckOffer(Offer offer, float oldPrice, FormRequestModel client)
        {
            var offerNewPrice = RadGetCurrentPriceForOffer(offer);
            if (oldPrice > offerNewPrice && client.OldPrice > offerNewPrice 
                && (ModuleSettings.RadCheckAmount && offer.Amount > 0 || !ModuleSettings.RadCheckAmount))
            {
                SendRadClientInformation(client, offer.Product);
                EditRadClient(client);

                /*foreach (FormRequestModel client in clients.Where(x => x.ProductOfferId == offer.ArtNo))
                {
                    if (!client.SendNotification && client.OldPrice > offerNewPrice &&
                        (ModuleSettings.RadCheckAmount && offer.Amount > 0 || !ModuleSettings.RadCheckAmount))
                    {
                        SendRadClientInformation(client, offer.Product);
                        EditRadClient(client);
                    }
                }*/
            }
        }

        private static FormRequestModel GetRadClientsForMessagesReader(SqlDataReader reader)
        {
            return new FormRequestModel
            {
                Id = ModulesRepository.ConvertTo<int>(reader, "Id"),
                ProductOfferId = ModulesRepository.ConvertTo<string>(reader, "ProductOfferId"),
                ProductId = ModulesRepository.ConvertTo<int>(reader, "ProductId"),
                Email = ModulesRepository.ConvertTo<string>(reader, "Email"),
                SendNotification = ModulesRepository.ConvertTo<bool>(reader, "SendNotification"),
                OldPrice = ModulesRepository.ConvertTo<float>(reader, "OldPrice")
            };
        }

        public static List<FormRequestModel> GetRadClientsForMessages()
        {
            return ModulesRepository.ModuleExecuteReadList<FormRequestModel>(
                "SELECT * FROM [Module].[RemindAboutDiscountClients] WHERE [SendNotification] = 0",
                CommandType.Text,
                GetRadClientsForMessagesReader);
        }

        public static int AddRadClientForMessage(FormRequestModel formRequest)
        {
            return ModulesRepository.ModuleExecuteScalar<int>(
                "INSERT INTO Module.RemindAboutDiscountClients (ProductOfferId, ProductId, Email, SendNotification, OldPrice)" +
                " VALUES (@ProductOfferId, @ProductId, @Email, @SendNotification, @OldPrice)",
                CommandType.Text,
                new SqlParameter("@Email", ModuleSettings.ShowEmailInForm ? formRequest.Email : string.Empty),
                new SqlParameter("@ProductOfferId", formRequest.ProductOfferId ?? string.Empty),
                new SqlParameter("@ProductId", formRequest.ProductId),
                new SqlParameter("@SendNotification", formRequest.SendNotification),
                new SqlParameter("@OldPrice", formRequest.OldPrice)
            );
        }

        public static int DeleteRadClientAfterSendingMessage(FormRequestModel formRequest)
        {
            return ModulesRepository.ModuleExecuteScalar<int>(
                "DELETE FROM Module.RemindAboutDiscountClients  WHERE Id = @Id",
                CommandType.Text,
                new SqlParameter("@Id", formRequest.Id));
        }

        public static void DeleteRadClientRemindAboutReceipt(int id)
        {
            ModulesRepository.ModuleExecuteNonQuery(
                "DELETE FROM [Module].[RemindAboutDiscountClients]  WHERE [Id] = @Id",
                CommandType.Text,
                new SqlParameter("@Id", id));
        }

        public static int EditRadClient(FormRequestModel formRequest)
        {
            return ModulesRepository.ModuleExecuteScalar<int>("UPDATE Module.RemindAboutDiscountClients SET SendNotification = @SendNotification WHERE Email = @Email AND ProductOfferId = @ProductOfferId",
                CommandType.Text,
                new SqlParameter("@SendNotification", true),
                new SqlParameter("@Email", formRequest.Email),
                new SqlParameter("@ProductOfferId", formRequest.ProductOfferId)
                );
        }

        public static void SendRadClientInformation(FormRequestModel formRequest, Product product)
        {
            try
            {
                var mailSubject = ModuleSettings.RadLetterSubject ?? string.Empty;
                mailSubject = mailSubject.Replace("#PRODUCTNAME#", product.Name);

                var mailBody = ModuleSettings.RadLetterBody ?? string.Empty;

                var logo = !string.IsNullOrEmpty(SettingsMain.LogoImageName)
                                           ? string.Format("<img src=\"{0}\" alt=\"{1}\" title=\"{1}\" />",
                                                           SettingsMain.SiteUrl.Trim('/') + '/' +
                                                           FilePath.FoldersHelper.GetPathRelative(FilePath.FolderType.Pictures, Configuration.SettingsMain.LogoImageName, false),
                                                           SettingsMain.ShopName)
                                           : string.Empty;

                mailBody = mailBody.Replace("#LOGO#", logo);
                mailBody = mailBody.Replace("#SHOPURL#", SettingsMain.SiteUrl);
                mailBody = mailBody.Replace("#PRODUCTLINK#", SettingsMain.SiteUrl + "/products/" + product.UrlPath);
                mailBody = mailBody.Replace("#PRODUCTNAME#", product.Name);

                ModulesService.SendModuleMail(Guid.Empty, mailSubject, mailBody, formRequest.Email, true);

            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
            }
        }
        
        public static float RadGetCurrentPriceForOffer(Offer offer)
        {
            var CurrentPriceForOffer = offer.RoundedPrice;
            if (offer.Product.Discount != null)
            {
                if (offer.Product.Discount.Type == DiscountType.Percent)
                    CurrentPriceForOffer = offer.RoundedPrice * (100 - offer.Product.Discount.Value) / 100;
                else if (offer.Product.Discount.Type == DiscountType.Amount)
                {
                    var DiscountPrice = offer.Product.Discount.Value;
                    var ProductCurrency = offer.Product.Currency;
                    if (ProductCurrency != Repository.Currencies.CurrencyService.CurrentCurrency)
                        DiscountPrice = DiscountPrice * ProductCurrency.Rate;

                    CurrentPriceForOffer = offer.RoundedPrice - DiscountPrice;
                }
            }

            return (float)Math.Round(CurrentPriceForOffer);
        }

        #endregion

        public static List<SalesFunnelShort> GetSalesFunnelList()
        {
            return ModulesRepository.ModuleExecuteReadList<SalesFunnelShort>(
                "SELECT [Id], [Name] FROM [CRM].[SalesFunnel] ORDER BY [SortOrder]",
                CommandType.Text,
                reader => new SalesFunnelShort
                {
                    Id = ModulesRepository.ConvertTo<int>(reader, "Id"),
                    Name = ModulesRepository.ConvertTo<string>(reader, "Name")
                });
        }

        #region Banners Promo
        public static BannersSettingsModel GetPromoContentBannersData()
        {
            try
            {
                var url = "http://crm.promo-z.ru/PromoContentClient/GetBannersData";

                using (var webClient = new WebClient())
                {
                    webClient.Encoding = Encoding.UTF8;

                    var response = webClient.DownloadString(url);
                    return JsonConvert.DeserializeObject<BannersSettingsModel>(response);
                }
            }
            catch (Exception ex)
            {
                Debug.Log.Error(ex);
                return null;
            }
        }

        #endregion
    }
}
