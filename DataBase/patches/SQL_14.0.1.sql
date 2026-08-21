EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.CustomerSettings.ForbiddenChangeAddressBook', 'Запретить покупателю редактировать адресную книгу'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.CustomerSettings.ForbiddenChangeAddressBook', 'Prevent the buyer from editing the address book'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.CustomerSettings.ForbiddenChangeAddressBookHelp', 'Запрет для покупателя на редактирование адресной книги в личном кабинете'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.CustomerSettings.ForbiddenChangeAddressBookHelp', 'The buyer is prohibited from editing the address book in their personal account.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.NotifyEMails.BannedList', 'Список заблокированных'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.NotifyEMails.BannedList', 'Banned list'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.SettingsSms.Phone', 'Телефон'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.SettingsSms.Phone', 'Phone'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.SettingsSms.UntilDate', 'До даты'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.SettingsSms.UntilDate', 'Until date'

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Customers].[SmsBan]') AND name = N'Id')
BEGIN
    ALTER TABLE [Customers].[SmsBan]
		ADD Id INT IDENTITY(1,1) NOT NULL
			CONSTRAINT PK_Customers_SmsBan_Id PRIMARY KEY CLUSTERED;
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Warehouses.IsEnabledShopsPage', N'Показывать страницу всех складов на витрине';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Warehouses.IsEnabledShopsPage', 'Show shop page';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Customers.Customer.Manager', N'Менеджер';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Customers.Customer.Manager', 'Manager';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Catalog.MenuCatalogSubCategory.Less', 'Скрыть'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Catalog.MenuCatalogSubCategory.Less', 'Less'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.TypeOfComparison.More', N'≥'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.TypeOfComparison.More', N'More or equal'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.TypeOfComparison.Less', N'≤'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.TypeOfComparison.Less', N'Less or equal'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.TypeOfComparison.Range', N'Диапазон'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsSeo.RedirectToLowerUrl', N'Редиректить в нижний регистр'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsSeo.RedirectToLowerUrl', 'Redirect to lowercase url'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.S.SettingsSeo.SuccessfullySaved', 'Настройки сохранены'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.S.SettingsSeo.SuccessfullySaved', 'Settings has been saved'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MyAccount.BringFriend.ReferralCode', 'Реферальный код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MyAccount.BringFriend.ReferralCode', 'Referral code'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MyAccount.CodeCopied', 'Код скопирован'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MyAccount.CodeCopied', 'Code copied'

GO--

delete from [Settings].[Settings]   where name like '_DELETE_%'

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Catalog].[PriceRule]') AND name = 'Mode')
BEGIN
    ALTER TABLE [Catalog].[PriceRule] ADD Mode TINYINT NOT NULL DEFAULT 0
END

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Catalog].[PriceRule]') AND name = 'CartSum')
BEGIN
    ALTER TABLE [Catalog].[PriceRule] ADD CartSum FLOAT NOT NULL DEFAULT 0
END

GO--

