
if ((Select Count(*) From [Settings].[Settings] Where Name = 'DefaultTaxId') = 0)
	Insert Into [Settings].[Settings] ([Name],[Value]) 
		Select Top(1) 'DefaultTaxId', TaxId From [Catalog].[Tax]
Else
	Update [Settings].[Settings] 
	Set Value = (Select Top(1)TaxId From [Catalog].[Tax]) 
	Where Name = 'DefaultTaxId'
	
GO--

Alter table Catalog.Product
Add YandexSizeUnit nvarchar(10) NULL

GO--

ALTER PROCEDURE [Settings].[sp_GetExportFeedProducts] @exportFeedId int
	,@onlyCount BIT
	,@exportNotActive BIT
	,@exportNotAmount BIT
	,@selectedCurrency NVARCHAR(10)
	,@allowPreOrder bit
AS
BEGIN
	DECLARE @res TABLE (productId INT PRIMARY KEY CLUSTERED);
	DECLARE @lproduct TABLE (productId INT PRIMARY KEY CLUSTERED);

	INSERT INTO @lproduct
	SELECT [ProductID]
	FROM [Settings].[ExportFeedSelectedProducts]
	WHERE [ExportFeedId] = @exportFeedId;

	DECLARE @lcategory TABLE (CategoryId INT PRIMARY KEY CLUSTERED);
	DECLARE @l TABLE (CategoryId INT PRIMARY KEY CLUSTERED);

	INSERT INTO @l
	SELECT t.CategoryId
	FROM [Settings].[ExportFeedSelectedCategories] AS t
	INNER JOIN CATALOG.Category ON t.CategoryId = Category.CategoryId
	WHERE [ExportFeedId] = @exportFeedId
		AND HirecalEnabled = 1
		AND Enabled = 1

	DECLARE @l1 INT

	SET @l1 = (
			SELECT MIN(CategoryId)
			FROM @l
			);

	WHILE @l1 IS NOT NULL
	BEGIN
		INSERT INTO @lcategory
		SELECT id
		FROM Settings.GetChildCategoryByParent(@l1) AS dt
		INNER JOIN CATALOG.Category ON CategoryId = id
		WHERE dt.id NOT IN (
				SELECT CategoryId
				FROM @lcategory
				)
			AND HirecalEnabled = 1
			AND Enabled = 1

		SET @l1 = (
				SELECT MIN(CategoryId)
				FROM @l
				WHERE CategoryId > @l1
				);
	END;

	IF @onlyCount = 1
	BEGIN
		SELECT COUNT(OfferId)
		FROM (
			(
				SELECT OfferId
				FROM [Catalog].[Product]
				INNER JOIN [Catalog].[Offer] ON [Offer].[ProductID] = [Product].[ProductID]
				INNER JOIN [Catalog].[ProductCategories] ON [ProductCategories].[ProductID] = [Product].[ProductID]
					AND (
						CategoryId IN (
							SELECT CategoryId
							FROM @lcategory
							)
						OR [ProductCategories].[ProductID] IN (
							SELECT productId
							FROM @lproduct
							)
						)
				--LEFT JOIN [Catalog].[Photo] ON [Product].[ProductID] = [Photo].[ObjId] and Type ='Product' AND [Photo].[Main] = 1
				WHERE (
						SELECT TOP (1) [ProductCategories].[CategoryId]
						FROM [Catalog].[ProductCategories]
						INNER JOIN [Catalog].[Category] ON [Category].[CategoryId] = [ProductCategories].[CategoryId]
						WHERE [ProductID] = [Product].[ProductID]
							AND [Enabled] = 1
							AND [Main] = 1
						) = [ProductCategories].[CategoryId]
					AND (Offer.Price > 0 OR @exportNotAmount = 1)
					AND (
						Offer.Amount > 0
						OR (Product.AllowPreOrder = 1 and @allowPreOrder =1)
						OR @exportNotAmount = 1
						)
					AND CategoryEnabled = 1
					AND (Enabled = 1 OR @exportNotActive = 1)
				)
			) AS dd
	END
	ELSE
	BEGIN
		DECLARE @defaultCurrencyRatio FLOAT;

		SELECT @defaultCurrencyRatio = CurrencyValue
		FROM [Catalog].[Currency]
		WHERE CurrencyIso3 = @selectedCurrency;

		SELECT [Product].[Enabled]
			,[Product].[ProductID]
			,[Product].[Discount]
			,AllowPreOrder
			,Amount
			,[ProductCategories].[CategoryId] AS [ParentCategory]
			,([Offer].[Price] / @defaultCurrencyRatio) AS Price
			,ShippingPrice
			,[Product].[Name]
			,[Product].[UrlPath]
			,[Product].[Description]
			,[Product].[BriefDescription]
			,[Product].SalesNote
			,OfferId
			,[Product].ArtNo
			,[Offer].Main
			,[Offer].ColorID
			,ColorName
			,[Offer].SizeID
			,SizeName
			,BrandName
			,CountryName as BrandCountry
			,GoogleProductCategory
			,YandexMarketCategory
			,YandexTypePrefix
			,YandexModel
			,Gtin
			,Adult
			,CurrencyValue
			,[Settings].PhotoToString(Offer.ColorID, Product.ProductId) AS Photos
			,ManufacturerWarranty
			,[Weight]
			,[Product].[Enabled]
			,[Offer].SupplyPrice
			,[Offer].ArtNo AS OfferArtNo
			,[Product].BarCode
			,[Product].TaxId
			,[Product].YandexSizeUnit

		FROM [Catalog].[Product]
		INNER JOIN [Catalog].[Offer] ON [Offer].[ProductID] = [Product].[ProductID]
		INNER JOIN [Catalog].[ProductCategories] ON [ProductCategories].[ProductID] = [Product].[ProductID]
			AND (
				CategoryId IN (
					SELECT CategoryId
					FROM @lcategory
					)
				OR [ProductCategories].[ProductID] IN (
					SELECT productId
					FROM @lproduct
					)
				)
		--LEFT JOIN [Catalog].[Photo] ON [Product].[ProductID] = [Photo].[ObjId] and Type ='Product' AND [Photo].[Main] = 1
		LEFT JOIN [Catalog].[Color] ON [Color].ColorID = [Offer].ColorID
		LEFT JOIN [Catalog].[Size] ON [Size].SizeID = [Offer].SizeID
		LEFT JOIN [Catalog].Brand ON Brand.BrandID = [Product].BrandID
		LEFT JOIN [Customers].Country ON Brand.CountryID = Country.CountryID
		INNER JOIN [Catalog].Currency ON Currency.CurrencyID = [Product].CurrencyID
		WHERE (
				SELECT TOP (1) [ProductCategories].[CategoryId]
				FROM [Catalog].[ProductCategories]
				INNER JOIN [Catalog].[Category] ON [Category].[CategoryId] = [ProductCategories].[CategoryId]
				WHERE [ProductID] = [Product].[ProductID]
					AND [Enabled] = 1
					AND [Main] = 1
				) = [ProductCategories].[CategoryId]
			AND (Offer.Price > 0 OR @exportNotAmount = 1)
			AND (
				Offer.Amount > 0
				OR (Product.AllowPreOrder = 1 and @allowPreOrder =1)
				OR @exportNotAmount = 1
				)
			AND CategoryEnabled = 1
			AND (Product.Enabled = 1 OR @exportNotActive = 1)
	END
