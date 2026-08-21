
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
INSERT [Order].[PaymentMethod] ([PaymentMethodID], [Name], [Enabled], [SortOrder], [Description], [PaymentType], [CurrencyId], [TaxId], [ExtrachargeInPercents], [ExtrachargeInNumbers]) VALUES (964, N'Подарочный сертификат', 1, 0, N'Заказ будет оплачен сертификатом', N'GiftCertificate', 4, NULL, 0, 0)
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
INSERT [Order].[PaymentParam] ([PaymentMethodID], [Name], [Value]) VALUES (963, N'ShippingMethod', N'228')
GO
SET IDENTITY_INSERT [Order].[ShippingMethod] ON 

GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (209, N'SelfDelivery', N'Самовывоз', N'', 1, 0, 0, 1, N'Бесплатно', 0, 21, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (210, N'FixedRate', N'Курьером', N'', 0, 1, 1, 1, N'Бесплатно', 0, 21, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (213, N'FixedRate', N'Курьер Москва', N'', 0, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (214, N'FixedRate', N'Курьер Россия', N'', 1, 0, 1, 1, N'Бесплатно', 1, NULL, 1, 0, 0, 0, 4, NULL, 11, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (215, N'Grastin', N'Grastin', N'', 0, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (216, N'Sdek', N'сдэк клиента', N'', 1, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (217, N'OzonRocket', N'Ozon (клиента)', N'', 1, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (219, N'PointDelivery', N'Пункты выдачи', N'', 1, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (220, N'PickPoint', N'PickPoint от PickPoint', N'', 1, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (222, N'FreeShipping', N'Забрать в магазине', N'', 1, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, NULL, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (223, N'Boxberry', N'Boxberry', N'', 1, 0, 1, 1, N'Бесплатно', 1, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (225, N'Dpd', N'DPD', N'', 1, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (226, N'RussianPost', N'Почта', N'', 1, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (227, N'Sberlogistic', N'Сберлогистика', N'', 1, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
GO
INSERT [Order].[ShippingMethod] ([ShippingMethodID], [ShippingType], [Name], [Description], [Enabled], [SortOrder], [DisplayCustomFields], [ShowInDetails], [ZeroPriceMessage], [DisplayIndex], [TaxId], [ExtrachargeFromOrder], [ExtraDeliveryTime], [MoveToEnd], [ShowIfNoOtherShippings], [CurrencyId], [ModuleStringId], [ExtrachargeInPercents], [ExtrachargeInNumbers], [PaymentMethodType], [PaymentSubjectType]) VALUES (228, N'RussianPost', N'Почта 2', N'', 1, 0, 1, 1, N'Бесплатно', 0, NULL, 0, 0, 0, 0, 4, NULL, 0, 0, 1, 10)
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
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (872, 213, N'ShippingPrice', N'300')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (873, 213, N'DeliveryTime', N'3')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (874, 214, N'ShippingPrice', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (875, 214, N'DeliveryTime', N'8')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (876, 215, N'WidgetFromCity', N'Москва')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (877, 215, N'YaMapsApiKey', N'a47a35f8-31a7-4769-89e6-c34f8d069786')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (878, 215, N'ShowDrivingDescriptionPoint', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (879, 215, N'ApiKey', N'af212b01-6413-4766-88ba-4cf727be8c3b')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (880, 215, N'OrderPrefix', N'TCP')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (881, 215, N'TypePaymentDelivery', N'2')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (882, 215, N'TypePaymentPickup', N'6')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (883, 215, N'TypeCalc', N'3')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (884, 215, N'Insure', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (885, 215, N'ExcludeCostOrderprocessing', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (886, 215, N'ActiveDeliveryTypes', N'0,1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (887, 215, N'EnabledCOD', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (888, 215, N'EnabledPickPoint', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (889, 215, N'StatusesSync', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (890, 215, N'ShipIdCOD', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (891, 215, N'ShipIdPickPoint', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (892, 215, N'DefaultWeight', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (893, 215, N'ExtrachargeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (894, 215, N'ExtrachargeTypeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (895, 215, N'DefaultLength', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (896, 215, N'DefaultWidth', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (897, 215, N'DefaultHeight', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (898, 215, N'ExtrachargeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (899, 215, N'ExtrachargeTypeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (900, 215, N'MoscowRegionId', N'e92ae8a3-074c-11e2-a6e5-00152d030203')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (901, 215, N'SaintPetersburgRegionId', N'e92ae8a4-074c-11e2-a6e5-00152d030203')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (902, 215, N'NizhnyNovgorodRegionId', N'4f14dcd5-e633-11e3-be1e-00155d030401')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (903, 215, N'OrelRegionId', N'ff4c9278-e0f3-4035-8d5c-e0da19e90fa3')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (904, 215, N'KrasnodarRegionId', N'986ed480-9673-11e9-a9e4-005056a2f26f')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (905, 215, N'BoxberryRegionId', N'7d9e8b58-c94b-445d-97b8-c5cf57654f11')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (906, 215, N'PartnerRegionId', N'34a0cb74-32f7-4f80-bb5b-098e12647e13')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (907, 215, N'RussianPostRegionId', N'e92ae8a2-074c-11e2-a6e5-00152d030203')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (908, 215, N'CdekRegionId', N'36947de0-6023-4ae6-85f8-9337cebafd97')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (909, 216, N'authLogin', N'O6CoO7b1GOgxaBdGaFqYjCqVe9IbuXfh')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (910, 216, N'authPassword', N'iA5lrGxnnfdPY1Do2f6902K70TyPquGU')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (911, 216, N'cityFrom', N'Москва')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (912, 216, N'cityFromId', N'44')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (913, 216, N'CalculateTariffs', N'136,137,368')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (914, 216, N'DeliveryNote', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (915, 216, N'StatusesSync', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (916, 216, N'WithInsure', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (917, 216, N'AllowInspection', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (918, 216, N'ShowPointsAsList', N'True')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (919, 216, N'ShowSdekWidjet', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (920, 216, N'UseSeller', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (921, 216, N'SellerAddress', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (922, 216, N'SellerName', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (923, 216, N'SellerINN', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (924, 216, N'SellerPhone', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (925, 216, N'SellerOwnershipForm', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (926, 216, N'DefaultWeight', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (927, 216, N'ExtrachargeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (928, 216, N'ExtrachargeTypeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (929, 216, N'DefaultLength', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (930, 216, N'DefaultWidth', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (931, 216, N'DefaultHeight', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (932, 216, N'ExtrachargeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (933, 216, N'ExtrachargeTypeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (934, 217, N'ClientId', N'Principal_22171510265000_c9300284-8511-4c08-8b90-ced73370d6ea')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (935, 217, N'ClientSecret', N'cN/YqWnsbt3MP3RSwIiNpSbSGF/xsfBSADQSUaDcCwY=')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (936, 217, N'DeliveryTypes', N'Courier,PickPoint,Postamat')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (937, 217, N'TypeViewPoints', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (938, 217, N'StatusesSync', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (939, 217, N'AllowPartialDelivery', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (940, 217, N'AllowUncovering', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (941, 217, N'DefaultWeight', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (942, 217, N'ExtrachargeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (943, 217, N'ExtrachargeTypeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (944, 217, N'DefaultLength', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (945, 217, N'DefaultWidth', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (946, 217, N'DefaultHeight', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (947, 217, N'ExtrachargeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (948, 217, N'ExtrachargeTypeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (949, 217, N'FromPlaceId', N'21066793924000')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (952, 220, N'Login', N'0kf2Sw')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (953, 220, N'Password', N'I5J1uNGFrSn')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (954, 220, N'Ikn', N'9990865012')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (955, 220, N'GettingType', N'101')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (956, 220, N'DeliveryMode', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (957, 220, N'TypeViewPoints', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (958, 220, N'StatusesSync', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (959, 220, N'DefaultWeight', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (960, 220, N'ExtrachargeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (961, 220, N'ExtrachargeTypeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (962, 220, N'DefaultLength', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (963, 220, N'DefaultWidth', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (964, 220, N'DefaultHeight', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (965, 220, N'ExtrachargeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (966, 220, N'ExtrachargeTypeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (967, 220, N'FromCityId', N'996')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (968, 220, N'FromCity', N'Фрязино')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (969, 220, N'FromRegion', N'Московская')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (970, 219, N'TypePoints', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (971, 219, N'Points', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (972, 219, N'NewPoints', N'[{"PointX":54.2698746,"PointY":48.28459,"Id":0,"Code":null,"Address":"улица Рябикова, 106А","Description":"В ТЦ ДА"},{"PointX":54.2714462,"PointY":48.28036,"Id":0,"Code":null,"Address":"Отадня 79","Description":null},{"PointX":54.27217,"PointY":48.2882,"Id":0,"Code":null,"Address":"Рябикова 75","Description":null},{"PointX":54.3068123,"PointY":48.3596725,"Id":0,"Code":null,"Address":"Аквамолл","Description":"Московское шоссе 108"},{"PointX":53.2075539,"PointY":50.1979179,"Id":0,"Code":null,"Address":"Дыбенко, 30","Description":null}]')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (973, 219, N'ShippingPrice', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (974, 219, N'DeliveryTime', N'3')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (975, 222, N'DeliveryTime', N'3')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (976, 223, N'ApiUrl', N'https://account.boxberry.ru/json.php')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (977, 223, N'integrationToken', N'1$5106d23b32020b6a979b426b4d0de930')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (978, 223, N'token', N'3c46a58d1ec03b9fddf7e4563d70bee6')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (979, 223, N'DefaultWeight', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (980, 223, N'ExtrachargeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (981, 223, N'ExtrachargeTypeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (982, 223, N'DefaultLength', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (983, 223, N'DefaultWidth', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (984, 223, N'DefaultHeight', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (985, 223, N'ExtrachargeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (986, 223, N'ExtrachargeTypeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (987, 223, N'receptionPointCode', N'97471')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (988, 223, N'DeliveryTypes', N'0,1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (989, 223, N'WithInsure', N'True')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (990, 223, N'TypeOption', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (991, 223, N'StatusesSync', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (992, 225, N'ClientNumber', N'1066001520')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (993, 225, N'ClientKey', N'20B8529FD9BE5C352D72CF354EC81EF50CCB1358')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (994, 225, N'TestServers', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (995, 225, N'PickupCountryIso2', N'RU')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (996, 225, N'SelfPickup', N'True')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (997, 225, N'DeliveryTypes', N'1,2')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (998, 225, N'ServiceCodes', N'ECN,CUR,PUP,DPI,DPE')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (999, 225, N'WithInsure', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1000, 225, N'TypeViewPoints', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1001, 225, N'DefaultWeight', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1002, 225, N'ExtrachargeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1003, 225, N'ExtrachargeTypeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1004, 225, N'DefaultLength', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1005, 225, N'DefaultWidth', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1006, 225, N'DefaultHeight', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1007, 225, N'ExtrachargeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1008, 225, N'ExtrachargeTypeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1009, 225, N'PickupPointCode', N'38L')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1010, 225, N'PickupRegionName', N'Москва')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1011, 225, N'PickupCityName', N'Москва')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1012, 225, N'PickupCityId', N'49694102')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1013, 227, N'apiToken', N'6f7cfc6b904345729c5ae212274601a1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1014, 227, N'cityFrom', N'Ульяновск')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1015, 227, N'streetFrom', N'Рябикова')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1016, 227, N'houseFrom', N'105')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1017, 227, N'TypeViewPoints', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1018, 227, N'statusesSync', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1019, 227, N'DefaultWeight', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1020, 227, N'ExtrachargeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1021, 227, N'ExtrachargeTypeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1022, 227, N'DefaultLength', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1023, 227, N'DefaultWidth', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1024, 227, N'DefaultHeight', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1025, 227, N'ExtrachargeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1026, 227, N'ExtrachargeTypeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1027, 226, N'login', N'Order@oldim.ru')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1028, 226, N'password', N'110PR2020hky1305')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1029, 226, N'PointIndex', N'123308')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1030, 226, N'token', N'pJ8654kzhfDpJtD4L1py2E3QfBytfuZ4')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1031, 226, N'TypeNotification', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1032, 226, N'Fragile', N'True')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1033, 226, N'DeliveryWithCod', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1034, 226, N'SmsNotification', N'True')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1035, 226, N'StatusesSync', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1036, 226, N'DefaultWeight', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1037, 226, N'ExtrachargeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1038, 226, N'ExtrachargeTypeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1039, 226, N'DefaultLength', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1040, 226, N'DefaultWidth', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1041, 226, N'DefaultHeight', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1042, 226, N'ExtrachargeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1043, 226, N'ExtrachargeTypeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1044, 226, N'NewLocalDeliveryTypes', N'EMS_OPTIMAL\ORDINARY,EMS\ORDINARY')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1045, 226, N'NewInternationalDeliveryTypes', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1046, 226, N'Courier', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1047, 228, N'login', N'stoparikru@yandex.ru')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1048, 228, N'password', N'vinodel26')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1049, 228, N'PointIndex', N'355021')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1050, 228, N'token', N'HRtmEdDqedtBYXR26ufQHeA73j15tAZA')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1051, 228, N'TypeNotification', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1052, 228, N'Fragile', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1053, 228, N'DeliveryWithCod', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1054, 228, N'SmsNotification', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1055, 228, N'StatusesSync', N'False')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1056, 228, N'DefaultWeight', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1057, 228, N'ExtrachargeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1058, 228, N'ExtrachargeTypeWeight', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1059, 228, N'DefaultLength', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1060, 228, N'DefaultWidth', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1061, 228, N'DefaultHeight', N'100')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1062, 228, N'ExtrachargeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1063, 228, N'ExtrachargeTypeCargo', N'0')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1064, 228, N'NewLocalDeliveryTypes', N'ONLINE_PARCEL\COMBINED_ORDINARY,ONLINE_PARCEL\COMBINED_WITH_DECLARED_VALUE,ONLINE_PARCEL\COMBINED_WITH_DECLARED_VALUE_AND_CASH_ON_DELIVERY,ONLINE_PARCEL\ORDINARY,ONLINE_PARCEL\WITH_DECLARED_VALUE_AND_COMPULSORY_PAYMENT')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1065, 228, N'NewInternationalDeliveryTypes', N'')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1066, 228, N'DeliveryToOps', N'True')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1067, 228, N'YaMapsApiKey', N'a47a35f8-31a7-4769-89e6-c34f8d069786')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1068, 216, N'ShowAddressComment', N'True')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1069, 216, N'YaMapsApiKey', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1070, 217, N'ShowAddressComment', N'True')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1071, 217, N'YaMapsApiKey', N'1')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1072, 220, N'ShowAddressComment', N'True')
GO
INSERT [Order].[ShippingParam] ([ShippingParamID], [ShippingMethodID], [ParamName], [ParamValue]) VALUES (1073, 220, N'YaMapsApiKey', N'1')
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
SET IDENTITY_INSERT [dbo].[Modules] ON 

GO
INSERT [dbo].[Modules] ([ModuleID], [ModuleStringID], [IsInstall], [DateAdded], [DateModified], [Version], [Active], [NeedUpdate]) VALUES (148, N'YandexPayCheckout', 1, CAST(N'2022-07-04 18:10:29.007' AS DateTime), CAST(N'2022-07-04 18:10:29.007' AS DateTime), N'В режиме отладки', 1, 0)
GO
SET IDENTITY_INSERT [dbo].[Modules] OFF
GO
SET IDENTITY_INSERT [Settings].[ModuleSettings] ON 

GO
INSERT [Settings].[ModuleSettings] ([SettingID], [Name], [Value], [ModuleName]) VALUES (215, N'TestMode', N'True', N'YandexPayCheckout')
GO
INSERT [Settings].[ModuleSettings] ([SettingID], [Name], [Value], [ModuleName]) VALUES (216, N'MerchantId', N'0e9ee8bf-2181-402a-be61-1f47c9a3a26a', N'YandexPayCheckout')
GO
INSERT [Settings].[ModuleSettings] ([SettingID], [Name], [Value], [ModuleName]) VALUES (217, N'ButtonTheme', N'YaPay.ButtonTheme.WhiteOutlined', N'YandexPayCheckout')
GO
INSERT [Settings].[ModuleSettings] ([SettingID], [Name], [Value], [ModuleName]) VALUES (218, N'ButtonWidthInProductCart', N'YaPay.ButtonWidth.Max', N'YandexPayCheckout')
GO
INSERT [Settings].[ModuleSettings] ([SettingID], [Name], [Value], [ModuleName]) VALUES (219, N'ButtonWidthInShoppingCart', N'YaPay.ButtonWidth.Max', N'YandexPayCheckout')
GO
INSERT [Settings].[ModuleSettings] ([SettingID], [Name], [Value], [ModuleName]) VALUES (220, N'Shippings', N'[{"Id":210,"Name":"Курьером","TypeClarificationNeeded":true,"Type":"COURIER","AvailablePayments":["SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":true,"Location":null,"Address":null},{"Id":209,"Name":"Самовывоз","TypeClarificationNeeded":false,"Type":"PICKUP","AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":true,"Location":{"Longitude":48.2792358,"Latitude":54.2755165},"Address":"ул. Ефремова, 121"},{"Id":213,"Name":"Курьер Москва","TypeClarificationNeeded":true,"Type":"COURIER","AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":true,"Location":null,"Address":null},{"Id":214,"Name":"Курьер Россия","TypeClarificationNeeded":true,"Type":"COURIER","AvailablePayments":["CARD","SPLIT","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":true,"Location":null,"Address":null},{"Id":215,"Name":"Grastin","TypeClarificationNeeded":false,"Type":null,"AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":false,"Location":null,"Address":null},{"Id":216,"Name":"сдэк клиента","TypeClarificationNeeded":false,"Type":null,"AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":false,"Location":null,"Address":null},{"Id":217,"Name":"Ozon (клиента)","TypeClarificationNeeded":false,"Type":null,"AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":false,"Location":null,"Address":null},{"Id":220,"Name":"PickPoint от PickPoint","TypeClarificationNeeded":false,"Type":null,"AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":false,"Location":null,"Address":null},{"Id":219,"Name":"Пункты выдачи","TypeClarificationNeeded":false,"Type":"PICKUP","AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":false,"Location":null,"Address":null},{"Id":222,"Name":"Забрать в магазине","TypeClarificationNeeded":true,"Type":"PICKUP","AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":true,"Location":{"Longitude":48.30115,"Latitude":54.2851448},"Address":"Рябикова 22А"},{"Id":223,"Name":"Boxberry","TypeClarificationNeeded":false,"Type":null,"AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":false,"Location":null,"Address":null},{"Id":225,"Name":"DPD","TypeClarificationNeeded":false,"Type":null,"AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":false,"Location":null,"Address":null},{"Id":227,"Name":"Сберлогистика","TypeClarificationNeeded":false,"Type":null,"AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":false,"Location":null,"Address":null},{"Id":226,"Name":"Почта","TypeClarificationNeeded":false,"Type":null,"AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":false,"Location":null,"Address":null},{"Id":228,"Name":"Почта 2","TypeClarificationNeeded":false,"Type":null,"AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":0,"LocationClarificationNeeded":false,"Location":null,"Address":null},{"Id":229,"Name":"Яндекс.Доставка","TypeClarificationNeeded":false,"Type":"YANDEX_DELIVERY","AvailablePayments":["CARD","SPLIT","CASH_ON_DELIVERY","CARD_ON_DELIVERY"],"DeliveryTimeClarificationNeeded":false,"DeliveryTimeInDay":null,"LocationClarificationNeeded":false,"Location":null,"Address":null}]', N'YandexPayCheckout')
GO
INSERT [Settings].[ModuleSettings] ([SettingID], [Name], [Value], [ModuleName]) VALUES (221, N'ApiKey', N'0e9ee8bf-2181-402a-be61-1f47c9a3a26a', N'YandexPayCheckout')
GO
INSERT [Settings].[ModuleSettings] ([SettingID], [Name], [Value], [ModuleName]) VALUES (222, N'ButtonWidthInCheckout', N'YaPay.ButtonWidth.Max', N'YandexPayCheckout')
GO
SET IDENTITY_INSERT [Settings].[ModuleSettings] OFF
GO
UPDATE [Settings].[Settings]
SET [Value] = '#NUMBER#_#YEAR##MONTH##DAY#_#RRR#'
WHERE [Name] = 'OrderNumberFormat'
GO