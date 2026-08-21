if not Exists (Select 1 From [Settings].[Settings] Where Name = 'NewsCategoryH1') and Exists(Select 1 From [Settings].[Settings] Where Name = 'NewsMainH1') 
begin
	Update [Settings].[Settings] Set Name = 'NewsCategoryH1' Where Name = 'NewsMainH1'
end

if not Exists (Select 1 From [Settings].[Settings] Where Name = 'NewsCategoryTitle') and Exists(Select 1 From [Settings].[Settings] Where Name = 'NewsMainTitle') 
begin
	Update [Settings].[Settings] Set Name = 'NewsCategoryTitle' Where Name = 'NewsMainTitle'
end

if not Exists (Select 1 From [Settings].[Settings] Where Name = 'NewsCategoryMetaDescription') and Exists(Select 1 From [Settings].[Settings] Where Name = 'NewsMainMetaDescription') 
begin
	Update [Settings].[Settings] Set Name = 'NewsCategoryMetaDescription' Where Name = 'NewsMainMetaDescription'
end

if not Exists (Select 1 From [Settings].[Settings] Where Name = 'NewsCategoryMetaKeywords') and Exists(Select 1 From [Settings].[Settings] Where Name = 'MainMetaKeywords') 
begin
	Update [Settings].[Settings] Set Name = 'NewsCategoryMetaKeywords' Where Name = 'MainMetaKeywords'
end

GO--

UPDATE Cms.Menu
SET MenuItemUrlPath = SUBSTRING(
        MenuItemUrlPath,
        CHARINDEX('/', MenuItemUrlPath, 29) + 1, -- 29 — длина 'https://my.advantshop.net/'
        LEN(MenuItemUrlPath)
                      )
WHERE MenuItemUrlPath LIKE 'https://my.advantshop.net/%';

UPDATE Cms.Menu
SET MenuItemUrlPath = SUBSTRING(
        MenuItemUrlPath,
        CHARINDEX('/', MenuItemUrlPath, CHARINDEX('.on-advantshop.net/', MenuItemUrlPath)) + 1,
        LEN(MenuItemUrlPath)
                      )
WHERE MenuItemUrlPath LIKE '%.on-advantshop.net/%';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Crm.ECustomerFieldType.AgreeForPromotionalNewsletter', 'Согласие на получение рассылок'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Crm.ECustomerFieldType.AgreeForPromotionalNewsletter', 'User agreement for subscription to promotional news'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Crm.ELeadFieldType.AgreeForPromotionalNewsletter', 'Согласие на получение рассылок'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Crm.ELeadFieldType.AgreeForPromotionalNewsletter', 'User agreement for subscription to promotional news'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Crm.EOrderFieldType.AgreeForPromotionalNewsletter', 'Согласие на получение рассылок'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Crm.EOrderFieldType.AgreeForPromotionalNewsletter', 'User agreement for subscription to promotional news'

GO--

IF NOT EXISTS(SELECT * FROM [dbo].[Migration] WHERE [Name] = 'CustomerRoleActionOrderExtend')
BEGIN
    INSERT INTO [Customers].[CustomerRoleAction] (CustomerID, RoleActionKey, Enabled)
    SELECT
        parent.CustomerID,
        ra.RoleActionKey,
        1 AS Enabled
    FROM (
             SELECT DISTINCT cra.CustomerID
             FROM [Customers].[CustomerRoleAction] cra
             WHERE cra.RoleActionKey = 'Orders'
               AND NOT EXISTS (
                 SELECT 1
                 FROM [Customers].[CustomerRoleAction] child
                 WHERE child.CustomerID = cra.CustomerID
               AND child.RoleActionKey IN (
                 'OrderDelete',
                 'OrderChangeStatus',
                 'OrderChangePayment',
                 'EditingOrders'
                 )
                 )
         ) parent
             CROSS JOIN (VALUES
                             ('OrderDelete'),
                             ('OrderChangeStatus'),
                             ('OrderChangePayment'),
                             ('EditingOrders')
    ) ra(RoleActionKey);
    INSERT INTO [dbo].[Migration] ([Name], [Date]) VALUES ('CustomerRoleActionOrderExtend', GETDATE());
END

GO--