END

GO--

INSERT INTO Settings.Settings (Name, Value) VALUES ('CustomersNotifications.CookiesPolicyMessage', 'Уважаемый посетитель! Для лучшего функционирования сайта #STORE_URL# мы производим сбор Ваших метаданных (cookie, данные об IP-адресе и местоположении). В случае, если Вы не хотите, чтобы нами был осуществлён сбор ваших метаданных, Вам необходимо покинуть данный сайт.')
GO--

GO--

ALTER PROCEDURE [Catalog].[PreCalcProductParamsMass] @ModerateReviews BIT, @OnlyAvailable bit AS 
BEGIN
   
INSERT INTO
   [Catalog].[ProductExt] (ProductId, CountPhoto, PhotoId, VideosAvailable, MaxAvailable, NotSamePrices, MinPrice, Colors, AmountSort, OfferId, Comments, CategoryId) (
   SELECT
      ProductId, 0, NULL, 0, 0, 0, 0, NULL, 0, NULL, 0, NULL 
   FROM
      [Catalog].Product 
   WHERE
      Product.ProductId NOT IN 
      (
         SELECT
            ProductId 
         FROM
            [Catalog].[ProductExt]
      )
) 
      UPDATE
         catalog.ProductExt 
      SET
         ProductExt.[CountPhoto] = tempTable.CountPhoto,
         ProductExt.[PhotoId] = tempTable.[PhotoId],
         ProductExt.[VideosAvailable] = tempTable.[VideosAvailable],
         ProductExt.[MaxAvailable] = tempTable.[MaxAvailable],
         ProductExt.[NotSamePrices] = tempTable.[NotSamePrices],
         ProductExt.[MinPrice] = tempTable.[MinPrice],
         ProductExt.[OfferId] = tempTable.[OfferId],
         ProductExt.[Comments] = tempTable.[Comments],
         ProductExt.[Gifts] = tempTable.[Gifts],
         ProductExt.[CategoryId] = tempTable.[CategoryId] ,
		 ProductExt.PriceTemp = tempTable.PriceTemp,
		 ProductExt.AmountSort=tempTable.AmountSort
      FROM
         catalog.ProductExt 
         INNER JOIN
            (               
           select 
		pe.ProductId,
		CountPhoto=case when offerId.ColorID is null then countNocolor.countNocolor else countColor.countColor end,				
		PhotoId=case when offerId.ColorID is null then PhotoIdNoColor.PhotoIdNoColor else PhotoIdColor.PhotoIdColor end,
		[VideosAvailable]=isnull(videosAvailable.videosAvailable,0),
		[MaxAvailable]=maxAvailable.maxAvailable,
		[NotSamePrices]=isnull(notSamePrices.notSamePrices,0),
		[MinPrice]=isnull(minPrice.minPrice,0),
		[OfferId]=offerId.OfferId,
		[Comments]=isnull(comments.comments,0),
		[Gifts]=isnull(gifts.gifts,0),
		[Colors]=(SELECT [Settings].[ProductColorsToString](pe.ProductId)),
		[CategoryId] = (SELECT TOP 1 id	FROM [Settings].[GetParentsCategoryByChild](( SELECT TOP 1 CategoryID FROM [Catalog].ProductCategories	WHERE ProductID = pe.ProductId ORDER BY Main DESC))ORDER BY sort DESC),
		PriceTemp = (isnull(minPrice.minPrice,0) - isnull(minPrice.minPrice,0) * p.Discount/100)*c.CurrencyValue,
		AmountSort=CASE when maxAvailable.maxAvailable <= 0 OR maxAvailable.maxAvailable < IsNull(p.MinAmount, 0) THEN 0 ELSE 1 end

from Catalog.[ProductExt] pe
left join (SELECT o.ProductId, COUNT(*) countColor FROM [Catalog].[Photo] ph INNER JOIN [Catalog].[Offer] o  ON ph.[ObjId] = o.ProductId 
            WHERE ( ph.ColorID = o.ColorID OR ph.ColorID IS NULL ) AND TYPE = 'Product' AND o.Main = 1 
			group by o.ProductId
) countColor on pe.ProductId=countColor.ProductId

left join (SELECT [ObjId], COUNT(*) countNocolor FROM [Catalog].[Photo]  
            WHERE TYPE = 'Product'
			group by [ObjId]
) countNocolor on pe.ProductId=countNocolor.[ObjId]

left join (
select ProductId, PhotoId PhotoIdColor from (
SELECT o.ProductId, ph.PhotoId, Row_Number() over (PARTITION  by o.ProductId ORDER BY ph.main DESC ,ph.[PhotoSortOrder], ph.[PhotoId]) rn FROM [Catalog].[Photo] ph
							INNER JOIN [Catalog].[Offer] o ON ph.[ObjId] = o.ProductId
							WHERE (ph.ColorID = o.ColorID OR ph.ColorID IS NULL) AND TYPE = 'Product' ) ct where rn=1
) PhotoIdColor on pe.ProductId=PhotoIdColor.ProductId

left join (
select ProductId, PhotoId PhotoIdNoColor from (
SELECT ph.[ObjId] ProductId, ph.PhotoId, Row_Number() over (PARTITION  by ph.[ObjId] ORDER BY ph.main DESC ,ph.[PhotoSortOrder], ph.[PhotoId]) rn FROM [Catalog].[Photo] ph	WHERE TYPE = 'Product' ) ct where rn=1
) PhotoIdNoColor on pe.ProductId=PhotoIdNoColor.ProductId

left join (select pv.ProductID, CASE WHEN COUNT(pv.ProductVideoID) > 0 THEN 1	ELSE 0 END videosAvailable FROM [Catalog].[ProductVideo] pv group by pv.ProductID) videosAvailable on pe.ProductId=videosAvailable.ProductId
left join (select o.ProductID,Max(o.Amount) maxAvailable  FROM [Catalog].Offer o group by o.ProductID) maxAvailable on pe.ProductId=maxAvailable.ProductId
left join (select o.ProductID, CASE WHEN MAX(o.price) - MIN(o.price) > 0 THEN 1 ELSE 0 END notSamePrices  FROM [Catalog].Offer o where o.price > 0 AND (@OnlyAvailable = 0 OR o.amount > 0) group by o.ProductID) notSamePrices on pe.ProductId=notSamePrices.ProductId
left join (select o.ProductID,MIN(o.price) minPrice FROM [Catalog].Offer o where o.price > 0 AND (@OnlyAvailable = 0 OR o.amount > 0)  group by o.ProductID) minPrice on pe.ProductId=minPrice.ProductId
left join ( 
select ProductId, OfferID, colorId from (
select o.ProductID,o.OfferID, o.colorId, Row_Number() over (PARTITION  by o.OfferID ORDER BY o.OfferID) rn  FROM [Catalog].Offer o where o.Main = 1 )ct where rn=1
) offerId on pe.ProductId=offerId.ProductId
left join (select EntityId ProductID,count(ReviewId) comments  FROM CMS.Review  where (Checked = 1 OR @ModerateReviews = 0) group by EntityId) comments on pe.ProductId=comments.ProductId
left join (select pg.ProductID, CASE WHEN COUNT(pg.ProductID) > 0 THEN 1 ELSE 0 END gifts  FROM [Catalog].[ProductGifts] pg group by pg.ProductID) gifts on pe.ProductId=gifts.ProductId
inner join catalog.Product p on p.ProductID = pe.ProductID
INNER JOIN CATALOG.Currency c ON p.currencyid = c.currencyid
 )
