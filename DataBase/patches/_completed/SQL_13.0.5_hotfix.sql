EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Product.CustomOptions.NotFound', 'Опция не найдена. Пожалуйста, обновите страницу.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Product.CustomOptions.NotFound', 'Option not found. Please refresh the page.'

GO--

if exists (Select 1 From [Customers].[Subscription] Where Email is null or len(Email) = 0)
begin
    Delete From [Customers].[Subscription] Where Email is null or len(Email) = 0
end

GO--

IF NOT EXISTS (SELECT * 
               FROM INFORMATION_SCHEMA.COLUMNS 
			   WHERE TABLE_SCHEMA = 'Customers' 
			     AND TABLE_NAME = 'SmsLog' 
				 AND COLUMN_NAME = 'FromPage')
    BEGIN
        ALTER TABLE [Customers].[SmsLog]
            ADD FromPage nvarchar(500) NULL
    END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsSystem.SystemCommon.EnableCaptchaInSendCode', 'Показывать при отправке кода на номер телефона'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsSystem.SystemCommon.EnableCaptchaInSendCode', 'Show when sending code to phone number'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.CaptchaService.Confirm.Header', 'Введите капчу'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.CaptchaService.Confirm.Header', 'Enter the captcha'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.CaptchaService.Confirm.Confirm', 'Подтвердить'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.CaptchaService.Confirm.Confirm', 'Confirm'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.CaptchaService.CheckCaptcha.CaptchaError', 'Не удалось найти капчу'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.CaptchaService.CheckCaptcha.CaptchaError', 'Unable to find captcha'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.CaptchaService.CheckCaptcha.CodeError', 'Неверно введен код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.CaptchaService.CheckCaptcha.CodeError', 'Incorrect code entered'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.CaptchaService.SettingError', 'Ошибка при получении настройки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.CaptchaService.SettingError', 'Error receiving settings'

GO--

IF NOT EXISTS(SELECT 1
              FROM sys.columns
              WHERE (name = N'PreviousStatusId') AND object_id = OBJECT_ID(N'[Order].[Order]'))
    BEGIN
        ALTER TABLE [Order].[Order] ADD
	        PreviousStatusId int NULL
	END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Checkout.CountVisibleShippingOptions', 'Количество выводимых вариантов доставок'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Checkout.CountVisibleShippingOptions', 'Number of displayed delivery options';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Checkout.CountVisibleShippingOptionsHelp', 'Данная настройка указывает сколько отображать вариантов доставки на странице оформления заказов в коротком режиме списка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Checkout.CountVisibleShippingOptionsHelp', 'This setting specifies how many shipping options to display on the checkout page in short list mode';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Dashboard.CreateSite.CreateSiteTemplateItem.FreeDays', '7 дней бесплатно'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Dashboard.CreateSite.CreateSiteTemplateItem.FreeDays', '7 days free'

GO--