IF NOT EXISTS(SELECT * FROM [dbo].[Migration] WHERE [Name] = 'CustomerRoleActionCustomerExtend')
BEGIN
    INSERT INTO [Customers].[CustomerRoleAction] (CustomerID, RoleActionKey, Enabled)
    SELECT
        parent.CustomerID,
        ra.RoleActionKey,
        1 AS Enabled
    FROM (
             SELECT DISTINCT cra.CustomerID
             FROM [Customers].[CustomerRoleAction] cra
             WHERE cra.RoleActionKey = 'Customers'
               AND NOT EXISTS (
                 SELECT 1
                 FROM [Customers].[CustomerRoleAction] child
                 WHERE child.CustomerID = cra.CustomerID
               AND child.RoleActionKey IN (
                 'CustomerExport',
                 'CustomerDelete'
                 )
                 )
         ) parent
             CROSS JOIN (VALUES
                             ('CustomerExport'),
                             ('CustomerDelete')
    ) ra(RoleActionKey);
    INSERT INTO [dbo].[Migration] ([Name], [Date]) VALUES ('CustomerRoleActionCustomerExtend', GETDATE());
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Bonuses.Rule.GiftBonusError', 'Значение "Начислить бонусы на карту" должно быть больше 0'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Bonuses.Rule.GiftBonusError', 'The value of "Add bonuses to the card" must be greater than 0'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingMethods.PointDelivery.HideNotAvailableWarehouses', 'Скрывать недоступные склады'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingMethods.PointDelivery.HideNotAvailableWarehouses', 'Hide inaccessible warehouses'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingMethods.PointDelivery.HideNotAvailableWarehousesHint', 'Если на складе нет нужного количества товара, то он будет недоступен к выбору'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingMethods.PointDelivery.HideNotAvailableWarehousesHint', 'If there is not enough stock, the product will not be available for selection'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shippings.ShippingPoint.Error.HaveNotAvailableItems', 'Не все позиции заказа доступны в этом пункте выдачи'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shippings.ShippingPoint.Error.HaveNotAvailableItems', 'Not all order items are available at this pick-up point'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.CongratulationsDashboardv2.TrialPeriod', 'У вас подключен пробный период. Выберите тарифный план с помесячной или годовой оплатой со скидкой.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.CongratulationsDashboardv2.TrialPeriod', 'You have a trial period enabled. Choose a monthly or annual plan with a discount.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Home.CongratulationsDashboard.HaveTrial', 'У вас подключен пробный период. Выберите тарифный план с помесячной или годовой оплатой со скидкой.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Home.CongratulationsDashboard.HaveTrial', 'You have a trial period enabled. Choose a monthly or annual plan with a discount.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Home.SettingStoreDashboard.HaveTrial', 'У вас подключен пробный период. Выберите тарифный план с помесячной или годовой оплатой со скидкой.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Home.SettingStoreDashboard.HaveTrial', 'You have a trial period enabled. Choose a monthly or annual plan with a discount.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Currency.InsertUpdate.RateIsZeroError', 'Значение валюты не может быть равно 0'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Currency.InsertUpdate.RateIsZeroError', 'Currency value cannot be equal to 0'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsCatalog.CurrencyInplace.CurrencyNullError', 'Не удалось найти валюту'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsCatalog.CurrencyInplace.CurrencyNullError', 'Failed to find currency'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsCatalog.UpdateCurrency.CurrencyNullError', 'Не удалось найти валюту'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsCatalog.UpdateCurrency.CurrencyNullError', 'Failed to find currency'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsCatalog.CurrencyInplace.InternalError', 'Произошла внутренняя ошибка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsCatalog.CurrencyInplace.InternalError', 'An internal error has occurred'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsCatalog.AddCurrency.InternalError', 'Произошла внутренняя ошибка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsCatalog.AddCurrency.InternalError', 'An internal error has occurred'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsCatalog.UpdateCurrency.InternalError', 'Произошла внутренняя ошибка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsCatalog.UpdateCurrency.InternalError', 'An internal error has occurred'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.CurrencyModel.RequiredFieldsError', 'Заполните обязательные поля'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.CurrencyModel.RequiredFieldsError', 'Please fill in the required fields'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.CurrencyModel.IsoCodeAlreadyExistsError', 'Код ISO занят'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.CurrencyModel.IsoCodeAlreadyExistsError', 'ISO code is already in use'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.SocialButtons.MaxLink', 'Ссылка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.SocialButtons.MaxLink', 'Link'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.SocialButtons.MaxLinkText', 'Текст ссылки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.SocialButtons.MaxLinkText', 'Link text'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Social.LinkMaxActive', 'Max'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Social.LinkMaxActive', 'Max'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Social.SocialWidget.ShowMax', 'Показывать Max'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Social.SocialWidget.ShowMax', 'Show Max'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Social.SocialWidget.ShowMax.HelpText', '1) Активируйте виджет коммуникаций - поставьте галочку в поле "Показывать виджет коммуникаций" <br/>2) Активируйте виджеты, которые планируете выводить (для этого поставьте галочки в полях "Показывать Max") <br/>3) И подключите виджеты согласно инструкции.<br/><br/>Подробнее:<br> <a href="https://www.advantshop.net/help/pages/vidzhety-kommunikatsii" target="_blank">Виджеты коммуникаций.</a>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Social.SocialWidget.ShowMax.HelpText', '1) Activate the communications widget - check the box "Show communications widget" <br/> 2) Activate the widgets that you plan to display (for this, check the boxes "Show Max") <br/> 3) And connect the widgets according to the instructions . <br/> <br/> More information: <br> <a href="https://www.advantshop.net/help/pages/vidzhety-kommunikatsii" target="_blank"> Communication widgets. </a>'