AS tempTable 
ON tempTable.ProductId = ProductExt.ProductId
    
END

GO--

INSERT INTO Settings.Localization (LanguageId, ResourceKey, ResourceValue) VALUES (1, 'Core.Customers.SendMail.NotTrackNumber','Номер отслеживания заказа не определен')

INSERT INTO Settings.Localization (LanguageId, ResourceKey, ResourceValue) VALUES (2, 'Core.Customers.SendMail.NotTrackNumber','Order tracking number is not defined')

GO--

update settings.MailFormatType set Comment = 'Письмо покупателю (#FIRSTNAME#, #LASTNAME#, #PATRONYMIC#, #TRACKNUMBER#, #STORE_NAME#)' where MailType = 'OnSendToCustomer'

GO--

ALTER PROCEDURE [Catalog].[sp_AddProduct]      
 @ArtNo nvarchar(100) = '',    
 @Name nvarchar(255),       
 @Ratio float,    
 @Discount float,    
 @Weight float,     
 @BriefDescription nvarchar(max),    
 @Description nvarchar(max),    
 @Enabled tinyint,    
 @Recomended bit,    
 @New bit,    
 @BestSeller bit,    
 @OnSale bit,    
 @BrandID int,    
 @AllowPreOrder bit,    
 @UrlPath nvarchar(150),    
 @Unit nvarchar(50),    
 @ShippingPrice float,    
 @MinAmount float,    
 @MaxAmount float,    
 @Multiplicity float,    
 @HasMultiOffer bit,    
 @SalesNote nvarchar(50),    
 @GoogleProductCategory nvarchar(500),    
 @YandexMarketCategory nvarchar(500),    
 @Gtin nvarchar(50),    
 @Adult bit,  
 @Length float,  
 @Width float,  
 @Height float,  
 @CurrencyID int,  
 @ActiveView360 bit,  
 @ManufacturerWarranty bit,  
 @ModifiedBy nvarchar(50),  
 @YandexTypePrefix nvarchar(500),  
 @YandexModel nvarchar(500),  
 @BarCode nvarchar(50),
 @Taxid int, 
 @YandexSizeUnit nvarchar(10)
