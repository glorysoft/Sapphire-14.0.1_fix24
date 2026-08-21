
DELETE FROM [Order].[PaymentMethod]
GO
DELETE FROM [Order].[PaymentParam]
GO
DELETE FROM [Order].[ShippingMethod]
GO
DELETE FROM [Order].[ShippingParam]
GO
SET IDENTITY_INSERT [Order].[PaymentMethod] ON 

GO
INSERT [Order].[PaymentMethod] ([PaymentMethodID], [Name], [Enabled], [SortOrder], [Description], [PaymentType], [CurrencyId], [TaxId], [ExtrachargeInPercents], [ExtrachargeInNumbers]) VALUES (951, N'При получении (наличными или банковской картой)', 1, 0, N'Оплата курьеру или в пункте выдачи', N'Cash', 4, NULL, 0, 0)
GO
INSERT [Order].[PaymentMethod] ([PaymentMethodID], [Name], [Enabled], [SortOrder], [Description], [PaymentType], [CurrencyId], [TaxId], [ExtrachargeInPercents], [ExtrachargeInNumbers]) VALUES (953, N'Банковский перевод для юр. лиц', 1, 0, N'Банковский перевод для юр. лиц', N'Bill', 4, NULL, 0, 0)
GO
INSERT [Order].[PaymentMethod] ([PaymentMethodID], [Name], [Enabled], [SortOrder], [Description], [PaymentType], [CurrencyId], [TaxId], [ExtrachargeInPercents], [ExtrachargeInNumbers]) VALUES (963, N'Наложенный', 1, 10, N'', N'CashOnDelivery', 4, NULL, 0, 0)
GO
SET IDENTITY_INSERT [Order].[PaymentMethod] OFF
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_Accountant', N'ФИО')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_Address', N'')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_BankName', N'')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_BIK', N'')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_CompanyName', N'')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_CorAccount', N'')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_Director', N'ФИО')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_INN', N'')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_KPP', N'')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_Manager', N'ФИО')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_ShowPaymentDetails', N'True')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_Telephone', N'+7 (495) 800 200 00')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'Bill_TransAccount', N'')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (953, N'CurrencyValue', N'1')
GO
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (963, N'ShippingMethod', N'229')
GO
SET IDENTITY_INSERT [Order].[ShippingMethod] ON 

GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (209, N'SelfDelivery', N'Самовывоз', N'', 1, 0, 0, 1, N'Бесплатно', 0, 21, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (210, N'FixedRate', N'Курьером', N'', 0, 1, 1, 1, N'Бесплатно', 0, 21, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (229, N'Yandex', N'Яндекс.Доставка', N'', 1, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
SET IDENTITY_INSERT [Order].[ShippingMethod] OFF
GO
SET IDENTITY_INSERT [Order].[ShippingParam] ON 

GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (837, 210, N'ShippingPrice', N'200')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (838, 210, N'Extracharge', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (871, 210, N'DeliveryTime', N'2')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1074, 229, N'ApiToken', N'y0_AgAAAABdR100AAVM1QAAAADNFjYgeDIf0i4qSmKSkWIfr7Kt8-mw1LE')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1075, 229, N'PaymentCodCardId', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1076, 229, N'DefaultWeight', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1077, 229, N'ExtrachargeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1078, 229, N'ExtrachargeTypeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1079, 229, N'DefaultLength', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1080, 229, N'DefaultWidth', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1081, 229, N'DefaultHeight', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1082, 229, N'ExtrachargeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1083, 229, N'ExtrachargeTypeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1084, 229, N'StationId', N'89185bcc-672e-4d15-a770-6f83997502a9')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1085, 229, N'DeliveryTypes', N'Courier,PVZ,postamat')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1086, 229, N'TypeViewPoints', N'2')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1087, 229, N'TypeDeparturePoint', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1088, 229, N'StatusesSync', N'False')
GO
SET IDENTITY_INSERT [Order].[ShippingParam] OFF
GO
UPDATE [Settings].[Settings]
SET [Value] = '#NUMBER#_#YEAR##MONTH##DAY#_#RRR#'
WHERE [Name] = 'OrderNumberFormat'
GO