IF NOT EXISTS (SELECT * FROM [Settings].[Settings] WHERE Name = 'ShowCartSumAmountsTableInProduct')
    INSERT INTO [Settings].[Settings] ([Name],[Value]) VALUES ('ShowCartSumAmountsTableInProduct', 'False')

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Catalog.PriceRuleMode.ByQuantity', N'От количества'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Catalog.PriceRuleMode.ByQuantity', 'By quantity'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Catalog.PriceRuleMode.ByCartSum', N'От суммы корзины'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Catalog.PriceRuleMode.ByCartSum', 'By cart sum'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditPriceRule.Mode', N'Тип применения'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditPriceRule.Mode', 'Mode'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditPriceRule.CartSum', N'Сумма корзины'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditPriceRule.CartSum', 'Cart sum'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Catalog.ShowCartSumAmountsTableInProduct', N'Выводить таблицу от суммы корзины и ценой в товаре'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Catalog.ShowCartSumAmountsTableInProduct', 'Show cart sum price table in product'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Catalog.ShowCartSumAmountsTableInProductHint', N'Если активна, в карточке товара будет выводиться таблица с ценами в зависимости от суммы заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Catalog.ShowCartSumAmountsTableInProductHint', 'If enabled, a table with prices depending on the order sum will be displayed in the product card'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Catalog.PriceRuleMode.ByQuantity', N'От количества'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Catalog.PriceRuleMode.ByQuantity', 'By quantity'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Catalog.PriceRuleMode.ByCartSum', N'От суммы корзины'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Catalog.PriceRuleMode.ByCartSum', 'By cart sum'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Catalog.CartSumAmountTable.From', N'от {0}'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Catalog.CartSumAmountTable.From', 'from {0}'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Catalog.CartSumAmountTable.OrderSum', N'Сумма заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Catalog.CartSumAmountTable.OrderSum', 'Order sum'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Catalog.PriceRulePriority', N'Приоритет типа цен'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Catalog.PriceRulePriority', 'Price rule priority'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Catalog.PriceRulePriority.PriceRulePriorityHint', N'Можно выбрать какому правилу будет отдаваться приоритет, если пересекаются правила "От количества" и "От суммы корзины"'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Catalog.PriceRulePriority.PriceRulePriorityHint', 'You can choose which rule takes precedence if the "By quantity” and “By cart sum rules overlap"'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Catalog.ShowNextDiscountsByCartSumInCart', N'Выводить следующую возможную цену и скидку от суммы корзины на странице корзины'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Catalog.ShowNextDiscountsByCartSumInCart', 'Display the next possible price and discount based on the cart total on the cart page'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Catalog.ShowNextDiscountsByCartSumInCartHint', N'Выводить следующую возможную цену и скидку от суммы корзины на странице корзины. Это может мотивировать покупателя купить больше товара.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Catalog.ShowNextDiscountsByCartSumInCartHint', 'Display the next possible price and discount based on the cart total on the cart page. This may encourage the customer to buy more.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.2OrMoreRecipients', 'Вы можете указать 2 и более получателей через символ точки с запятой.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.2OrMoreRecipients', 'You can specify 2 or more recipients via a semicolon character.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.ForExample', 'Например: '
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.ForExample', 'For example: '

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[CMS].[Carousel]') AND name = 'HeaderTextColorCode')
BEGIN
    ALTER TABLE [CMS].[Carousel] ADD HeaderTextColorCode [nvarchar](10) NULL
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditCarousel.HeaderTextColor', 'Цвет текста в шапке'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditCarousel.HeaderTextColor', 'Text color in the header'

GO--

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'WarmupLog')
    BEGIN
        CREATE TABLE [dbo].[WarmupLog]
        (
            [Id]        INT           NOT NULL IDENTITY(1,1) PRIMARY KEY,
            [Info]      NVARCHAR(500) NOT NULL,
            [StartTime] DATETIME      NOT NULL,
            [EndTime]   DATETIME      NOT NULL
        );
    END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.OrderStatusOnError', 'Статус заказа при ошибке передачи'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.OrderStatusOnError', 'Order status in case of transmission error'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.NotSelected', 'Не выбрано'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.NotSelected', 'Not selected'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Triggers.Action.SendToShippingService.OrderChangedBy', 'Триггер {0}'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Triggers.Action.SendToShippingService.OrderChangedBy', 'Trigger {0}'

GO--

-- Миграция НДС 18% и 20% в 22%

-- Убедиться что запись Tax с TaxType=8 (Vat22) существует
IF NOT EXISTS (SELECT * FROM [Catalog].[Tax] WHERE [TaxType] = 8)
BEGIN
    INSERT INTO [Catalog].[Tax] ([Name], [Enabled], [ShowInPrice], [Rate], [TaxType])
    VALUES (N'НДС 22%', 1, 1, 22, 8)
END

GO--

-- Перенести все ссылки с TaxId записей Vat18/Vat20 на TaxId записи Vat22
DECLARE @Vat22TaxId int = (SELECT TOP 1 [TaxId] FROM [Catalog].[Tax] WHERE [TaxType] = 8)

IF @Vat22TaxId IS NOT NULL
BEGIN
    -- Product
    UPDATE [Catalog].[Product]
    SET [TaxId] = @Vat22TaxId
    WHERE [TaxId] IN (SELECT [TaxId] FROM [Catalog].[Tax] WHERE [TaxType] IN (4, 5))

    -- PaymentMethod
    UPDATE [Order].[PaymentMethod]
    SET [TaxId] = @Vat22TaxId
    WHERE [TaxId] IN (SELECT [TaxId] FROM [Catalog].[Tax] WHERE [TaxType] IN (4, 5))

    -- ShippingMethod
    UPDATE [Order].[ShippingMethod]
    SET [TaxId] = @Vat22TaxId
    WHERE [TaxId] IN (SELECT [TaxId] FROM [Catalog].[Tax] WHERE [TaxType] IN (4, 5))

    -- GiftCertificateTaxes
    UPDATE [Settings].[GiftCertificateTaxes]
    SET [TaxID] = @Vat22TaxId
    WHERE [TaxID] IN (SELECT [TaxId] FROM [Catalog].[Tax] WHERE [TaxType] IN (4, 5))

    -- DefaultTaxId в настройках
    IF EXISTS (SELECT 1 FROM [Settings].[Settings] WHERE [Name] = 'DefaultTaxId'
               AND [Value] IN (SELECT CAST([TaxId] AS nvarchar) FROM [Catalog].[Tax] WHERE [TaxType] IN (4, 5)))
        UPDATE [Settings].[Settings]
        SET [Value] = CAST(@Vat22TaxId AS nvarchar)
        WHERE [Name] = 'DefaultTaxId'

    -- Удалить старые записи Vat18/Vat20
    DELETE FROM [Catalog].[Tax] WHERE [TaxType] IN (4, 5)