AS    
BEGIN    
Declare @Id int    
INSERT INTO [Catalog].[Product]    
        ([ArtNo]    
        ,[Name]                       
        ,[Ratio]    
        ,[Discount]    
        ,[Weight]    
        ,[BriefDescription]    
        ,[Description]    
        ,[Enabled]    
        ,[DateAdded]    
        ,[DateModified]    
        ,[Recomended]    
        ,[New]    
        ,[BestSeller]    
        ,[OnSale]    
        ,[BrandID]    
        ,[AllowPreOrder]    
		,[UrlPath]
		,[Unit]
		,[ShippingPrice]
		,[MinAmount]
		,[MaxAmount]
		,[Multiplicity]
		,[HasMultiOffer]
		,[SalesNote]
		,GoogleProductCategory
		,YandexMarketCategory
		,Gtin
		,Adult
		,Length
		,Width
		,Height
		,CurrencyID
		,ActiveView360
		,ManufacturerWarranty
		,ModifiedBy
		,YandexTypePrefix
		,YandexModel
		,BarCode  
		,TaxId		
		,YandexSizeUnit	
        )    
     VALUES    
        (@ArtNo,    
		 @Name,         
		 @Ratio,    
		 @Discount,    
		 @Weight,  
		 @BriefDescription,    
		 @Description,    
		 @Enabled,    
		 GETDATE(),    
		 GETDATE(),    
		 @Recomended,    
		 @New,    
		 @BestSeller,    
		 @OnSale,    
		 @BrandID,    
		 @AllowPreOrder,    
		 @UrlPath,    
		 @Unit,    
		 @ShippingPrice,    
		 @MinAmount,    
		 @MaxAmount,    
		 @Multiplicity,    
		 @HasMultiOffer,    
		 @SalesNote,    
		 @GoogleProductCategory,    
		 @YandexMarketCategory,  
		 @Gtin,    
		 @Adult,  
		 @Length,  
		 @Width,  
		 @Height,  
		 @CurrencyID,  
		 @ActiveView360,  
		 @ManufacturerWarranty,  
		 @ModifiedBy,  
		 @YandexTypePrefix,  
		 @YandexModel,  
		 @BarCode,
		 @TaxId,
		 @YandexSizeUnit
   );    
    
 SET @ID = SCOPE_IDENTITY();    
 if @ArtNo=''    
 begin    
  set @ArtNo = Convert(nvarchar(50), @ID)     
    
  WHILE (SELECT COUNT(*) FROM [Catalog].[Product] WHERE [ArtNo] = @ArtNo) > 0    
  begin    
    SET @ArtNo = @ArtNo + '_A'    
  end    
    
  UPDATE [Catalog].[Product] SET [ArtNo] = @ArtNo WHERE [ProductID] = @ID     
 end    
 Select @ID    