UPDATE [Settings].[Localization] SET ResourceValue = 'Контакты' WHERE ResourceKey = 'Admin.Js.Langings.BlocksConstructor.Contacts.Contacts' AND LanguageId = 1

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Landings.Views.Blocks.Config.ContactsButtonsSocials.MaxText', 'Max'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Landings.Views.Blocks.Config.ContactsButtonsSocials.MaxText', 'Max'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Shipping.Yandex.UnavailablePickPoint', 'Выбранный пункт выдачи недоступен'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Shipping.Yandex.UnavailablePickPoint', 'The selected pick-up point is unavailable'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Shipping.Yandex.UnavailablePickPointInCity', 'Выбранный пункт выдачи недоступен в указанном городе'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Shipping.Yandex.UnavailablePickPointInCity', 'The selected pick-up point is not available in the specified city'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Triggers.SaveTrigger.ValidationError.EmailSubjectAndText', 'Укажите тему и текст письма'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Triggers.SaveTrigger.ValidationError.EmailSubjectAndText', 'Specify the subject and text of the letter'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Triggers.SaveTrigger.ValidationError.EmailSubject', 'Укажите тему письма'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Triggers.SaveTrigger.ValidationError.EmailSubject', 'Specify the subject of the letter'


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Triggers.SaveTrigger.ValidationError.EmailText', 'Укажите текст письма'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Triggers.SaveTrigger.ValidationError.EmailText', 'Specify text of the letter'


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Triggers.SaveTrigger.ValidationError.EmailRecipient', 'Должен быть выбран получатель: покупатель или другой человек'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Triggers.SaveTrigger.ValidationError.EmailRecipient', 'A recipient must be selected: the buyer or another person.'


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Triggers.SaveTrigger.ValidationError.PushNotificationText', 'Укажите текст уведомления'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Triggers.SaveTrigger.ValidationError.PushNotificationText', 'Specify text of the notification'


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Triggers.SaveTrigger.ValidationError.EditField', 'Выберите поле'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Triggers.SaveTrigger.ValidationError.EditField', 'Select the field'


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Triggers.SaveTrigger.ValidationError.SendRequestUrl', 'Укажите URL'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Triggers.SaveTrigger.ValidationError.SendRequestUrl', 'Specify URL'


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Triggers.SaveTrigger.ValidationError.SmsRecipient', 'Должен быть выбран получатель: покупатель или другой человек'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Triggers.SaveTrigger.ValidationError.SmsRecipient', 'A recipient must be selected: the buyer or another person.'

GO--

if not exists (select *
               from Catalog.Tax
               where TaxType = 8)
    begin
        insert into Catalog.Tax (Name, Enabled, ShowInPrice, Rate, TaxType)
        values (N'НДС 22%', 1, 1, 22, 8);
    end

GO--

UPDATE [Settings].[InternalSettings] SET [settingValue] = '13.0.7' WHERE [settingKey] = 'db_version'