END

GO--
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_OfferPriceRule'
      AND object_id = OBJECT_ID('[Catalog].[OfferPriceRule]')
)
BEGIN
    CREATE UNIQUE INDEX UX_OfferPriceRule
    ON [Catalog].[OfferPriceRule](OfferId, PriceRuleId);
END

GO--

IF EXISTS (SELECT *
           FROM sys.objects
           WHERE object_id = OBJECT_ID(N'[CMS].[sp_GetParentStaticPages]')
             AND type = 'P')
    BEGIN
        DROP PROCEDURE [CMS].[sp_GetParentStaticPages]
    END

GO--

IF EXISTS (SELECT 1 
            FROM [Catalog].[OfferPriceRule] 
            GROUP BY OfferId, PriceRuleId 
            HAVING COUNT(*) > 1)
BEGIN
    WITH cte AS (
        SELECT *,
            ROW_NUMBER() OVER (
                PARTITION BY OfferId, PriceRuleId
                ORDER BY (SELECT NULL)
            ) AS rn
        FROM [Catalog].[OfferPriceRule]
    )
    DELETE FROM cte
    WHERE rn > 1
END

GO--

IF EXISTS (SELECT 1 
            FROM [Catalog].[ProductExportOptions] 
            GROUP BY ProductId 
            HAVING COUNT(*) > 1)
BEGIN
  WITH cte AS (
      SELECT *,
            ROW_NUMBER() OVER (
                PARTITION BY ProductId
                ORDER BY ProductId
            ) AS rn
      FROM [Catalog].[ProductExportOptions]
  )
  DELETE FROM cte
  WHERE rn > 1
END

GO--

IF NOT EXISTS (
    SELECT 1
    FROM sys.key_constraints
    WHERE name = 'PK_ProductExportOptions'
      AND parent_object_id = OBJECT_ID('Catalog.ProductExportOptions')
)
BEGIN
    ALTER TABLE Catalog.ProductExportOptions
    ADD CONSTRAINT PK_ProductExportOptions 
    PRIMARY KEY NONCLUSTERED (ProductId)
END

GO--

DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'Admin.SettingsSeo.RedirectToLowerUrl'

GO--

DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'Admin.Js.S.SettingsSeo.SuccessfullySaved'

GO--

DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'Admin.Js.SizeChart.Example'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AdminWebNotifications.AllowSiteShowNotifications', 'Необходимо разрешить текущему сайту показывать оповещения в настройках браузера <br><br><a href="https://www.advantshop.net/help/pages/kak-vkliuchit-ili-otkliuchit-uvedomleniya" target="_blank" class="link-academy link-invert inline-flex">{{icon}}<span>Инструкция. Как разрешить доступ и уведомления</span></a>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AdminWebNotifications.AllowSiteShowNotifications', 'You must allow the current site to show notifications in the browser settings <br><br><a href="https://www.advantshop.net/help/pages/kak-vkliuchit-ili-otkliuchit-uvedomleniya" target="_blank" class="link-academy link-invert inline-flex">{{icon}}<span>Instruction. How to allow access and notifications</span></a>'

GO--

DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'Admin.Produt.Edit.Delete'

GO--

UPDATE [Settings].[Localization]
SET [ResourceKey] = REPLACE([ResourceKey], 'Admin.Produt', 'Admin.Product')
WHERE [ResourceKey] LIKE 'Admin.Produt%'

GO--

UPDATE [Settings].[Localization]
SET [ResourceKey] = REPLACE([ResourceKey], 'Admin.Categry', 'Admin.Category')
WHERE [ResourceKey] LIKE 'Admin.Categry%'

GO--

UPDATE [Settings].[Localization]
SET [ResourceKey] = REPLACE([ResourceKey], 'Admin.CustomreSegments', 'Admin.CustomerSegments')
WHERE [ResourceKey] LIKE 'Admin.CustomreSegments%'

GO--

UPDATE [Settings].[Localization]
SET [ResourceKey] = REPLACE([ResourceKey], 'Admin.ShippingsMethods', 'Admin.ShippingMethods')
WHERE [ResourceKey] LIKE 'Admin.ShippingsMethods%'

GO--