END  

GO--

ALTER PROCEDURE [Catalog].[sp_UpdateProductById]    
 @ProductID int,        
 @ArtNo nvarchar(100),    
 @Name nvarchar(255),    
 @Ratio float,      
 @Discount float,    
 @Weight float,    
 @BriefDescription nvarchar(max),    
 @Description nvarchar(max),    
 @Enabled bit,    
 @Recomended bit,    
 @New bit,    
 @BestSeller bit,    
 @OnSale bit,    
 @BrandID int,    
 @AllowPreOrder bit,    
 @UrlPath nvarchar(150),    
 @Unit nvarchar(50),    
 @ShippingPrice money,    
 @MinAmount float,    
 @MaxAmount float,    
 @Multiplicity float,    
 @HasMultiOffer bit,    
 @SalesNote nvarchar(50),    
 @GoogleProductCategory nvarchar(500),    
 @YandexMarketCategory nvarchar(500),    
 @Gtin nvarchar(50),    
 @Adult bit,  
 @Length float,  
 @Width float,  
 @Height float,  
 @CurrencyID int,  
 @ActiveView360 bit,  
 @ManufacturerWarranty bit,  
 @ModifiedBy nvarchar(50),  
 @YandexTypePrefix nvarchar(500),  
 @YandexModel nvarchar(500),  
 @BarCode nvarchar(50),
 @TaxId int,
 @YandexSizeUnit nvarchar(10)  
   
