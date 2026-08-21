EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Template.UseAdaptiveRootCategoryHint', 'Если настройка <b>включена</b>, то в качестве корневой категории будет использоваться первая по дереву категория, у которой больше одной подкатегории (по умолчанию Каталог), либо первая по дереву категория с товарами.<br/><br/>Настройку рекомендуется <b>выключить</b>, если необходимо выводить в меню единственную категорию первого уровня (с родителем Каталог).'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Template.UseAdaptiveRootCategoryHint', 'If the setting is <b>enabled</b>, then the first category in the tree that has more than one subcategory (by default Catalog) will be used as the root category, or the first category in the tree with goods.<br/><br/>It is recommended to <b>turn off</b> the setting. If you need to display a single first-level category in the menu (with a parent Catalog).'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.ExportImport.MultiOrder.GroupName', 'Группа покупателя'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.ExportImport.MultiOrder.GroupName', 'Customer group'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Checkout.CheckoutUser.Email', 'E-mail'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Checkout.CheckoutUser.Email', 'E-mail'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddDeliveryZone.ZeroPriceMessage', 'Текст при нулевой стоимости'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddDeliveryZone.ZeroPriceMessage', 'Zero price message'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingMethods.DeliveryByZones.WithoutZoneMessage', 'Текст стоимости, когда зона не определена'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingMethods.DeliveryByZones.WithoutZoneMessage', 'The cost text when the zone is not defined.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingMethods.DeliveryByZones.WithoutZoneMessageHelp', 'Текст, который будет показан вместо стоимости доставки, когда зона не определена. Например, когда адрес не указан, не распознан, не входит ни в одну из зон и т.д.<br/>Оставьте поле пустым и тогда будет браться одна из зон, для отображения цены.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingMethods.DeliveryByZones.WithoutZoneMessageHelp', 'The text that will be shown instead of the shipping cost when the zone is not defined. For example, when the address is not specified, is not recognized, does not belong to any of the zones, etc.<br/>Leave the field empty and then one of the zones will be taken to display the price.'