UPDATE [Settings].[Localization]
SET [ResourceKey] = REPLACE([ResourceKey], 'Admin.ShippinhMethods', 'Admin.ShippingMethods')
WHERE [ResourceKey] LIKE 'Admin.ShippinhMethods%'

GO--

UPDATE [Settings].[Localization]
SET [ResourceKey] = REPLACE([ResourceKey], 'Admin.PaymentMeythods', 'Admin.PaymentMethods')
WHERE [ResourceKey] LIKE 'Admin.PaymentMeythods%'

GO--

UPDATE [Settings].[Localization]
SET [ResourceKey] = REPLACE([ResourceKey], 'Admin.PatmentMethods', 'Admin.PaymentMethods')
WHERE [ResourceKey] LIKE 'Admin.PatmentMethods%'

GO--

UPDATE [Settings].[Localization]
SET [ResourceKey] = REPLACE([ResourceKey], 'Admin.SettignsApi', 'Admin.SettingsApi')
WHERE [ResourceKey] LIKE 'Admin.SettignsApi%'

GO--

UPDATE [Settings].[Localization]
SET [ResourceKey] = REPLACE([ResourceKey], 'Admin.Comon', 'Admin.Common')
WHERE [ResourceKey] LIKE 'Admin.Comon%'

GO--

UPDATE [Settings].[Localization]
SET [ResourceKey] = REPLACE([ResourceKey], 'Admin.Yesteday', 'Admin.Yesterday')
WHERE [ResourceKey] LIKE 'Admin.Yesteday%'

GO--

DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'MinimalOrderPriceForDefaultGroupLink'

GO--

DELETE FROM [Settings].[Localization] WHERE ResourceKey like 'Warehouses.%'

GO--

UPDATE [Settings].[Localization]
SET [ResourceKey] = REPLACE([ResourceKey], 'Infrasturcture', 'Infrastructure')
WHERE [ResourceKey] LIKE 'Infrasturcture%'

GO--


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Home.Menu.AffiliateProgram.ListOfPartners', 'Список партнеров'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Home.Menu.AffiliateProgram.ListOfPartners', 'List Of Partners'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Home.Menu.AffiliateProgram.PartnersReport', 'Отчет по партнерам'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Home.Menu.AffiliateProgram.PartnersReport', 'Partners Report'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Home.Menu.AffiliateProgram.PartnersPayoutsReport', 'Отчеты по выплатам партнерам'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Home.Menu.AffiliateProgram.PartnersPayoutsReport', 'Partners Payouts Report'


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Home.Menu.AffiliateProgram.Settings', 'Настройки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Home.Menu.AffiliateProgram.Settings', 'Settings'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Design.Index.EnablePremium', 'Подключить'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Design.Index.EnablePremium', 'Enable'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Design.Index.Premium', 'Премиум'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Design.Index.Premium', 'Premium'

GO--

IF NOT EXISTS (SELECT * FROM [CMS].[StaticBlock] WHERE [Key] = 'GiftCertificateAside')
    BEGIN
        INSERT INTO CMS.StaticBlock ([Key], [InnerName], [Content], [Added], [Modified], [Enabled])
        VALUES ('GiftCertificateAside', N'Подарочный сертификат, боковой блок',
        N'Важно! В магазине установлены ограничения цены подарочного сертификата.<br />
Минимальная сумма подарочного сертификата: #GIFT_CERTIFICATE_MINIMAL_PRICE#<br />
Максимальная сумма подарочного сертификата: #GIFT_CERTIFICATE_MAXIMUM_PRICE#<br />
Минимальная сумма заказа: #GIFT_CERTIFICATE_MINIMUM_ORDER_PRICE#<br />
        ',
        SYSDATETIME(), SYSDATETIME(), 1);
    END

GO--

DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'GiftCertificate.Index.Limits'

GO--

DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'GiftCertificate.Index.MinimalPrice'

GO--

DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'GiftCertificate.Index.MaximumPrice'

GO--

DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'GiftCertificate.Index.MinimumOrderPrice'

GO--

IF EXISTS (SELECT 1 FROM [dbo].[Modules] WHERE [ModuleStringID] = 'Wazzup')
BEGIN
    UPDATE [CRM].[TriggerAction] 
    SET [ParamsJson] = '{"ModuleNames":["Wazzup"]}' 
    WHERE ActionType = 7 AND [ParamsJson] IS NULL
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Compare.AddMessageLink', 'Перейти к <u>списку сравнения</u>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Compare.AddMessageLink', 'Go to <u>comparison list</u>'

GO--

UPDATE [Settings].[InternalSettings] SET [settingValue] = '14.0.1' WHERE [settingKey] = 'db_version'