AS    
BEGIN    
	UPDATE [Catalog].[Product]    
	 SET [ArtNo] = @ArtNo    
	 ,[Name] = @Name    
	 ,[Ratio] = @Ratio    
	 ,[Discount] = @Discount    
	 ,[Weight] = @Weight  
	 ,[BriefDescription] = @BriefDescription    
	 ,[Description] = @Description    
	 ,[Enabled] = @Enabled    
	 ,[Recomended] = @Recomended    
	 ,[New] = @New    
	 ,[BestSeller] = @BestSeller    
	 ,[OnSale] = @OnSale    
	 ,[DateModified] = GETDATE()    
	 ,[BrandID] = @BrandID    
	 ,[AllowPreOrder] = @AllowPreOrder    
	 ,[UrlPath] = @UrlPath    
	 ,[Unit] = @Unit    
	 ,[ShippingPrice] = @ShippingPrice    
	 ,[MinAmount] = @MinAmount    
	 ,[MaxAmount] = @MaxAmount    
	 ,[Multiplicity] = @Multiplicity    
	 ,[HasMultiOffer] = @HasMultiOffer    
	 ,[SalesNote] = @SalesNote    
	 ,[GoogleProductCategory]=@GoogleProductCategory    
	 ,[YandexMarketCategory]=@YandexMarketCategory  
	 ,[Gtin]=@Gtin    
	 ,[Adult] = @Adult  
	 ,[Length] = @Length  
	 ,[Width] = @Width  
	 ,[Height] = @Height  
	 ,[CurrencyID] = @CurrencyID  
	 ,[ActiveView360] = @ActiveView360  
	 ,[ManufacturerWarranty] = @ManufacturerWarranty  
	 ,[ModifiedBy] = @ModifiedBy  
	 ,[YandexTypePrefix] = @YandexTypePrefix  
	 ,[YandexModel] = @YandexModel  
	 ,[BarCode] = @BarCode
	 ,[TaxId] = @TaxId
	 ,[YandexSizeUnit] = @YandexSizeUnit
	WHERE ProductID = @ProductID      
END

GO--


INSERT INTO [Settings].[Localization] ([LanguageId], [ResourceKey], [ResourceValue]) VALUES (1, 'Js.Cart.Delete', 'Удалить')
INSERT INTO [Settings].[Localization] ([LanguageId], [ResourceKey], [ResourceValue]) VALUES (2, 'Js.Cart.Delete', 'Delete')
INSERT INTO [Settings].[Localization] ([LanguageId], [ResourceKey], [ResourceValue]) VALUES (1, 'Js.Cart.PreOrder', 'Под заказ')
INSERT INTO [Settings].[Localization] ([LanguageId], [ResourceKey], [ResourceValue]) VALUES (2, 'Js.Cart.PreOrder', 'PreOrder')

GO--


UPDATE [Settings].[InternalSettings] SET [settingValue] = '5.0.30' WHERE [settingKey] = 'db_version'