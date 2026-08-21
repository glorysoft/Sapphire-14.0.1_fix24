SET IDENTITY_INSERT [Order].[ShippingReplaceGeo] ON 

IF NOT EXISTS (SELECT * FROM [Order].[ShippingReplaceGeo] WHERE [Id] = 54)
INSERT INTO [Order].[ShippingReplaceGeo] ([Id],[ShippingType],[InCountryName],[InCountryISO2],[InRegionName],[InCityName],[InDistrict],[OutCountryName],[OutRegionName],[OutCityName],[OutDistrict],[OutDistrictClear],[Enabled],[Sort],[InZip],[OutZip],[Comment])
VALUES (54,'Sdek','','BY','Минск','Минск','','','Минская область','','',0,1,0,'','','')

SET IDENTITY_INSERT [Order].[ShippingReplaceGeo] OFF

GO--
    
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Settings.SettingsFeatures.Warmup', 'Оптимизация сайта'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Settings.SettingsFeatures.Warmup', 'Site optimization'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Settings.SettingsFeatures.WarmupDescription', 'При запуске сайта будет выполнен процесс оптимизации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Settings.SettingsFeatures.WarmupDescription', 'The optimization process will be performed on site startup'

GO--
    
IF NOT EXISTS(SELECT * FROM [dbo].[Migration] WHERE [Name] = 'CustomerRoleActionSettingsExpand')
	BEGIN
		INSERT INTO [Customers].[CustomerRoleAction] (CustomerID, RoleActionKey, Enabled)
		SELECT cra.CustomerID, ra.RoleActionKey, 1
		FROM [Customers].[CustomerRoleAction] cra
				 CROSS JOIN (VALUES ('CouponsAndDiscounts'),
									('Api'),
									('SystemSettings'),
									('DocumentTemplates'),
									('MailSmsNotifications'),
									('IPTelephony'),
									('SocialMedia'),
									('Files'),
									('SeoAndCounters'),
									('Payment'),
									('Delivery'),
									('ShopWindow'),
									('OrdersInSettings'),
									('GeneralSettings')) ra(RoleActionKey)
		WHERE cra.RoleActionKey = 'Settings'
		  AND cra.Enabled = 1
		  AND EXISTS (SELECT 1
					  FROM [Customers].[CustomerRoleAction] cd
					  WHERE cd.CustomerID = cra.CustomerID
						AND cd.RoleActionKey = 'CouponsAndDiscounts'
						AND cd.Enabled = 1)
		  AND NOT EXISTS (SELECT 1
						  FROM [Customers].[CustomerRoleAction] other
						  WHERE other.CustomerID = cra.CustomerID
							AND other.RoleActionKey IN
								('Api', 'SystemSettings', 'DocumentTemplates', 'MailSmsNotifications', 'IPTelephony',
								 'SocialMedia', 'Files', 'SeoAndCounters', 'Payment', 'Delivery', 'ShopWindow',
								 'OrdersInSettings', 'GeneralSettings')
							AND other.Enabled = 1)
		  AND NOT EXISTS (SELECT 1
						  FROM [Customers].[CustomerRoleAction] existing
						  WHERE existing.CustomerID = cra.CustomerID
							AND existing.RoleActionKey = ra.RoleActionKey)

		INSERT INTO [dbo].[Migration] ([Name], [Date]) VALUES ('CustomerRoleActionSettingsExpand', GETDATE())
	END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.ClosingReceipt.OrderStateIsMissing', 'Платежным модулем не было зафиксировано состояние заказа для первого чека,  оно фиксируется при получении уведомления об оплате от платежной системы, поэтому пробитие второго чека невозможно.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.ClosingReceipt.OrderStateIsMissing', 'The payment module did not record the order status for the first receipt, it is recorded when the payment notification is received from the payment system, so it is impossible to break through the second receipt.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Landings.Views.Blocks.Config.Donate.SubBlockTitlePlaceholder', 'Cделать пожертвование'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Landings.Views.Blocks.Config.Donate.SubBlockTitlePlaceholder', 'Make a donation'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Landings.Views.Blocks.Config.Donate.SubBlockSubtitlePlaceholder', 'На поддержку творчества'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Landings.Views.Blocks.Config.Donate.SubBlockSubtitlePlaceholder', 'In support of creativity'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Langings.Blocks.Json.Products.Donate', 'Список товаров для приема пожертвований'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Langings.Blocks.Json.Products.Donate', 'List of items for donation'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.Prices', 'Суммы '
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.Prices', 'Prices'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.Product', 'Товар'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.Product', 'Product'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.Price', 'Сумма'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.Price', 'Price'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.Selected', 'Выбран'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.Selected', 'Selected'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.ChooseProduct', 'Выбрать товар'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.ChooseProduct', 'Choose product'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.Currency', 'Валюта'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.Currency', 'Currency'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.MinPriceForOther', 'Минимальная сумма'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.MinPriceForOther', 'Min price for other'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.ProductForOther', 'Товар для произвольной суммы'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.ProductForOther', 'Product for other'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.ShowOtherPrice', 'Показывать произвольную сумму'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.ShowOtherPrice', 'Show other price'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.AddPrice', 'Добавить'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.AddPrice', 'Add price'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Landing.Donate.Other', 'Другая'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Landing.Donate.Other', 'Other'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Landing.Donate.NoPricesError', 'Укажите цены и товары'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Landing.Donate.NoPricesError', 'Please specify the prices and products'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.MaxPriceForOther', 'Максимальная сумма'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.MaxPriceForOther', 'Max price for other'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Langings.Blocks.Json.Products.DonateArtist', 'Список товаров для приема пожертвований с изображением'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Langings.Blocks.Json.Products.DonateArtist', 'List of items for donation with picture'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Landing.DonateArtist.EnterPrice', 'Введите сумму доната'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Landing.DonateArtist.EnterPrice', 'Enter the donation amount'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Landings.BlocksConstructor.Donate.ShowPicture', 'Выводить изображение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Landings.BlocksConstructor.Donate.ShowPicture', 'Show picture'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Checkout.CheckoutCart.OnlyViaReferralCode', 'Купон можно применить только через реферальный код.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Checkout.CheckoutCart.OnlyViaReferralCode', 'Coupon can be applied only via a referral code'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Checkout.CheckoutCart.ReferrerNotFound', 'Реферер не найден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Checkout.CheckoutCart.ReferrerNotFound', 'Referrer not found'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Checkout.CheckoutCart.CannotApplyReferralCodeYourself', 'Нельзя применить реферальный код к самому себе'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Checkout.CheckoutCart.CannotApplyReferralCodeYourself', 'You cannot apply a referral code to yourself'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Checkout.CheckoutCart.YouAlreadyUsedReferralCode', 'Вы уже использовали реферальный код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Checkout.CheckoutCart.YouAlreadyUsedReferralCode', 'You have already used a referral code'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingMethods.Shared.HowGetYandexMapKey', '<p>Как получить ключ:</p><p>1. Перейдите на страницу <a href="https://developer.tech.yandex.ru" target="_blank">Кабинета Разработчика</a> и создайте ключ "JavaScript API".</p><p>2. Перейдите на <a href="https://developer.tech.yandex.ru/keys" target="_blank">страницу ключей</a>, наведите курсор на свой ключ и нажмите "Привязать к API". В модальном окне выбрать "API Геокодера".</p>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingMethods.Shared.HowGetYandexMapKey', '<p>How get key:</p><p>1. 1. Go to the <a href="https://developer.tech.yandex.ru" target="_blank">Developer Dashboard</a> page and create a “JavaScript API” key.</p><p>2. Go to the <a href="https://developer.tech.yandex.ru/keys" target="_blank">Keys page</a>, hover over your key, and click “Link to API.” In the modal window, select the “Geocoder API.”</p>'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.Alfabank.SendReceiptDataIsDisabled', 'Отключена опция отправки данных для чека.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.Alfabank.SendReceiptDataIsDisabled', 'The option to send data for the receipt is disabled.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.Alfabank.PaymentIdNotFound', 'Нет идентификатора платежа из системы банка.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.Alfabank.PaymentIdNotFound', 'There is no payment ID from the bank''s system.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.Alfabank.PaymentIsNotConfirmed', 'Платеж в системе банка не в статусе "paid".'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.Alfabank.PaymentIsNotConfirmed', 'The payment in the bank''s system is not in the "succeeded" status.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.Alfabank.SomethingWentWrong', 'Что-то пошло не так.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.Alfabank.SomethingWentWrong', 'Something went wrong.'

GO--

