GO--
ALTER PROCEDURE [Catalog].[sp_GetSizesByCategory]  
 @CategoryID int,  
 @indepth bit,  
 @OnlyAvailable bit
AS  
BEGIN  
 if(@inDepth = 1)  
 begin  
  Select *, [Category_Size].SizeNameForCategory from Catalog.Size
  Left Join [Catalog].[Category_Size] On Size.SizeId = Category_Size.SizeId and Category_Size.CategoryId = @CategoryId
  where Size.SizeID in   
  (select Size.SizeID from Catalog.Offer   
   inner join Catalog.Product on Offer.ProductID=Product.ProductID   
   inner join Catalog.ProductCategories on ProductCategories.ProductID= Product.ProductID   
    and ProductCategories.CategoryID in (select id from Settings.GetChildCategoryByParent(@CategoryID))   
    where Product.Enabled = 1 and Product.CategoryEnabled=1 and (@OnlyAvailable = 0 OR Amount > 0))  
   order by Size.SortOrder, Size.SizeName  
 end  
 else  
 begin  
  Select *, [Category_Size].SizeNameForCategory from Catalog.Size
  Left Join [Catalog].[Category_Size] On Size.SizeId = Category_Size.SizeId and Category_Size.CategoryId = @CategoryId
  where Size.SizeID in   
  (select Size.SizeID from Catalog.Offer   
   inner join Catalog.Product on Offer.ProductID=Product.ProductID   
   inner join Catalog.ProductCategories on ProductCategories.ProductID= Product.ProductID   
    and ProductCategories.CategoryID = @CategoryID and   
    Product.Enabled = 1 and Product.CategoryEnabled=1  and (@OnlyAvailable = 0 OR Amount > 0))   
   order by Size.SortOrder, Size.SizeName  
 end  
END

GO--
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[Catalog].[RelatedProducts]') AND name = N'IX_RelatedProducts_ProductID_RelatedType')
begin
    CREATE NONCLUSTERED INDEX IX_RelatedProducts_ProductID_RelatedType ON [Catalog].[RelatedProducts] (ProductID, RelatedType)
end

GO--
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Shipping].[FivePostPickPoints]') AND type in (N'U'))
	ALTER TABLE [Shipping].[FivePostPickPoints]
	ALTER COLUMN [Id] nvarchar(100) NOT NULL

GO--
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[Shipping].[FivePostPickPoints]') AND name = N'PK_FivePostPickPoints')
	ALTER TABLE [Shipping].[FivePostPickPoints] ADD CONSTRAINT
		[PK_FivePostPickPoints] PRIMARY KEY CLUSTERED 
		(
		[Id]
		) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO--
DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'Admin.Settings.MobileVersion.ShowBottomPanel'

GO--

UPDATE [Settings].[TemplateSettings]
SET [Name]  = 'Mobile_BottomPanelViewMode', 
	[Value] = (CASE WHEN Value = 'True' THEN '1' ELSE '0' END)
WHERE [Name] = 'Mobile_ShowBottomPanel' 
    and not Exists(Select 1 
                    from [Settings].[TemplateSettings] ts 
                    where ts.Template = Template and ts.Name = 'Mobile_BottomPanelViewMode')



GO--
IF NOT EXISTS (SELECT * FROM Catalog.Tax WHERE TaxType = 6)
begin
    insert into Catalog.Tax (Name, Enabled, ShowInPrice, Rate, TaxType)
    values (N'НДС 5%',1,1,5, 6),
           (N'НДС 7%',1,1,7, 7)
end

GO--
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CMS.StaticPageCities') AND type in (N'U'))
BEGIN
    drop table CMS.StaticPageCities;
END

GO--
ALTER PROCEDURE [Catalog].[PreCalcProductParams]
    @productId INT,
    @ModerateReviews BIT,
    @OnlyAvailable BIT,
    @ComplexFilter BIT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @CountPhoto INT;
    DECLARE @Type NVARCHAR(10);
    DECLARE @PhotoId INT;
    DECLARE @MaxAvailable FLOAT;
    DECLARE @VideosAvailable BIT;
    DECLARE @Colors NVARCHAR(MAX);
    DECLARE @NotSamePrices BIT;
    DECLARE @MinPrice FLOAT;
	DECLARE @MaxPrice FLOAT;
    DECLARE @PriceTemp FLOAT;
    DECLARE @AmountSort BIT;
    DECLARE @OfferId INT;
    DECLARE @Comments INT;
    DECLARE @CategoryId INT;
    DECLARE @Gifts BIT;
	DECLARE @AllowAddToCartInCatalog BIT;

    IF NOT EXISTS
        (
            SELECT ProductID
            FROM [Catalog].Product
            WHERE ProductID = @productId
        )
        RETURN;
    SET @Type = 'Product';

    --@CountPhoto        
    SET @CountPhoto =
            (
                SELECT TOP (1) CASE
                                   WHEN
                                           (
                                               SELECT Offer.ColorID
                                               FROM [Catalog].[Offer]
                                               WHERE [ProductID] = @productId
                                                 AND main = 1
                                           ) IS NOT NULL AND @ComplexFilter = 1
                                       THEN
                                       (
                                           SELECT COUNT(DISTINCT PhotoId)
                                           FROM [Catalog].[Photo]
                                                    INNER JOIN [Catalog].[Offer] ON [Photo].ColorID = Offer.ColorID OR [Photo].ColorID is NULL
                                           WHERE [Photo].[ObjId] = Offer.[ProductId]
                                             AND [Offer].Main = 1
                                             AND TYPE = @Type
                                             AND Offer.[ProductId] = @productId
                                       )
                                   ELSE
                                       (
                                           SELECT COUNT(PhotoId)
                                           FROM [Catalog].[Photo]
                                           WHERE [Photo].[ObjId] = @productId
                                             AND TYPE = @Type
                                       )
                                   END
            );

    --@PhotoId        
    SET @PhotoId =
            (
                SELECT CASE
                           WHEN
                               (
                                   SELECT Offer.ColorID
                                   FROM [Catalog].[Offer]
                                   WHERE [ProductID] = @productId
                                     AND main = 1
                               ) IS NOT NULL
                               THEN
                               (
                                   SELECT TOP (1) PhotoId
                                   FROM [Catalog].[Photo]
                                            INNER JOIN [Catalog].[Offer] ON Offer.[ProductId] = @productId AND ([Photo].ColorID = Offer.ColorID OR [Photo].ColorID is NULL)
                                   WHERE([Photo].ColorID = Offer.ColorID
                                       OR [Photo].ColorID IS NULL)
                                     AND [Photo].[ObjId] = @productId
                                     AND Type = @Type
                                   ORDER BY [Photo]. main DESC,
                                            [Photo].[PhotoSortOrder],
                                            [PhotoId]
                               )
                           ELSE
                               (
                                   SELECT TOP (1) PhotoId
                                   FROM [Catalog].[Photo]
                                   WHERE [Photo].[ObjId] = @productId
                                     AND Type = @Type
                                   ORDER BY main DESC,
                                            [Photo].[PhotoSortOrder],
                                            [PhotoId]
                               )
                           END
            );

    --VideosAvailable        
    IF (SELECT COUNT(ProductVideoID) FROM [Catalog].[ProductVideo] WHERE ProductID = @productId) > 0
        BEGIN
            SET @VideosAvailable = 1;
        END;
    ELSE
        BEGIN
            SET @VideosAvailable = 0;
        END;

    --@MaxAvailable        
    SET @MaxAvailable = (SELECT MAX(Offer.Amount) FROM [Catalog].Offer WHERE ProductId = @productId);

    --AmountSort        
    SET @AmountSort =
            (
                SELECT CASE
                           WHEN @MaxAvailable <= 0
                               OR @MaxAvailable < ISNULL(Product.MinAmount, 0)
                               THEN 0
                           ELSE 1
                           END
                FROM [Catalog].Offer
                         INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
                WHERE Offer.ProductId = @productId
                  AND main = 1
            );

    --Colors        
    SET @Colors =
            (
                SELECT [Settings].[ProductColorsToString](@productId, @OnlyAvailable)
            );

    --@NotSamePrices        
    IF
            (
                SELECT MAX(price) - MIN(price)
                FROM [Catalog].offer
                         INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
                WHERE offer.productid = @productId AND
                        price > 0 AND
                    (@OnlyAvailable = 0 OR amount > 0 OR AllowPreOrder = 1)
            ) > 0
        BEGIN
            SET @NotSamePrices = 1;
        END;
    ELSE
        BEGIN
            SET @NotSamePrices = 0;
        END;

    --@MinPrice        
    SET @MinPrice =
            (
                SELECT isNull(MIN(price), 0)
                FROM [Catalog].offer
                         INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
                WHERE offer.productid = @productId AND
                        price > 0 AND
                    (@OnlyAvailable = 0 OR amount > 0 OR AllowPreOrder = 1)
            );

	--@MaxPrice        
    SET @MaxPrice =
            (
                SELECT isNull(MAX(price), 0)
                FROM [Catalog].offer
                         INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
                WHERE offer.productid = @productId AND
                        price > 0 AND
                    (@OnlyAvailable = 0 OR amount > 0 OR AllowPreOrder = 1)
            );

    --@OfferId      
    SET @OfferId =
            (
                SELECT OfferID
                FROM [Catalog].offer
                WHERE offer.productid = @productId AND (offer.Main = 1 OR offer.Main IS NULL)
            );


    --@PriceTemp        
    SET @PriceTemp =
            (
                SELECT CASE WHEN [Product].Discount > 0 THEN (@MinPrice - @MinPrice * [Product].Discount / 100) * CurrencyValue ELSE (@MinPrice - isnull([Product].DiscountAmount, 0)) * CurrencyValue END
                FROM Catalog.Product
                         INNER JOIN Catalog.Currency ON Product.Currencyid = Currency.Currencyid
                WHERE Product.Productid = @productId
            );

    --@Comments      
    SET @Comments =
            (
                SELECT COUNT(ReviewId)
                FROM CMS.Review
                WHERE EntityId = @productId AND (Checked = 1 OR @ModerateReviews = 0)
            );

    --@Gifts      
    SET @Gifts =
            (
                SELECT TOP (1) CASE
                                   WHEN COUNT([ProductGifts].ProductID) > 0
                                       THEN 1
                                   ELSE 0
                                   END
                FROM [Catalog].[ProductGifts]
                         INNER JOIN Catalog.Offer on ProductGifts.GiftOfferId = Offer.OfferId
                         INNER JOIN Catalog.Product on Offer.ProductId = Product.ProductId
                WHERE [ProductGifts].ProductID = @productId  and Offer.Amount > ISNULL(Product.MinAmount, 0) and Enabled = 1
            );

	SET @AllowAddToCartInCatalog = 
			(
				CASE WHEN (
							(SELECT COUNT(DISTINCT SizeID) FROM [Catalog].[Offer] WHERE [ProductID] = @ProductId) <= 1
                                and not Exists (SELECT 1 FROM [Catalog].[CustomOptions] WHERE ProductID = @productId)
							) THEN 1 
					 ELSE 0
					 END
			);

    IF
            (
                SELECT COUNT(productid)
                FROM [Catalog].ProductExt
                WHERE productid = @productId
            ) > 0
        BEGIN
            UPDATE [Catalog].[ProductExt]
            SET
                [CountPhoto] = @CountPhoto,
                [PhotoId] = @PhotoId,
                [VideosAvailable] = @VideosAvailable,
                [MaxAvailable] = @MaxAvailable,
                [NotSamePrices] = @NotSamePrices,
                [MinPrice] = @MinPrice,
                [Colors] = @Colors,
                [AmountSort] = @AmountSort,
                [OfferId] = @OfferId,
                [Comments] = @Comments,
                [PriceTemp] = @PriceTemp,
                [Gifts] = @Gifts,
				[AllowAddToCartInCatalog] = @AllowAddToCartInCatalog,
				[MaxPrice] = @MaxPrice
            WHERE [ProductId] = @productId;
        END;
    ELSE
        BEGIN
            INSERT INTO [Catalog].[ProductExt]
            ([ProductId],
             [CountPhoto],
             [PhotoId],
             [VideosAvailable],
             [MaxAvailable],
             [NotSamePrices],
             [MinPrice],
             [Colors],
             [AmountSort],
             [OfferId],
             [Comments],
             [PriceTemp],
             [Gifts],
			 [AllowAddToCartInCatalog],
			 [MaxPrice]
            )
            VALUES
                (@productId,
                 @CountPhoto,
                 @PhotoId,
                 @VideosAvailable,
                 @MaxAvailable,
                 @NotSamePrices,
                 @MinPrice,
                 @Colors,
                 @AmountSort,
                 @OfferId,
                 @Comments,
                 @PriceTemp,
                 @Gifts,
				 @AllowAddToCartInCatalog,
				 @MaxPrice
            );
        END;
END;

GO--
ALTER PROCEDURE [Catalog].[PreCalcProductParamsMass] @ModerateReviews BIT, @OnlyAvailable bit,  @ComplexFilter BIT AS
BEGIN

    INSERT INTO [Catalog].[ProductExt] (ProductId, CountPhoto, PhotoId, VideosAvailable, MaxAvailable, NotSamePrices, MinPrice, Colors, AmountSort, OfferId, Comments, MaxPrice) 
	(
        SELECT ProductId, 0, NULL, 0, 0, 0, 0, NULL, 0, NULL, 0, 0
        FROM [Catalog].Product
        WHERE Product.ProductId NOT IN (SELECT ProductId FROM [Catalog].[ProductExt])
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
		ProductExt.[MaxPrice] = tempTable.[MaxPrice],
        ProductExt.[OfferId] = tempTable.[OfferId],
        ProductExt.[Comments] = tempTable.[Comments],
        ProductExt.[Gifts] = tempTable.[Gifts],
        ProductExt.[Colors] = tempTable.[Colors],
        --ProductExt.[CategoryId] = tempTable.[CategoryId] ,
        ProductExt.PriceTemp = tempTable.PriceTemp,
        ProductExt.AmountSort=tempTable.AmountSort,
		ProductExt.AllowAddToCartInCatalog = tempTable.AllowAddToCartInCatalog
    FROM
        catalog.ProductExt
            INNER JOIN
        (
            select
                pe.ProductId,
                CountPhoto=case when offerId.ColorID is null OR @ComplexFilter = 0 then countNocolor.countNocolor else countColor.countColor end,
                PhotoId=case when offerId.ColorID is null then PhotoIdNoColor.PhotoIdNoColor else PhotoIdColor.PhotoIdColor end,
                [VideosAvailable]=isnull(videosAvailable.videosAvailable,0),
                [MaxAvailable]=maxAvailable.maxAvailable,
                [NotSamePrices]=isnull(notSamePrices.notSamePrices,0),
                [MinPrice]=isnull(minMaxPrice.minPrice,0),
				[MaxPrice]=isnull(minMaxPrice.maxPrice,0),
                [OfferId]=offerId.OfferId,
                [Comments]=isnull(comments.comments,0),
                [Gifts]=isnull(gifts.gifts,0),
                [Colors]=(SELECT [Settings].[ProductColorsToString](pe.ProductId, @OnlyAvailable)),
                --[CategoryId] = (SELECT TOP 1 id	FROM [Settings].[GetParentsCategoryByChild](( SELECT TOP 1 CategoryID FROM [Catalog].ProductCategories	WHERE ProductID = pe.ProductId ORDER BY Main DESC))ORDER BY sort DESC),
                PriceTemp = CASE WHEN p.Discount > 0 THEN (isnull(minMaxPrice.minPrice,0) - isnull(minMaxPrice.minPrice,0) * p.Discount/100)*c.CurrencyValue ELSE (isnull(minMaxPrice.minPrice,0) - isnull(p.DiscountAmount,0))*c.CurrencyValue END,
                AmountSort=CASE when ISNULL(maxAvailable.maxAvailable, 0) <= 0 OR maxAvailable.maxAvailable < IsNull(p.MinAmount, 0) THEN 0 ELSE 1 end,
				AllowAddToCartInCatalog = (CASE WHEN ((SELECT COUNT(DISTINCT SizeID) FROM [Catalog].[Offer] WHERE [ProductID] = pe.ProductId) <= 1
													   and not Exists (SELECT 1 FROM [Catalog].[CustomOptions] WHERE ProductID = pe.ProductId)
													 ) THEN 1 
												ELSE 0 END)

            from Catalog.[ProductExt] pe
                     left join (
									SELECT o.ProductId, COUNT(*) countColor FROM [Catalog].[Photo] ph INNER JOIN [Catalog].[Offer] o  ON ph.[ObjId] = o.ProductId
									WHERE ( ph.ColorID = o.ColorID OR ph.ColorID IS NULL ) AND TYPE = 'Product' AND o.Main = 1
									group by o.ProductId
								) countColor on pe.ProductId=countColor.ProductId

                     left join (
									SELECT [ObjId], COUNT(*) countNocolor FROM [Catalog].[Photo]
									WHERE TYPE = 'Product'
									group by [ObjId]
								) countNocolor on pe.ProductId=countNocolor.[ObjId]

                     left join (
									select ProductId, PhotoId PhotoIdColor 
									from (
										   SELECT o.ProductId, ph.PhotoId, Row_Number() over (PARTITION  by o.ProductId ORDER BY ph.main DESC ,ph.[PhotoSortOrder], ph.[PhotoId]) rn 
										   FROM [Catalog].[Photo] ph 
										   INNER JOIN [Catalog].[Offer] o ON ph.[ObjId] = o.ProductId
										   WHERE (ph.ColorID = o.ColorID OR ph.ColorID IS NULL) AND TYPE = 'Product' 
										 ) ct 
									where rn=1
								) PhotoIdColor on pe.ProductId=PhotoIdColor.ProductId

                     left join (
									select ProductId, PhotoId PhotoIdNoColor 
									from (
											SELECT ph.[ObjId] ProductId, ph.PhotoId, Row_Number() over (PARTITION  by ph.[ObjId] ORDER BY ph.main DESC ,ph.[PhotoSortOrder], ph.[PhotoId]) rn 
											FROM [Catalog].[Photo] ph	
											WHERE TYPE = 'Product' 
										 ) ct 
									where rn=1
								) PhotoIdNoColor on pe.ProductId=PhotoIdNoColor.ProductId

                     left join (
									select pv.ProductID, CASE WHEN COUNT(pv.ProductVideoID) > 0 THEN 1	ELSE 0 END videosAvailable 
									FROM [Catalog].[ProductVideo] pv 
									group by pv.ProductID
								) videosAvailable on pe.ProductId=videosAvailable.ProductId

                     left join (
									select o.ProductID,Max(o.Amount) maxAvailable  FROM [Catalog].Offer o group by o.ProductID
								) maxAvailable on pe.ProductId=maxAvailable.ProductId

                     left join (
									select o.ProductID, CASE WHEN MAX(o.price) - MIN(o.price) > 0 THEN 1 ELSE 0 END notSamePrices  
									FROM [Catalog].Offer o 
									Inner Join [Catalog].Product On Product.ProductId = o.ProductID 
									where o.price > 0 AND (@OnlyAvailable = 0 OR o.amount > 0 OR AllowPreOrder = 1) 
									group by o.ProductID
								) notSamePrices on pe.ProductId=notSamePrices.ProductId

                     left join (
									select o.ProductID, MIN(o.Price) minPrice, MAX(o.Price) maxPrice
									FROM [Catalog].Offer o 
									Inner Join [Catalog].Product On Product.ProductId = o.ProductID 
									where o.price > 0 AND (@OnlyAvailable = 0 OR o.amount > 0 OR AllowPreOrder = 1)  
									group by o.ProductID
								) minMaxPrice on pe.ProductId=minMaxPrice.ProductId

                     
					 left join (
									select ProductId, OfferID, colorId 
									from (
											select o.ProductID,o.OfferID, o.colorId, Row_Number() over (PARTITION  by o.OfferID ORDER BY o.OfferID) rn  
											FROM [Catalog].Offer o where o.Main = 1 
										 )ct 
									where rn=1
								) offerId on pe.ProductId=offerId.ProductId

                     left join (
									select EntityId ProductID,count(ReviewId) comments  
									FROM CMS.Review  
									where (Checked = 1 OR @ModerateReviews = 0) 
									group by EntityId
								) comments on pe.ProductId=comments.ProductId

                     left join (
									select pg.ProductID, CASE WHEN COUNT(pg.ProductID) > 0 THEN 1 ELSE 0 END gifts 
									FROM [Catalog].[ProductGifts] pg 
									INNER JOIN Catalog.Offer on pg.GiftOfferId = Offer.OfferId 
									INNER JOIN Catalog.Product on Offer.ProductId = Product.ProductId 
									WHERE Offer.Amount > ISNULL(Product.MinAmount, 0) and Enabled = 1 
									group by pg.ProductID
								) gifts on pe.ProductId=gifts.ProductId

                     inner join Catalog.Product p on p.ProductID = pe.ProductID
                     inner join Catalog.Currency c ON p.CurrencyId = c.CurrencyId
        )
            AS tempTable
        ON tempTable.ProductId = ProductExt.ProductId
END

GO--
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Settings].[GuardBlockWordsInText]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Settings].[GuardBlockWordsInText](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Term] [nvarchar](max) NOT NULL,
    CONSTRAINT [PK_GuardBlockWordsInText] PRIMARY KEY CLUSTERED 
    (
        [Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    ) ON [PRIMARY]
END

GO--
if not exists (Select 1 From [Settings].[GuardBlockWordsInText])
begin
    Insert Into [Settings].[GuardBlockWordsInText] (Term) 
    Values ('response.write('),
    ('nslookup -q=cname'),
    ('sleep('),
    ('print(md5('),
    ('waitfor delay '''),
    ('sysdate()'),
    ('PG_SLEEP('),
    ('echo iescpf$'),
    ('<script>'),
    ('</script>'),
    ('document.cookie'),
    ('$on.constructor')
end

GO--
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Settings].[GuardBlockWordsInUrl]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Settings].[GuardBlockWordsInUrl](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Term] [nvarchar](max) NOT NULL,
    CONSTRAINT [PK_GuardBlockWordsInUrl] PRIMARY KEY CLUSTERED 
    (
        [Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    ) ON [PRIMARY]
END

GO--
if not exists (Select 1 From [Settings].[GuardBlockWordsInUrl])
begin
    Insert Into [Settings].[GuardBlockWordsInUrl] (Term) 
    Values ('wp-content/'),
    ('wp-admin/'),
    ('wp-includes/'),
    ('xmlrpc.php'),
    ('admin.php'),
    ('wp-login.php'),
    ('about.php'),
    ('.git/config'),
    ('.env')
end

GO--
IF NOT EXISTS (SELECT 1
           FROM [Settings].[Settings]
           WHERE [Name] = 'ChooseBtnText')
BEGIN
    INSERT INTO [Settings].[Settings] (Name, Value) VALUES ('ChooseBtnText', 'Выбрать')
END

GO--
Alter table Customers.Subscription alter column email nvarchar(100) not null

GO--
IF EXISTS (SELECT *
           FROM dbo.sysobjects
           WHERE id = object_id(N'[Catalog].[sp_DeleteCustomOption]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [Catalog].[sp_DeleteCustomOption]

GO--
ALTER PROCEDURE [Catalog].[PreCalcProductParams]
    @productId INT,
    @ModerateReviews BIT,
    @OnlyAvailable BIT,
    @ComplexFilter BIT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @CountPhoto INT;
    DECLARE @Type NVARCHAR(10);
    DECLARE @PhotoId INT;
    DECLARE @MaxAvailable FLOAT;
    DECLARE @VideosAvailable BIT;
    DECLARE @Colors NVARCHAR(MAX);
    DECLARE @NotSamePrices BIT;
    DECLARE @MinPrice FLOAT;
	DECLARE @MaxPrice FLOAT;
    DECLARE @PriceTemp FLOAT;
    DECLARE @AmountSort BIT;
    DECLARE @OfferId INT;
    DECLARE @Comments INT;
    DECLARE @CategoryId INT;
    DECLARE @Gifts BIT;
	DECLARE @AllowAddToCartInCatalog BIT;

    IF NOT EXISTS
        (
            SELECT ProductID
            FROM [Catalog].Product
            WHERE ProductID = @productId
        )
        RETURN;
    SET @Type = 'Product';

    --@CountPhoto        
    SET @CountPhoto =
            (
                SELECT TOP (1) CASE
                                   WHEN
                                           (
                                               SELECT Offer.ColorID
                                               FROM [Catalog].[Offer]
                                               WHERE [ProductID] = @productId
                                                 AND main = 1
                                           ) IS NOT NULL AND @ComplexFilter = 1
                                       THEN
                                       (
                                           SELECT COUNT(DISTINCT PhotoId)
                                           FROM [Catalog].[Photo]
                                                    INNER JOIN [Catalog].[Offer] ON [Photo].ColorID = Offer.ColorID OR [Photo].ColorID is NULL
                                           WHERE [Photo].[ObjId] = Offer.[ProductId]
                                             AND [Offer].Main = 1
                                             AND TYPE = @Type
                                             AND Offer.[ProductId] = @productId
                                       )
                                   ELSE
                                       (
                                           SELECT COUNT(PhotoId)
                                           FROM [Catalog].[Photo]
                                           WHERE [Photo].[ObjId] = @productId
                                             AND TYPE = @Type
                                       )
                                   END
            );

    --@PhotoId        
    SET @PhotoId =
            (
                SELECT CASE
                           WHEN
                               (
                                   SELECT Offer.ColorID
                                   FROM [Catalog].[Offer]
                                   WHERE [ProductID] = @productId
                                     AND main = 1
                               ) IS NOT NULL
                               THEN
                               (
                                   SELECT TOP (1) PhotoId
                                   FROM [Catalog].[Photo]
                                            INNER JOIN [Catalog].[Offer] ON Offer.[ProductId] = @productId AND ([Photo].ColorID = Offer.ColorID OR [Photo].ColorID is NULL)
                                   WHERE([Photo].ColorID = Offer.ColorID
                                       OR [Photo].ColorID IS NULL)
                                     AND [Photo].[ObjId] = @productId
                                     AND Type = @Type
                                   ORDER BY 
											[Offer].main DESC,
											[Photo].main DESC,
                                            [Photo].[PhotoSortOrder],
                                            [PhotoId]
                               )
                           ELSE
                               (
                                   SELECT TOP (1) PhotoId
                                   FROM [Catalog].[Photo]
                                   WHERE [Photo].[ObjId] = @productId
                                     AND Type = @Type
                                   ORDER BY main DESC,
                                            [Photo].[PhotoSortOrder],
                                            [PhotoId]
                               )
                           END
            );

    --VideosAvailable        
    IF (SELECT COUNT(ProductVideoID) FROM [Catalog].[ProductVideo] WHERE ProductID = @productId) > 0
        BEGIN
            SET @VideosAvailable = 1;
        END;
    ELSE
        BEGIN
            SET @VideosAvailable = 0;
        END;

    --@MaxAvailable        
    SET @MaxAvailable = (SELECT MAX(Offer.Amount) FROM [Catalog].Offer WHERE ProductId = @productId);

    --AmountSort        
    SET @AmountSort =
            (
                SELECT CASE
                           WHEN @MaxAvailable <= 0
                               OR @MaxAvailable < ISNULL(Product.MinAmount, 0)
                               THEN 0
                           ELSE 1
                           END
                FROM [Catalog].Offer
                         INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
                WHERE Offer.ProductId = @productId
                  AND main = 1
            );

    --Colors        
    SET @Colors =
            (
                SELECT [Settings].[ProductColorsToString](@productId, @OnlyAvailable)
            );

    --@NotSamePrices        
    IF
            (
                SELECT MAX(price) - MIN(price)
                FROM [Catalog].offer
                         INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
                WHERE offer.productid = @productId AND
                        price > 0 AND
                    (@OnlyAvailable = 0 OR amount > 0 OR AllowPreOrder = 1)
            ) > 0
        BEGIN
            SET @NotSamePrices = 1;
        END;
    ELSE
        BEGIN
            SET @NotSamePrices = 0;
        END;

    --@MinPrice        
    SET @MinPrice =
            (
                SELECT isNull(MIN(price), 0)
                FROM [Catalog].offer
                         INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
                WHERE offer.productid = @productId AND
                        price > 0 AND
                    (@OnlyAvailable = 0 OR amount > 0 OR AllowPreOrder = 1)
            );

	--@MaxPrice        
    SET @MaxPrice =
            (
                SELECT isNull(MAX(price), 0)
                FROM [Catalog].offer
                         INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
                WHERE offer.productid = @productId AND
                        price > 0 AND
                    (@OnlyAvailable = 0 OR amount > 0 OR AllowPreOrder = 1)
            );

    --@OfferId      
    SET @OfferId =
            (
                SELECT OfferID
                FROM [Catalog].offer
                WHERE offer.productid = @productId AND (offer.Main = 1 OR offer.Main IS NULL)
            );


    --@PriceTemp        
    SET @PriceTemp =
            (
                SELECT CASE WHEN [Product].Discount > 0 THEN (@MinPrice - @MinPrice * [Product].Discount / 100) * CurrencyValue ELSE (@MinPrice - isnull([Product].DiscountAmount, 0)) * CurrencyValue END
                FROM Catalog.Product
                         INNER JOIN Catalog.Currency ON Product.Currencyid = Currency.Currencyid
                WHERE Product.Productid = @productId
            );

    --@Comments      
    SET @Comments =
            (
                SELECT COUNT(ReviewId)
                FROM CMS.Review
                WHERE EntityId = @productId AND (Checked = 1 OR @ModerateReviews = 0)
            );

    --@Gifts      
    SET @Gifts =
            (
                SELECT TOP (1) CASE
                                   WHEN COUNT([ProductGifts].ProductID) > 0
                                       THEN 1
                                   ELSE 0
                                   END
                FROM [Catalog].[ProductGifts]
                         INNER JOIN Catalog.Offer on ProductGifts.GiftOfferId = Offer.OfferId
                         INNER JOIN Catalog.Product on Offer.ProductId = Product.ProductId
                WHERE [ProductGifts].ProductID = @productId  and Offer.Amount > ISNULL(Product.MinAmount, 0) and Enabled = 1
            );

	SET @AllowAddToCartInCatalog = 
			(
				CASE WHEN (
							(SELECT COUNT(DISTINCT SizeID) FROM [Catalog].[Offer] WHERE [ProductID] = @ProductId) <= 1
                                and not Exists (SELECT 1 FROM [Catalog].[CustomOptions] WHERE ProductID = @productId)
							) THEN 1 
					 ELSE 0
					 END
			);

    IF
            (
                SELECT COUNT(productid)
                FROM [Catalog].ProductExt
                WHERE productid = @productId
            ) > 0
        BEGIN
            UPDATE [Catalog].[ProductExt]
            SET
                [CountPhoto] = @CountPhoto,
                [PhotoId] = @PhotoId,
                [VideosAvailable] = @VideosAvailable,
                [MaxAvailable] = @MaxAvailable,
                [NotSamePrices] = @NotSamePrices,
                [MinPrice] = @MinPrice,
                [Colors] = @Colors,
                [AmountSort] = @AmountSort,
                [OfferId] = @OfferId,
                [Comments] = @Comments,
                [PriceTemp] = @PriceTemp,
                [Gifts] = @Gifts,
				[AllowAddToCartInCatalog] = @AllowAddToCartInCatalog,
				[MaxPrice] = @MaxPrice
            WHERE [ProductId] = @productId;
        END;
    ELSE
        BEGIN
            INSERT INTO [Catalog].[ProductExt]
            ([ProductId],
             [CountPhoto],
             [PhotoId],
             [VideosAvailable],
             [MaxAvailable],
             [NotSamePrices],
             [MinPrice],
             [Colors],
             [AmountSort],
             [OfferId],
             [Comments],
             [PriceTemp],
             [Gifts],
			 [AllowAddToCartInCatalog],
			 [MaxPrice]
            )
            VALUES
                (@productId,
                 @CountPhoto,
                 @PhotoId,
                 @VideosAvailable,
                 @MaxAvailable,
                 @NotSamePrices,
                 @MinPrice,
                 @Colors,
                 @AmountSort,
                 @OfferId,
                 @Comments,
                 @PriceTemp,
                 @Gifts,
				 @AllowAddToCartInCatalog,
				 @MaxPrice
            );
        END;
END;


GO--
ALTER PROCEDURE [Catalog].[PreCalcProductParamsMass] @ModerateReviews BIT, @OnlyAvailable bit,  @ComplexFilter BIT AS
BEGIN

    INSERT INTO [Catalog].[ProductExt] (ProductId, CountPhoto, PhotoId, VideosAvailable, MaxAvailable, NotSamePrices, MinPrice, Colors, AmountSort, OfferId, Comments, MaxPrice) 
	(
        SELECT ProductId, 0, NULL, 0, 0, 0, 0, NULL, 0, NULL, 0, 0
        FROM [Catalog].Product
        WHERE Product.ProductId NOT IN (SELECT ProductId FROM [Catalog].[ProductExt])
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
		ProductExt.[MaxPrice] = tempTable.[MaxPrice],
        ProductExt.[OfferId] = tempTable.[OfferId],
        ProductExt.[Comments] = tempTable.[Comments],
        ProductExt.[Gifts] = tempTable.[Gifts],
        ProductExt.[Colors] = tempTable.[Colors],
        --ProductExt.[CategoryId] = tempTable.[CategoryId] ,
        ProductExt.PriceTemp = tempTable.PriceTemp,
        ProductExt.AmountSort=tempTable.AmountSort,
		ProductExt.AllowAddToCartInCatalog = tempTable.AllowAddToCartInCatalog
    FROM
        catalog.ProductExt
            INNER JOIN
        (
            select
                pe.ProductId,
                CountPhoto=case when offerId.ColorID is null OR @ComplexFilter = 0 then countNocolor.countNocolor else countColor.countColor end,
                PhotoId=case when offerId.ColorID is null then PhotoIdNoColor.PhotoIdNoColor else PhotoIdColor.PhotoIdColor end,
                [VideosAvailable]=isnull(videosAvailable.videosAvailable,0),
                [MaxAvailable]=maxAvailable.maxAvailable,
                [NotSamePrices]=isnull(notSamePrices.notSamePrices,0),
                [MinPrice]=isnull(minMaxPrice.minPrice,0),
				[MaxPrice]=isnull(minMaxPrice.maxPrice,0),
                [OfferId]=offerId.OfferId,
                [Comments]=isnull(comments.comments,0),
                [Gifts]=isnull(gifts.gifts,0),
                [Colors]=(SELECT [Settings].[ProductColorsToString](pe.ProductId, @OnlyAvailable)),
                --[CategoryId] = (SELECT TOP 1 id	FROM [Settings].[GetParentsCategoryByChild](( SELECT TOP 1 CategoryID FROM [Catalog].ProductCategories	WHERE ProductID = pe.ProductId ORDER BY Main DESC))ORDER BY sort DESC),
                PriceTemp = CASE WHEN p.Discount > 0 THEN (isnull(minMaxPrice.minPrice,0) - isnull(minMaxPrice.minPrice,0) * p.Discount/100)*c.CurrencyValue ELSE (isnull(minMaxPrice.minPrice,0) - isnull(p.DiscountAmount,0))*c.CurrencyValue END,
                AmountSort=CASE when ISNULL(maxAvailable.maxAvailable, 0) <= 0 OR maxAvailable.maxAvailable < IsNull(p.MinAmount, 0) THEN 0 ELSE 1 end,
				AllowAddToCartInCatalog = (CASE WHEN ((SELECT COUNT(DISTINCT SizeID) FROM [Catalog].[Offer] WHERE [ProductID] = pe.ProductId) <= 1
													   and not Exists (SELECT 1 FROM [Catalog].[CustomOptions] WHERE ProductID = pe.ProductId)
													 ) THEN 1 
												ELSE 0 END)

            from Catalog.[ProductExt] pe
                     left join (
									SELECT o.ProductId, COUNT(*) countColor FROM [Catalog].[Photo] ph INNER JOIN [Catalog].[Offer] o  ON ph.[ObjId] = o.ProductId
									WHERE ( ph.ColorID = o.ColorID OR ph.ColorID IS NULL ) AND TYPE = 'Product' AND o.Main = 1
									group by o.ProductId
								) countColor on pe.ProductId=countColor.ProductId

                     left join (
									SELECT [ObjId], COUNT(*) countNocolor FROM [Catalog].[Photo]
									WHERE TYPE = 'Product'
									group by [ObjId]
								) countNocolor on pe.ProductId=countNocolor.[ObjId]

                     left join (
									select ProductId, PhotoId PhotoIdColor 
									from (
										   SELECT o.ProductId, ph.PhotoId, Row_Number() over (PARTITION  by o.ProductId ORDER BY o.main DESC, ph.main DESC ,ph.[PhotoSortOrder], ph.[PhotoId]) rn 
										   FROM [Catalog].[Photo] ph 
										   INNER JOIN [Catalog].[Offer] o ON ph.[ObjId] = o.ProductId
										   WHERE (ph.ColorID = o.ColorID OR ph.ColorID IS NULL) AND TYPE = 'Product' 
										 ) ct 
									where rn=1
								) PhotoIdColor on pe.ProductId=PhotoIdColor.ProductId

                     left join (
									select ProductId, PhotoId PhotoIdNoColor 
									from (
											SELECT ph.[ObjId] ProductId, ph.PhotoId, Row_Number() over (PARTITION  by ph.[ObjId] ORDER BY ph.main DESC ,ph.[PhotoSortOrder], ph.[PhotoId]) rn 
											FROM [Catalog].[Photo] ph	
											WHERE TYPE = 'Product' 
										 ) ct 
									where rn=1
								) PhotoIdNoColor on pe.ProductId=PhotoIdNoColor.ProductId

                     left join (
									select pv.ProductID, CASE WHEN COUNT(pv.ProductVideoID) > 0 THEN 1	ELSE 0 END videosAvailable 
									FROM [Catalog].[ProductVideo] pv 
									group by pv.ProductID
								) videosAvailable on pe.ProductId=videosAvailable.ProductId

                     left join (
									select o.ProductID,Max(o.Amount) maxAvailable  FROM [Catalog].Offer o group by o.ProductID
								) maxAvailable on pe.ProductId=maxAvailable.ProductId

                     left join (
									select o.ProductID, CASE WHEN MAX(o.price) - MIN(o.price) > 0 THEN 1 ELSE 0 END notSamePrices  
									FROM [Catalog].Offer o 
									Inner Join [Catalog].Product On Product.ProductId = o.ProductID 
									where o.price > 0 AND (@OnlyAvailable = 0 OR o.amount > 0 OR AllowPreOrder = 1) 
									group by o.ProductID
								) notSamePrices on pe.ProductId=notSamePrices.ProductId

                     left join (
									select o.ProductID, MIN(o.Price) minPrice, MAX(o.Price) maxPrice
									FROM [Catalog].Offer o 
									Inner Join [Catalog].Product On Product.ProductId = o.ProductID 
									where o.price > 0 AND (@OnlyAvailable = 0 OR o.amount > 0 OR AllowPreOrder = 1)  
									group by o.ProductID
								) minMaxPrice on pe.ProductId=minMaxPrice.ProductId

                     
					 left join (
									select ProductId, OfferID, colorId 
									from (
											select o.ProductID,o.OfferID, o.colorId, Row_Number() over (PARTITION  by o.OfferID ORDER BY o.OfferID) rn  
											FROM [Catalog].Offer o where o.Main = 1 
										 )ct 
									where rn=1
								) offerId on pe.ProductId=offerId.ProductId

                     left join (
									select EntityId ProductID,count(ReviewId) comments  
									FROM CMS.Review  
									where (Checked = 1 OR @ModerateReviews = 0) 
									group by EntityId
								) comments on pe.ProductId=comments.ProductId

                     left join (
									select pg.ProductID, CASE WHEN COUNT(pg.ProductID) > 0 THEN 1 ELSE 0 END gifts 
									FROM [Catalog].[ProductGifts] pg 
									INNER JOIN Catalog.Offer on pg.GiftOfferId = Offer.OfferId 
									INNER JOIN Catalog.Product on Offer.ProductId = Product.ProductId 
									WHERE Offer.Amount > ISNULL(Product.MinAmount, 0) and Enabled = 1 
									group by pg.ProductID
								) gifts on pe.ProductId=gifts.ProductId

                     inner join Catalog.Product p on p.ProductID = pe.ProductID
                     inner join Catalog.Currency c ON p.CurrencyId = c.CurrencyId
        )
            AS tempTable
        ON tempTable.ProductId = ProductExt.ProductId
END

GO--
ALTER FUNCTION [Settings].[SPLIT_STRING](
    @string nvarchar(max),
    @separator varchar(10))
    RETURNS @returnList TABLE
                        (
                            [value] [nvarchar](500)
                        )
    AS
    BEGIN
        DECLARE @name nvarchar(max);
        DECLARE @pos int;

        WHILE CHARINDEX(@separator, @string) > 0
            BEGIN
                SELECT @pos = CHARINDEX(@separator, @string);
                SELECT @name = SUBSTRING(@string, 1, @pos - 1);
                INSERT INTO @returnList
                SELECT @name;
                SELECT @string = SUBSTRING(@string, @pos + LEN(@separator), LEN(@string) - @pos);
            END;

        INSERT INTO @returnList
        SELECT @string;

        RETURN;
    END

GO--
ALTER FUNCTION [Settings].[SPLIT_INT](
    @string nvarchar(max),
    @separator varchar(10))
    RETURNS @returnList TABLE
                        (
                            [value] [int]
                        )
    AS
    BEGIN
        DECLARE @name nvarchar(max);
        DECLARE @pos int;

        WHILE CHARINDEX(@separator, @string) > 0
            BEGIN
                SELECT @pos = CHARINDEX(@separator, @string);
                SELECT @name = SUBSTRING(@string, 1, @pos - 1);
                INSERT INTO @returnList
                SELECT convert(int, @name);
                SELECT @string = SUBSTRING(@string, @pos + LEN(@separator), LEN(@string) - @pos);
            END;

        INSERT INTO @returnList
        SELECT convert(int, @string);

        RETURN;
    END

GO--
IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'Obscuring' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ADD Obscuring INT NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'Obscuring' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    UPDATE [CMS].[Carousel]
    SET Obscuring = 0
    WHERE Obscuring IS NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'Obscuring' AND object_id = OBJECT_ID(N'[CMS].[Carousel]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ALTER COLUMN Obscuring INT NOT NULL
END

GO--
IF EXISTS (SELECT *
           FROM sys.columns
           WHERE name = N'settingValue'
             AND object_id = OBJECT_ID(N'[Settings].[InternalSettings]')
             AND max_length = 100)
    BEGIN
        ALTER TABLE [Settings].[InternalSettings]
            ALTER COLUMN [settingValue] NVARCHAR(255)
    END

GO--
IF NOT EXISTS (SELECT *
               FROM sys.objects
               WHERE object_id = OBJECT_ID(N'[Settings].[sp_AddUpdateInternalSetting]')
                 AND type in (N'P', N'PC'))
    BEGIN
        EXEC dbo.sp_executesql @statement = N'CREATE PROCEDURE [Settings].[sp_AddUpdateInternalSetting] AS'
    END

GO--
ALTER PROCEDURE [Settings].[sp_AddUpdateInternalSetting] @SettingKey nvarchar(50),
                                                         @SettingValue nvarchar(255)
AS
BEGIN
    IF NOT EXISTS (SELECT TOP (1) 1
                   FROM [Settings].[InternalSettings]
                   WHERE settingKey = @SettingKey)
        BEGIN
            INSERT INTO [Settings].[InternalSettings] (settingKey, settingValue)
            VALUES (@SettingKey, @SettingValue);
        END
    ELSE
        BEGIN
            UPDATE [Settings].[InternalSettings]
            SET settingValue=@SettingValue
            WHERE settingKey = @SettingKey
        END
END

GO--
EXEC [Settings].[sp_AddUpdateInternalSetting] 'BasePlatformUrl', 'https://pay.advantshop.net'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'DomainServiceUrl', 'https://domain.on-advantshop.net/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'AccountPlatformUrl', 'https://www.advantshop.net'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'AccountPlatformNotSecureUrl', 'http://www.advantshop.net'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'CdnFontsUrl', 'https://fonts.advstatic.ru/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'CdnDesignUrl', 'https://tpl.advstatic.ru/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'PaymentTBankRegistrationServiceUrl', 'https://tbank.advantshop.tech'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YandexOAuth', 'https://oauth.yandex.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'LoginYandexOAuth', 'https://login.yandex.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'VkOAuth', 'https://oauth.vk.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'VkIdOAuth', 'https://id.vk.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'OkOAuth', 'https://connect.ok.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'MailOAuth', 'https://oauth.mail.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GoogleOAuth', 'https://accounts.google.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'AdvantshopOAuth', 'https://passport.advantshop.net'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'VkExternalApi', 'https://api.vk.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'OkExternalApi', 'https://api.ok.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GoogleExternalApi', 'https://www.googleapis.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'FacebookExternalApi', 'https://graph.facebook.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'FacebookSocialMedia', 'https://www.facebook.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'CdnImagesUrl', 'https://img.advstatic.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'RedirectServiceUrl', 'https://go.advantshop.net'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiServiceUrl', 'https://modules.advantshop.net'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'PushServiceeUrl', 'https://push.advsrvone.pw'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YandexMapsExternalApi', 'https://api-maps.yandex.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GoogleMapsExternalApi', 'https://maps.googleapis.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YandexDeliveryExternalApi', 'https://delivery.yandex.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'IntegrationCdekExternalApi', 'https://integration.cdek.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'OzonSellerExternalApi', 'https://cb-api.ozonru.me'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TelegramExternalApi', 'https://api.telegram.org'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'MangoExternalApi', 'https://app.mango-office.ru/vpbx'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TelphinExternalApi', 'https://apiproxy.telphin.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ZadarmaExternalApi', 'https://api.novofon.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GoogleAnalyticsExternalApi', 'https://www.google-analytics.com/collect'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YandexSpellerExternalApi', 'https://speller.yandex.net/services/spellservice.json'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'WhatsAppSocialMedia', 'https://wa.me'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ViberSocialMedia', 'https://viber.click'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TelegramSocialMedia', 'https://t.me'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ViberChatSocialMedia', 'viber://chat'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'SkypeChatSocialMedia', 'Skype:'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'VkSocialMedia', 'https://vk.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'MetaMessengerSocialMedia', 'https://m.me'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'AppleSocialMedia', 'https://www.apple.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YouTubeSocialMedia', 'https://www.youtube.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ShortYouTubeSocialMedia', 'https://youtu.be'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'OkSocialMedia', 'https://ok.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'InstagramSocialMedia', 'https://www.instagram.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GoogleSupportSocialMedia', 'https://support.google.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TwitterSocialMedia', 'https://www.x.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YandexZenSocialMedia', 'https://zen.yandex.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'RutubeSocialMedia', 'https://rutube.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YandexSocialMedia', 'https://yandex.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'OnPayPaymentMethod', 'https://secure.onpay.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'PayAnyWayPaymentMethod', 'https://www.moneta.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'AvangardPaymentMethod', 'https://pay.avangard.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'IntellectMoneyPaymentMethod', 'https://merchant.intellectmoney.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'Interkassa2PaymentMethod', 'https://sci.interkassa.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'InvoiceBoxPaymentMethod', 'https://go.invoicebox.ru/module_inbox_auto.u'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'LiqPayPaymentMethod', 'https://www.liqpay.ua/?do=clickNbuy'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'MasterBankPaymentMethod', 'https://pay.masterbank.ru/acquiring'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'PaymasterPaymentMethod', 'https://paymaster.ru/payment/init'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'PlatronPaymentMethod', 'https://platron.ru/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'QiwiPaymentMethod', 'https://api.qiwi.com/partner/bill/v1/bills/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'RsbCreditPaymentMethod', 'https://www.onlinecredit.ru/sites/anketa/minipotreb.php'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'WalletOneCheckoutPaymentMethod', 'https://wl.walletone.com/checkout/checkout/Index'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'WebMoneyPaymentMethod', 'https://merchant.webmoney.ru/lmi/payment.asp'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TestAssistPaymentMethod', 'https://test.paysecure.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'WorkingAssistPaymentMethod', 'https://payments000.paysecure.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'CheckoutBePaidPaymentMethod', 'https://checkout.bepaid.by/ctp/api/checkouts'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GatewayBePaidPaymentMethod', 'https://gateway.bepaid.by/transactions'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiBePaidPaymentMethod', 'https://api.bepaid.by/beyag/payments'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TestModeAlfabankPaymentMethod', 'https://alfa.rbsuat.com/payment/rest/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'Test2ModeAlfabankPaymentMethod', 'https://tws.egopay.ru/api/ab/rest/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'KzAlfabankPaymentMethod', 'https://pay.alfabank.kz/payment/rest/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'RuAlfabankPaymentMethod', 'https://pay.alfabank.ru/payment/rest/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'RuNewAlfabankPaymentMethod', 'https://payment.alfabank.ru/payment/rest/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'Ru2AlfabankPaymentMethod', 'https://ecom.alfabank.ru/api/rest/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'AnketaAlfabankPaymentMethod', 'https://anketa.alfabank.ru/alfaform-pos/endpoint'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'CreditTinkoffPaymentMethod', 'https://forma.tinkoff.ru/api/partners/v2'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GeneralTinkoffPaymentMethod', 'https://securepay.tinkoff.ru/v2/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'PayModulbankPaymentMethod', 'https://pay.modulbank.ru/pay'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiModulbankPaymentMethod', 'https://pay.modulbank.ru/api/v1/transaction'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'SandboxMokkaPaymentMethod', 'https://backend.demo.revoup.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'BaseMokkaPaymentMethod', 'https://r.revo.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TestNetPayPaymentMethod', 'https://demo.net2pay.ru/billingService/paypage'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'WorkingNetPayPaymentMethod', 'https://my.net2pay.ru/billingService/paypage'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TestPSBankPaymentMethod', 'https://test.3ds.payment.ru/cgi-bin/cgi_link'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GeneralPSBankPaymentMethod', 'https://3ds.payment.ru/cgi-bin/cgi_link'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'QiwiPayOnlinePaymentMethod', 'https://secure.payonlinesystem.com/ru/payment/select/qiwi/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'WebMoneyPayOnlinePaymentMethod', 'https://secure.payonlinesystem.com/ru/payment/select/paymaster/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YandexMoneyPayOnlinePaymentMethod', 'https://secure.payonlinesystem.com/ru/payment/select/yandexmoney/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'CreditCardENPayOnlinePaymentMethod', 'https://secure.payonlinesystem.com/en/payment/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'CreditCardRUPayOnlinePaymentMethod', 'https://secure.payonlinesystem.com/ru/payment/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'SelectPayOnlinePaymentMethod', 'https://secure.payonlinesystem.com/ru/payment/select/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TestPayPalExpressCheckoutPaymentMethod', 'https://www.sandbox.paypal.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GeneralPayPalExpressCheckoutPaymentMethod', 'https://www.paypal.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TestApiPayPalExpressCheckoutPaymentMethod', 'https://api-3t.sandbox.paypal.com/nvp'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GeneralApiPayPalExpressCheckoutPaymentMethod', 'https://api-3t.paypal.com/nvp'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'CheckoutRbkmoney2PaymentMethod', 'https://checkout.rbk.money'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiRbkmoney2PaymentMethod', 'https://api.rbk.money/v1/processing/invoices'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'RuRobokassaPaymentMethod', 'https://auth.robokassa.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'KzRobokassaPaymentMethod', 'https://auth.robokassa.kz'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TestSberBankAcquiringPaymentMethod', 'https://proxy.advstatic.ru/ecomtest.sberbank.ru/ecomm/gw/partner/api/v1/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GeneralSberBankAcquiringPaymentMethod', 'https://proxy.advstatic.ru/ecommerce.sberbank.ru/ecomm/gw/partner/api/v1/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TestWebPayPaymentMethod', 'https://securesandbox.webpay.by'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GeneralWebPayPaymentMethod', 'https://payment.webpay.by'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ScriptYandexPaymentMethod', 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GeneralYandexPaymentMethod', 'https://yoomoney.ru/eshop.xml'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiYandexPaymentMethod', 'https://api.yookassa.ru/v3'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'OtpravkaPochtaShippingMethod', 'https://otpravka.pochta.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TrackingPochtaShippingMethod', 'https://tracking.pochta.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YandexDostavkaShippingMethod', 'https://dostavka.yandex.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'DDeliveryShippingMethod', 'https://api.saferoute.ru/api/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'FivePostShippingMethod', 'https://api-omni.x5.ru/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'HermesShippingMethod', 'https://ci-delivery-api.hermesrussia.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'LPostShippingMethod', 'https://api.l-post.ru/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'MeasoftShippingMethod', 'https://home.courierexe.ru/api'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'NovaPoshtaShippingMethod', 'https://api.novaposhta.ua/v2.0/json/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'PecShippingMethod', 'https://kabinet.pecom.ru/api/v1'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'PecEasywayShippingMethod', 'https://lk.easyway.ru/EasyWay/hs/EWA_API/v2'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'PickPointShippingMethod', 'https://e-solution.pickpoint.ru/api/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'SberlogisticShippingMethod', 'https://module-gateway.sblogistica.ru/api/v1'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ShiptorShippingMethod', 'https://checkout.shiptor.ru/api'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TestApiShipShippingMethod', 'http://api.dev.apiship.ru/v1/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GeneralApiShipShippingMethod', 'https://api.apiship.ru/v1/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GeographyDpdShippingMethod', 'https://ws.dpd.ru/services/geography2'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GeographyTestDpdShippingMethod', 'https://wstest.dpd.ru/services/geography2'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'CalculatorDpdShippingMethod', 'https://ws.dpd.ru/services/calculator2'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'CalculatorTestDpdShippingMethod', 'https://wstest.dpd.ru/services/calculator2'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiOzonShippingMethod', 'https://xapi.ozon.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'RocketOzonShippingMethod', 'https://rocket.ozon.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiRussianPostShippingMethod', 'https://otpravka-api.pochta.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TariffRussianPostShippingMethod', 'https://tariff.pochta.ru/v2'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TrackingRussianPostShippingMethod', 'https://tracking.russianpost.ru/rtm34'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiSdekShippingMethod', 'https://proxy.advstatic.ru/api.cdek.ru/v2'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GetCitySdekShippingMethod', 'https://proxy.advstatic.ru/integration.cdek.ru/v1/location/cities/json'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'B2BYandexShippingMethod', 'https://b2b-authproxy.taxi.yandex.net/api/b2b/platform/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiYandexShippingMethod', 'https://api.delivery.yandex.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'BePaidDocs', 'https://docs.bepaid.by'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'FacebookDocs', 'https://developers.facebook.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YandexDocs', 'https://developer.tech.yandex.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiServiceNotSecureUrl', 'http://modules.advantshop.net'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'VimeoImageCdnSocialMedia', 'http://i.vimeocdn.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YouTubeImageCdnSocialMedia', '//img.youtube.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'SipuniExternalApi', 'http://sipuni.com'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ActivityServiceUrl', 'http://activity2.advantshop.net'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'UaAlfabankPaymentMethod', 'http://www.alfabank.ua'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'CbrExternalApi', 'http://www.cbr.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ScreenshotServiceUrl', 'http://scr.advsrvone.pw:4343'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiDeBoxberryShippingMethod', 'http://api.boxberry.de'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ApiRuBoxberryShippingMethod', 'http://api.boxberry.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'EdostShippingMethod', 'http://www.edost.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'EmsPostShippingMethod', 'http://emspost.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'GrastinShippingMethod', 'http://api.grastin.ru'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'UspsShippingMethod', 'http://production.shippingapis.com'

GO--
DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'Admin.Settings.Mobile.HeaderStyleMinimalistic';

GO--
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[CMS].[CarouselText]') AND type in (N'U'))
BEGIN
    CREATE TABLE [CMS].[CarouselText] (
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [CarouselId] [int] NOT NULL,
        [Title] [nvarchar](150) NOT NULL,
        [TitleSize] [int] NOT NULL,
        [Text] [nvarchar](MAX) NOT NULL,
        [TextSize] [int] NOT NULL,
        [ColorCode] [nvarchar](10) NOT NULL,
        [Position] [nvarchar](150) NOT NULL,
        [Animation] [nvarchar](150) NOT NULL,
        [Enabled] [bit] NOT NULL,
        CONSTRAINT [PK_CarouselText] PRIMARY KEY CLUSTERED
        (
            [Id] ASC
        ) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
        CONSTRAINT [FK_CarouselText_Carousel] FOREIGN KEY ([CarouselId]) REFERENCES [CMS].[Carousel]([CarouselID]) ON DELETE CASCADE
    ) ON [PRIMARY];
END

GO--
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[CMS].[CarouselButton]') AND type in (N'U'))
BEGIN
    CREATE TABLE [CMS].[CarouselButton] (
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [CarouselId] [int] NOT NULL,
        [Text] [nvarchar](150) NOT NULL,
        [URL] [nvarchar](150) NOT NULL,
        [Blank] [bit] NOT NULL,
        [ButtonColorCode] [nvarchar](10) NOT NULL,
        [TextColorCode] [nvarchar](10) NOT NULL,
        [Enabled] [bit] NOT NULL,
        CONSTRAINT [PK_CarouselButton] PRIMARY KEY CLUSTERED
        (
            [Id] ASC
        ) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
        CONSTRAINT [FK_CarouselButton_Carousel] FOREIGN KEY ([CarouselId]) REFERENCES [CMS].[Carousel]([CarouselID]) ON DELETE CASCADE
    ) ON [PRIMARY];
END

GO--
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[CMS].[CarouselVideo]') AND type in (N'U'))
BEGIN
    CREATE TABLE [CMS].[CarouselVideo] (
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [CarouselId] [int] NOT NULL,
        [VideoName] [nvarchar](255) NOT NULL,
		[ModifiedDate] [datetime] NOT NULL,
		[Description] [nvarchar](MAX) NULL,
        [OriginName] [nvarchar](255) NULL,
        CONSTRAINT [PK_CarouselVideo] PRIMARY KEY CLUSTERED
        (
            [Id] ASC
        ) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
        CONSTRAINT [FK_CarouselVideo_Carousel] FOREIGN KEY ([CarouselId]) REFERENCES [CMS].[Carousel]([CarouselID]) ON DELETE CASCADE
    ) ON [PRIMARY];
END

GO--

IF NOT EXISTS(SELECT *
              FROM [dbo].[Migration]
              WHERE Name = 'UpdateRootCategoryName')
    BEGIN
        DECLARE @ROOT_CATEGORY_NAME NVARCHAR(MAX) = (SELECT TOP 1 [ResourceValue] 
                                                     FROM [Settings].[Localization]
                                                     WHERE [ResourceKey] = 'Catalog.MenuCatalog.AllProductsTitle' 
                                                       AND [LanguageId] = 1)
        
        IF (@ROOT_CATEGORY_NAME <> N'Каталог товаров')
            BEGIN
                UPDATE [Catalog].[Category]
                SET [Name] = @ROOT_CATEGORY_NAME
                WHERE [CategoryID] = 0
            END

        INSERT INTO [dbo].[Migration] ([Name], [Date])
        VALUES ('UpdateRootCategoryName', GETDATE())
    END

GO--
IF NOT EXISTS (SELECT *
               FROM sys.columns
               WHERE (name = N'IsConverted')
                 AND object_id = OBJECT_ID(N'[Catalog].[Photo]'))
    BEGIN
        ALTER TABLE [Catalog].[Photo]
            ADD [IsConverted] [BIT] NULL
    END

GO--
IF EXISTS (SELECT *
           FROM [Catalog].[Photo]
           WHERE [IsConverted] IS NULL)
    BEGIN
        UPDATE [Catalog].[Photo]
        SET [IsConverted] = 0
        WHERE [IsConverted] IS NULL
    END

GO--
IF EXISTS (SELECT *
           FROM sys.columns
           WHERE (name = N'IsConverted')
             AND is_nullable = 1
             AND object_id = OBJECT_ID(N'[Catalog].[Photo]'))
    BEGIN
        ALTER TABLE [Catalog].[Photo]
            ALTER COLUMN [IsConverted] [BIT] NOT NULL
    END

GO--
IF NOT EXISTS (SELECT *
               FROM sys.indexes i
                        JOIN sys.index_columns ic
                             ON i.object_id = ic.object_id AND i.index_id = ic.index_id
                        JOIN sys.columns c
                             ON ic.object_id = c.object_id AND ic.column_id = c.column_id
               WHERE i.object_id = OBJECT_ID('[Catalog].[Photo]')
                 AND c.name = 'IsConverted'
                 AND i.name = 'Photo_IsConverted')
    BEGIN
        CREATE INDEX Photo_IsConverted ON [Catalog].[Photo] (IsConverted);
    END

GO--
IF EXISTS (SELECT *
           FROM sys.objects
           WHERE object_id = OBJECT_ID(N'[Catalog].[sp_AddPhoto]')
             AND type = 'P')
    BEGIN
        DROP PROCEDURE [Catalog].[sp_AddPhoto]
    END

GO--
IF EXISTS (SELECT *
           FROM sys.objects
           WHERE object_id = OBJECT_ID(N'[Catalog].[sp_SetProductMainPhoto]')
             AND type = 'P')
    BEGIN
        DROP PROCEDURE [Catalog].[sp_SetProductMainPhoto]
    END

GO--
IF EXISTS (SELECT *
           FROM sys.objects
           WHERE object_id = OBJECT_ID(N'[Catalog].[sp_DeletePhoto]')
             AND type = 'P')
    BEGIN
        DROP PROCEDURE [Catalog].[sp_DeletePhoto]
    END

GO--
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ImageStackUrl', 'https://imgstack.advsrvone.pw'

GO--
EXEC [Settings].[sp_AddUpdateInternalSetting] 'TestByModeAlfabankPaymentMethod', 'https://abby.rbsuat.com/payment/rest/'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'ByAlfabankPaymentMethod', 'https://ecom.alfabank.by/payment/rest/'

GO--
IF NOT EXISTS (
    SELECT 1 
    FROM [dbo].[Modules] m
    JOIN [Customers].[CustomerRoleAction] cra ON m.ModuleStringID = cra.RoleActionKey
    )
        BEGIN
            DECLARE @CustomerIDs TABLE (CustomerID uniqueidentifier)
            INSERT INTO @CustomerIDs
            SELECT DISTINCT CustomerID FROM [Customers].[CustomerRoleAction]
    
            DECLARE @CustomersWithModules TABLE (CustomerID uniqueidentifier)
            INSERT INTO @CustomersWithModules
            SELECT CustomerID
            FROM [Customers].[CustomerRoleAction]
            WHERE RoleActionKey = 'Modules'
    
            INSERT INTO [Customers].[CustomerRoleAction] (CustomerID, RoleActionKey, Enabled)
            SELECT
                c.CustomerID,
                m.ModuleStringID,
                1 AS Enabled
            FROM @CustomersWithModules c
                CROSS JOIN [dbo].[Modules] m
            WHERE NOT EXISTS (
                SELECT 1
                FROM [Customers].[CustomerRoleAction] cra
                WHERE cra.CustomerID = c.CustomerID
                AND cra.RoleActionKey = m.ModuleStringID
                )
        END

GO--
IF NOT EXISTS (SELECT *
               FROM sys.objects
               WHERE object_id = OBJECT_ID(N'[dbo].[CriticalCss]')
                 AND type in (N'U'))
    BEGIN
        CREATE TABLE [dbo].[CriticalCss]
        (
            [Id]         [int] IDENTITY (1,1) NOT NULL,
            [Key]        [nvarchar](128)      NOT NULL,
            [Value]      [nvarchar](MAX)      NULL,
            [Device]     [nvarchar](128)      NOT NULL,
            [Template]   [nvarchar](128)      NOT NULL,
            [NeedUpdate] [nvarchar](128)      NOT NULL,
            [UpdateAt]   [datetime]           NOT NULL,
            CONSTRAINT [PK_CriticalCss] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (
                PAD_INDEX = OFF,
                STATISTICS_NORECOMPUTE = OFF,
                IGNORE_DUP_KEY = OFF,
                ALLOW_ROW_LOCKS = ON,
                ALLOW_PAGE_LOCKS = ON
            ) ON [PRIMARY]
        ) ON [PRIMARY]
    END

GO--
EXEC [Settings].[sp_AddUpdateInternalSetting] 'YahontUrl', 'https://yahont.advsrvone.pw'

GO--
IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'PositionHorizontal' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
AND EXISTS (SELECT * FROM sys.columns WHERE name = N'Position' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
	EXEC sp_rename 
		@objname = 'CMS.CarouselText.Position', 
		@newname = 'PositionHorizontal', 
		@objtype = 'COLUMN';
END

GO--
IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'PositionVertical' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    ADD PositionVertical [nvarchar](150) NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'PositionVertical' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    UPDATE [CMS].[CarouselText]
    SET PositionVertical = 'Center'
    WHERE PositionVertical IS NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'PositionVertical' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    ALTER COLUMN PositionVertical [nvarchar](150) NOT NULL
END

GO--
IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'IsVideo' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ADD IsVideo bit NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'IsVideo' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    UPDATE [CMS].[Carousel]
    SET IsVideo = 0
    WHERE IsVideo IS NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'IsVideo' AND object_id = OBJECT_ID(N'[CMS].[Carousel]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ALTER COLUMN IsVideo bit NOT NULL
END

GO--
ALTER PROCEDURE [CMS].[sp_InsertCarousel]
    @URL nvarchar(max),
    @SortOrder int,
    @Enabled bit,
    @DisplayInOneColumn bit,
    @DisplayInTwoColumns bit,
    @DisplayInMobile bit,
    @Blank bit,
    @Obscuring int,
    @IsVideo bit
AS
BEGIN
	INSERT INTO [CMS].[Carousel]
        (URL
        ,SortOrder
        ,Enabled
        ,DisplayInOneColumn
        ,DisplayInTwoColumns
        ,DisplayInMobile
        ,Blank
        ,Obscuring
        ,IsVideo)
     VALUES
        (@URL
        ,@SortOrder			  
        ,@Enabled
        ,@DisplayInOneColumn
        ,@DisplayInTwoColumns
        ,@DisplayInMobile
        ,@Blank
        ,@Obscuring
        ,@IsVideo)
	 Select SCOPE_IDENTITY()
END

GO--
ALTER PROCEDURE [CMS].[sp_UpdateCarousel]
	@CarouselID int,	
	@URL nvarchar(max),
	@SortOrder int,
	@Enabled bit,
	@DisplayInOneColumn bit,
	@DisplayInTwoColumns bit,
	@DisplayInMobile bit,
	@Blank bit,
	@Obscuring int,
	@IsVideo bit
AS
BEGIN
    UPDATE [CMS].[Carousel] 
    SET 
        URL = @URL, 
        SortOrder = @SortOrder, 
        Enabled = @Enabled,
        DisplayInOneColumn = @DisplayInOneColumn,
        DisplayInTwoColumns = @DisplayInTwoColumns,
        DisplayInMobile = @DisplayInMobile,
        Blank = @Blank,
        Obscuring = @Obscuring,
        IsVideo = @IsVideo
    WHERE CarouselID = @CarouselID
END

GO--
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Catalog].[CouponProductOffers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Catalog].[CouponProductOffers](
        [CouponID] [int] NOT NULL,
        [OfferID] [int] NOT NULL,
    CONSTRAINT [PK_Catalog.CouponProductOffers] PRIMARY KEY CLUSTERED 
    (
        [CouponID] ASC,
        [OfferID] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]
    ) ON [PRIMARY]
END

GO--
IF NOT EXISTS (SELECT 1 
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE CONSTRAINT_NAME='FK_CouponProductOffers_Coupon')
BEGIN
    ALTER TABLE [Catalog].[CouponProductOffers]  WITH CHECK ADD  CONSTRAINT [FK_CouponProductOffers_Coupon] FOREIGN KEY([CouponID])
    REFERENCES [Catalog].[Coupon] ([CouponID])
    ON DELETE CASCADE
END

GO--
IF NOT EXISTS (SELECT 1 
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE CONSTRAINT_NAME='FK_CouponProductOffers_Offer')
BEGIN
    ALTER TABLE [Catalog].[CouponProductOffers]  WITH CHECK ADD  CONSTRAINT [FK_CouponProductOffers_Offer] FOREIGN KEY([OfferID])
    REFERENCES [Catalog].[Offer] ([OfferID])
    ON DELETE CASCADE
END

GO--
ALTER PROCEDURE [Catalog].[sp_IsCouponAppliedToProduct]  @CouponID int, @ProductId int, @OfferId int = NULL  AS 
BEGIN  
	Declare @categoriesExists bit;  
	Declare @productsExists bit;  
	Declare @offersExists bit;  
	Declare @Count bit = 0;
	
	IF Exists (SELECT 1 From Catalog.CouponCategories Where CouponID = @CouponID)
		SET @categoriesExists = 1;
	ELSE
		SET @categoriesExists = 0;

	IF Exists (SELECT 1 From Catalog.CouponProducts Where CouponID = @CouponID) 
		SET @productsExists = 1;
	ELSE
		SET @productsExists = 0;

	IF Exists (SELECT 1 From Catalog.CouponProductOffers Where CouponID = @CouponID)  
		SET @offersExists = 1;
	ELSE
		SET @offersExists = 0;

	IF (@categoriesExists = 0 AND @productsExists = 0 AND @offersExists = 0)  
		 SET @Count = 1 
	ELSE IF (@productsExists = 1)  
	BEGIN
		IF Exists (Select 1 From Catalog.CouponProducts Where CouponID = @CouponID and ProductID = @ProductID)
			SET @Count = 1
		ELSE
			SET @Count = 0
	END

	IF (@Count = 0 AND @offersExists = 1)  
	BEGIN
		IF Exists (Select 1 From Catalog.CouponProductOffers Where CouponID = @CouponID and OfferId = @OfferId)
			SET @Count = 1
		ELSE
			SET @Count = 0
	END
	  
	IF (@Count = 0 AND @categoriesExists = 1)  
	BEGIN   
		IF Exists (Select 1
					From Catalog.CouponCategories 
					Inner Join Catalog.ProductCategories on CouponCategories.CategoryID = ProductCategories.CategoryID    
					Where CouponID = @CouponID and ProductID = @ProductId)
			SET @Count = 1
		ELSE
			SET @Count = 0
	END
	
	Select @Count
END

GO--
IF NOT EXISTS(SELECT 1
              FROM sys.columns
              WHERE (name = N'BotName') AND object_id = OBJECT_ID(N'[Customers].[TelegramMessage]'))
BEGIN
    ALTER TABLE Customers.TelegramMessage ADD
        BotName nvarchar(MAX) NULL,
        UpdateId int NULL
END

GO--
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Catalog].[CouponShippingMethod]') AND type in (N'U'))
BEGIN
	CREATE TABLE [Catalog].[CouponShippingMethod](
		[CouponId] [int] NOT NULL,
		[ShippingMethodId] [int] NOT NULL,
	 CONSTRAINT [PK_CouponShippingMethod] PRIMARY KEY CLUSTERED 
	(
		[CouponId] ASC,
		[ShippingMethodId] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]
	) ON [PRIMARY]
END

GO--
IF NOT EXISTS (SELECT 1 
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE CONSTRAINT_NAME='FK_CouponShippingMethod_Coupon')
BEGIN
	ALTER TABLE [Catalog].[CouponShippingMethod]  WITH CHECK ADD  CONSTRAINT [FK_CouponShippingMethod_Coupon] FOREIGN KEY([CouponId])
	REFERENCES [Catalog].[Coupon] ([CouponID])
	ON DELETE CASCADE
END

GO--
IF NOT EXISTS(SELECT 1
              FROM sys.columns
              WHERE (name = N'IsMarketPartner') AND object_id = OBJECT_ID(N'[Shipping].[YandexPickupPoint]'))
BEGIN
	DELETE FROM [Shipping].[YandexPickupPoint]

    ALTER TABLE Shipping.YandexPickupPoint ADD
        [IsMarketPartner] [bit] NOT NULL
    
	ALTER TABLE Shipping.YandexPickupPoint ADD
        [IsDarkStore] [bit] NOT NULL
    
	ALTER TABLE Shipping.YandexPickupPoint ADD
        [IsYandexBranded] [bit] NOT NULL
END




IF NOT EXISTS(SELECT 1
              FROM sys.columns
              WHERE (name = N'IgnoreMinimalPriceForOrderAndDelivery') AND object_id = OBJECT_ID(N'[Catalog].[Coupon]'))
BEGIN
    ALTER TABLE Catalog.Coupon ADD
        IgnoreMinimalPriceForOrderAndDelivery bit NULL
END

GO--
ALTER PROCEDURE [Order].[sp_GetCustomerOrderHistory]
    @CustomerID uniqueidentifier
AS
BEGIN
    SELECT
        o.OrderID,
        o.Number,
        o.OrderDiscount,
        OrderStatus.StatusName,
        o.PreviousStatus,
        OrderStatus.OrderStatusID,
        o.Sum,
        o.OrderDate,
        o.PaymentDate,
        o.PaymentMethodName,
        o.ShippingMethodName,
        ShippingMethod.Name as ShippingMethod,
        o.PaymentMethodID,
        o.ManagerID,
        o.TrackNumber,
        o.DeliveryDate,
        (Customer.FirstName + ' ' + Customer.LastName) as ManagerName,
        OrderCurrency.CurrencyCode,
        OrderCurrency.CurrencyNumCode,
        OrderCurrency.CurrencyValue,
        OrderCurrency.CurrencySymbol,
        OrderCurrency.IsCodeBefore,
		OrderPickPoint.PickPointAddress
    FROM [Order].[Order] o
        LEFT JOIN [Order].OrderStatus ON o.OrderStatusID = OrderStatus.OrderStatusID
        INNER JOIN [Order].OrderCurrency ON o.OrderID = OrderCurrency.OrderID
        LEFT JOIN [Order].ShippingMethod ON o.ShippingMethodID = ShippingMethod.ShippingMethodID
		LEFT JOIN [Order].OrderPickPoint ON o.OrderID = OrderPickPoint.OrderId
        INNER JOIN [Order].OrderCustomer ON o.OrderID = OrderCustomer.OrderID
        LEFT JOIN Customers.Managers ON o.ManagerId = Managers.ManagerId
        LEFT JOIN Customers.Customer ON Managers.CustomerId = Customer.CustomerID
    WHERE OrderCustomer.CustomerID = @CustomerID and IsDraft = 0
    ORDER BY o.OrderDate DESC
END

GO--
IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'Alignment' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    ADD Alignment [nvarchar](150) NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'Alignment' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    UPDATE [CMS].[CarouselText]
    SET Alignment = 'Center'
    WHERE Alignment IS NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'Alignment' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    ALTER COLUMN Alignment [nvarchar](150) NOT NULL
END

GO--
IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'BlockSize' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    ADD BlockSize int NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'BlockSize' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    UPDATE [CMS].[CarouselText]
    SET BlockSize = 30
    WHERE BlockSize IS NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'BlockSize' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    ALTER COLUMN BlockSize int NOT NULL
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsCatalog.Product.OptionUsersWhoOrderedThisProduct', 'Если выбрано значение <b>Пользователям, которые заказывали этот товар</b>, то отзыв можно будет оставить, когда заказ с данным товаром будет оплачен и переведен в статус с активной настройкой "Заказ завершен".';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsCatalog.Product.OptionUsersWhoOrderedThisProduct', 'If the value <b>Users, who ordered this product</b> is selected, then the review can be left when the order with this product is paid and transferred to the status with the active setting "Order completed".';
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsCatalog.WhoAllowReviews.HelpLinkReviewsSettings', '<br/><br/>Подробнее о настройках отзывов:<br/><a href="https://www.advantshop.net/help/pages/product-review#1" target="_blank">Как включить добавление отзывов к товарам</a>';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsCatalog.WhoAllowReviews.HelpLinkReviewsSettings', '<br/><br/>More information about review settings:<br/><a href="https://www.advantshop.net/help/pages/product-review#1" target="_blank">How to enable adding reviews to products</a>';
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsCatalog.WhoAllowReviews.HelpLinkOrderStatuses', '<br/><br/>Подробнее о статусах заказов: <br/><a href="https://www.advantshop.net/help/pages/statusy-zakazov#1" target="_blank">Настройка статусов заказа</a>';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsCatalog.WhoAllowReviews.HelpLinkOrderStatuses', '<br/><br/>More information about order statuses: <br/><a href="https://www.advantshop.net/help/pages/statusy-zakazov#1" target="_blank">Order status settings</a>';
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Builder.OptionUsersWhoOrderedThisProduct', 'Если выбрано значение <b>Пользователям, которые заказывали этот товар</b>, то отзыв можно будет оставить, когда заказ с данным товаром будет оплачен и переведен в статус с активной настройкой "Заказ завершен".';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Builder.OptionUsersWhoOrderedThisProduct', 'If the value <b>Users, who ordered this product</b> is selected, then the review can be left when the order with this product is paid and transferred to the status with the active setting "Order completed".';
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Builder.HelpLinkReviewsSettings', '<br/><br/>Подробнее о настройках отзывов:<br/><a href="https://www.advantshop.net/help/pages/product-review#1" target="_blank">Как включить добавление отзывов к товарам</a>';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Builder.HelpLinkReviewsSettings', '<br/><br/>More information about review settings:<br/><a href="https://www.advantshop.net/help/pages/product-review#1" target="_blank">How to enable adding reviews to products</a>';
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Builder.HelpLinkOrderStatuses', '<br/><br/>Подробнее о статусах заказов: <br/><a href="https://www.advantshop.net/help/pages/statusy-zakazov#1" target="_blank">Настройка статусов заказа</a>';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Builder.HelpLinkOrderStatuses', '<br/><br/>More information about order statuses: <br/><a href="https://www.advantshop.net/help/pages/statusy-zakazov#1" target="_blank">Order status settings</a>';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingMethods.DeliveryByZones.MinimalOrderPrice', 'Минимальная сумма заказа (без учета доставки): {0} Вам необходимо приобрести еще товаров на сумму: {1}';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingMethods.DeliveryByZones.MinimalOrderPrice', 'Minimum price to order (excluding shipping): {0} You need to buy more products to the value: {1}';
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Cart.Error.MinimalOrderPrice', 'Минимальная сумма заказа (без учета доставки): {0} Вам необходимо приобрести еще товаров на сумму: {1}';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Cart.Error.MinimalOrderPrice', 'Minimum price to order (excluding shipping): {0} You need to buy more products to the value: {1}';

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'UseStoreColorScheme' AND object_id = OBJECT_ID(N'[CMS].[CarouselButton]'))
BEGIN
    ALTER TABLE [CMS].[CarouselButton]
    ADD UseStoreColorScheme bit NULL
END

GO--

IF EXISTS (SELECT * FROM sys.columns WHERE name = N'UseStoreColorScheme' AND object_id = OBJECT_ID(N'[CMS].[CarouselButton]'))
BEGIN
    UPDATE [CMS].[CarouselButton]
    SET UseStoreColorScheme = 0
    WHERE UseStoreColorScheme IS NULL
END

GO--

IF EXISTS (SELECT * FROM sys.columns WHERE name = N'UseStoreColorScheme' AND object_id = OBJECT_ID(N'[CMS].[CarouselButton]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[CarouselButton]
    ALTER COLUMN UseStoreColorScheme bit NOT NULL
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditCarousel.ButtonUseStoreColorScheme', 'Использовать цветовую схему магазина';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditCarousel.ButtonUseStoreColorScheme', 'Use the store''s color scheme';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.IsNotPaid', 'Не оплачено';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.IsNotPaid', 'Not paid';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.OrderFrom', 'от';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.OrderFrom', 'from';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.DeliveryDate', 'Дата доставки';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.DeliveryDate', 'Delivery date';

GO--


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.CopyTrigger', 'Создать копию триггера';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.CopyTrigger', 'Create a copy of the trigger';


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.TriggeredOnceOrderLeadText', 'Триггер срабатает только 1 раз для связки покупателя и заказа/лида. Все действия выполнятся.<br><br>
Например, вы создали триггер на изменение статуса заказа "В обработке" и поставили галку. Когда статус заказа №123 изменится на "В обработке", то сработает триггер для покупателя, выполнятся действия. Далее сколько бы раз не ставили статус на "В обработке" у заказа №123, триггер больше не сработает для этого покупателя. То есть для данного заказа и покупателя, триггер отрабатывает 1 раз. Это полезно если кто-то сменил статус и вернул обратно, покупателю не отправится повторно письмо/смс.<br> Когда изменится статус заказа №124, 125 и т.д. на "В обработке", то триггер выполнится для покупателя из этого заказа.';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.Coupon', 'Купон';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.Coupon', 'Coupon';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.TriggerHistory.Time', 'Время';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.TriggerHistory.Time', 'Time';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.TriggerHistory.Level', 'Уровень';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.TriggerHistory.Level', 'Level';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.TriggerHistory.EventType', 'Событие';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.TriggerHistory.EventType', 'Event';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.TriggerHistory.Error', 'Ошибка';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.TriggerHistory.Error', 'Error';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.TriggerHistory.Parameters', 'Параметры';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.TriggerHistory.Parameters', 'Parameters';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Triggers.Statistics.Title', 'Статистика триггера "{0}"';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Triggers.Statistics.Title', 'Trigger statistics "{0}"';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Triggers.Statistics', 'Статистика';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Triggers.Statistics', 'Statistic';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Triggers.History', 'История выполнений';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Triggers.History', 'History';

GO--

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[CMS].[CarouselApi_CustomerGroup]') AND type in (N'U'))
BEGIN
    CREATE TABLE [CMS].[CarouselApi_CustomerGroup](
        [CarouselId] [int] NOT NULL,
        [CustomerGroupId] [int] NOT NULL,
    CONSTRAINT [PK_CarouselApi_CustomerGroup] PRIMARY KEY CLUSTERED 
    (
        [CarouselId] ASC,
        [CustomerGroupId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    ) ON [PRIMARY]
END

GO--

IF NOT EXISTS (SELECT 1 
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE CONSTRAINT_NAME='FK_CarouselApi_CustomerGroup_CarouselApi')
BEGIN
    ALTER TABLE [CMS].[CarouselApi_CustomerGroup]  WITH CHECK ADD  CONSTRAINT [FK_CarouselApi_CustomerGroup_CarouselApi] FOREIGN KEY([CarouselId])
    REFERENCES [CMS].[CarouselApi] ([Id])
    ON DELETE CASCADE
END

GO--

IF NOT EXISTS (SELECT 1 
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE CONSTRAINT_NAME='FK_CarouselApi_CustomerGroup_CustomerGroup')
BEGIN
    ALTER TABLE [CMS].[CarouselApi_CustomerGroup]  WITH CHECK ADD  CONSTRAINT [FK_CarouselApi_CustomerGroup_CustomerGroup] FOREIGN KEY([CustomerGroupId])
    REFERENCES [Customers].[CustomerGroup] ([CustomerGroupID])
    ON DELETE CASCADE
END

GO--

DELETE FROM [Settings].[Localization] WHERE [ResourceKey] = 'Admin.Js.AddPropertyValue.Name'
DELETE FROM [Settings].[Localization] WHERE [ResourceKey] = 'Admin.Js.PropertyValues.Name'
DELETE FROM [Settings].[Localization] WHERE [ResourceKey] = 'Admin.Js.PropertyValue.Name'

IF EXISTS(SELECT 1
              FROM sys.columns
              WHERE (name = N'NameOfValue') AND object_id = OBJECT_ID(N'[Catalog].[PropertyValue]'))
    BEGIN
        ALTER TABLE [Catalog].[PropertyValue]
			DROP COLUMN [NameOfValue]
	END

GO--

ALTER PROCEDURE [Catalog].[sp_GetPropertyValuesByPropertyID] @PropertyID INT
AS
BEGIN
	SET NOCOUNT ON;

	SELECT [PropertyValueID]
		,[Property].[PropertyID]
		,[Value]
		,[PropertyValue].[SortOrder]
		,[Property].UseinFilter
		,[Property].UseIndetails
		,[Property].UseInBrief
		,Property.Name AS PropertyName
		,Property.NameDisplayed AS PropertyNameDisplayed
		,Property.SortOrder AS PropertySortOrder
		,Property.Expanded
		,Property.[Type]
		,Property.[Description]
		,GroupId
		,GroupName
		,GroupNameDisplayed
		,GroupSortorder
		,unit
	FROM [Catalog].[PropertyValue]
	INNER JOIN [Catalog].[Property] ON [Property].[PropertyID] = [PropertyValue].[PropertyID]
	LEFT JOIN [Catalog].PropertyGroup ON PropertyGroup.PropertyGroupID = [Property].GroupID
	WHERE [Property].[PropertyID] = @PropertyID
	order by [PropertyValue].[SortOrder]
END

GO--

ALTER PROCEDURE [Catalog].[sp_GetPropertyValuesByProductID] @ProductID INT  
AS  
BEGIN  
 SET NOCOUNT ON;  
  
 SELECT  
   [PropertyValue].[PropertyValueID]  
  ,[PropertyValue].[PropertyID]  
  ,[PropertyValue].[Value]  
  ,[PropertyValue].[SortOrder]  
  ,[Property].UseinFilter  
  ,[Property].UseIndetails  
  ,[Property].UseInBrief  
  ,[Property].[Name] as PropertyName  
  ,[Property].[NameDisplayed] AS PropertyNameDisplayed
  ,[Property].[SortOrder] as PropertySortOrder  
  ,[Property].[Expanded] as Expanded  
  ,[Property].[Type] as [Type]  
  ,[Property].GroupId as GroupId  
  ,[Property].[Description] as [Description]
  ,GroupName
  ,GroupNameDisplayed  
  ,GroupSortorder
  ,unit
 FROM [Catalog].[PropertyValue]  
 INNER JOIN [Catalog].[ProductPropertyValue] ON [ProductPropertyValue].[PropertyValueID] = [PropertyValue].[PropertyValueID]  
 inner join [Catalog].[Property] on [Property].[PropertyID] = [PropertyValue].[PropertyID]  
 left join Catalog.PropertyGroup on propertyGroup.PropertyGroupID = [Property].GroupID  
 WHERE [ProductID] = @ProductID  
 ORDER BY case when PropertyGroup.GroupSortOrder is null then 1 else 0 end, 
 PropertyGroup.GroupSortOrder,PropertyGroup.GroupName, [Property].[SortOrder], [Property].Name, [PropertyValue].[SortOrder], [PropertyValue].Value  
END

GO--

ALTER PROCEDURE [Catalog].[sp_GetPropertyValueByID] @PropertyValueId INT
AS
  BEGIN
      SELECT [PropertyValueId],
             [Property].[PropertyId],
             [value],
             [PropertyValue].[sortorder],
             [Property].useinfilter,
             [Property].useindetails,
             [Property].useinbrief,
             [Property].Name       AS PropertyName,
			 [Property].NameDisplayed AS PropertyNameDisplayed,
             [Property].SortOrder  AS PropertySortOrder,
             [Property].Expanded,
             [Property].[Type],
			 [Property].[Description],
             GroupId,
             GroupName,
			 GroupNameDisplayed,
             GroupSortOrder,
			 unit
      FROM   [Catalog].[PropertyValue]
      INNER JOIN [Catalog].[Property] ON [Property].[Propertyid] = [PropertyValue].[PropertyID]
      LEFT JOIN [Catalog].PropertyGroup ON PropertyGroup.PropertyGroupId = [Property].GroupId
      WHERE  [PropertyValue].[PropertyValueId] = @PropertyValueId
  END 

GO--

ALTER PROCEDURE [Catalog].[sp_UpdatePropertyValue]	
	@PropertyValueID int,
    @Value nvarchar(255),
    @SortOrder int,
    @RangeValue float
AS
BEGIN
	SET NOCOUNT ON;
	UPDATE [Catalog].[PropertyValue]
	SET [Value] = @Value
       ,[SortOrder] = @SortOrder
       ,[RangeValue] = @RangeValue
 WHERE [PropertyValueID] = @PropertyValueID
END

GO--

ALTER PROCEDURE [Catalog].[sp_AddPropertyValue]
	@Value nvarchar(255),
	@PropertyId int,
	@SortOrder int = 0,
	@RangeValue float = 0
AS
BEGIN
	SET NOCOUNT ON;
	 
	INSERT INTO [Catalog].[PropertyValue]
           ([PropertyID],[Value],[SortOrder],[UseInFilter], [UseInDetails], UseInBrief, [RangeValue])
			select @PropertyID, @Value, @SortOrder, [UseInFilter], [UseInDetails], UseInBrief, @RangeValue from [Catalog].[Property] where  [Property].[PropertyID]=@PropertyId
     SELECT SCOPE_IDENTITY()
END

GO--

IF EXISTS(SELECT * FROM sys.indexes WHERE name = 'PropertyValue_PropertyID' AND object_id = OBJECT_ID(N'[Catalog].[PropertyValue]'))
	DROP INDEX [PropertyValue_PropertyID] ON [Catalog].[PropertyValue]

GO--

IF EXISTS (SELECT * FROM [Catalog].[PropertyValue] WHERE LEN(Value) > 255)
	ALTER TABLE [Catalog].[PropertyValue] ADD [Value_Old] nvarchar(MAX) NULL
ELSE
	ALTER TABLE [Catalog].[PropertyValue] ALTER COLUMN [Value] nvarchar(255) NOT NULL

GO--

IF EXISTS(SELECT *
              FROM sys.columns
              WHERE (name = N'Value_Old') AND object_id = OBJECT_ID(N'[Catalog].[PropertyValue]'))
    BEGIN
		EXEC('UPDATE [Catalog].[PropertyValue] SET Value_Old = Value')
        
        UPDATE [Catalog].[PropertyValue] SET Value = SUBSTRING(Value, 0, 255)
		WHERE LEN(Value) > 255
		
		ALTER TABLE [Catalog].[PropertyValue] ALTER COLUMN [Value] nvarchar(255) NOT NULL
	END

IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name = 'PropertyValue_Value' AND object_id = OBJECT_ID(N'[Catalog].[PropertyValue]'))
	CREATE NONCLUSTERED INDEX [PropertyValue_Value] ON [Catalog].[PropertyValue]
	(
		[Value] ASC
	) WITH (PAD_INDEX = OFF, SORT_IN_TEMPDB = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]

GO--

IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name = 'PropertyValue_PropertyID' AND object_id = OBJECT_ID(N'[Catalog].[PropertyValue]'))
	CREATE NONCLUSTERED INDEX [PropertyValue_PropertyID] ON [Catalog].[PropertyValue]
	(
		[PropertyID] ASC
	) WITH (PAD_INDEX = OFF, SORT_IN_TEMPDB = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]

GO--

DELETE FROM [Settings].[Localization] WHERE [ResourceKey] = 'Core.Catalog.PropertyType.Textarea'

UPDATE [Catalog].[Property] SET Type = 1 WHERE Type = 4

GO--

EXEC [Settings].[sp_AddUpdateInternalSetting] 'B2BTestYandexShippingMethod', 'https://b2b.taxi.tst.yandex.net/api/b2b/platform/'

GO--
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Order].[ShippingRule]') AND type in (N'U'))
BEGIN
CREATE TABLE [Order].[ShippingRule](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](255) NULL,
	[Enabled] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[EditorsParams] [nvarchar](max) NOT NULL,
	[FiltersParams] [nvarchar](max) NOT NULL,
	[DateAdded] [datetime] NOT NULL,
	[DateModified] [datetime] NOT NULL,
 CONSTRAINT [PK_ShippingRule] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Shippingsmethods', N'Доставка, правила доставки';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Shippingsmethods', N'Shipping methods, shipping rules';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.ShippingMethods.List.Title', N'Способы доставки';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.ShippingMethods.List.Title', N'Shipping methods';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.ShippingMethods.Rules', N'Правила доставки';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.ShippingMethods.Rules', N'Shipping rules';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingRules.Index.Title', N'Правила доставки';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingRules.Index.Title', N'Shipping rules';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Name', N'Название';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Name', N'Name';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Enabled', N'Активность';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Enabled', N'Enabled';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Enable', N'Активно';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Enable', N'Enable';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Disable', N'Не активно'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Disable', N'Disable'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.SortOrder', N'Порядок сортировки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.SortOrder', N'Sort order'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.DeleteSelected', N'Удалить выделенные'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.DeleteSelected', N'Delete selected'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.MakeActive', N'Сделать активными'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.MakeActive', N'Make active'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.MakeInactive', N'Сделать неактивными'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.MakeInactive', N'Make inactive'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingRules.Validation.NameIsNotFilledIn', N'Не заполнено название'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingRules.Validation.NameIsNotFilledIn', N'The name is not filled in'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingRules.RuleNotFound', N'Правило не найдено'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingRules.RuleNotFound', N'Rule not found'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ModalHeader', N'Правило доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ModalHeader', N'Shipping rule'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor', N'Действует'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor', N'Valid for'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor.All', N'Для всех доставок'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor.All', N'For all deliveries'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor.ByType', N'Для типов доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor.ByType', N'For delivery types'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor.ById', N'Для способов доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor.ById', N'For shipping methods'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor.ExcludeByType', N'Для типов доставки кроме'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor.ExcludeByType', N'For delivery types other than'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor.ExcludeById', N'Для способов доставки кроме'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor.ExcludeById', N'For shipping methods other than'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor.ByType.Placeholder', N'Укажите типы доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor.ByType.Placeholder', N'Specify delivery types'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor.ByType.Validation', N'Типы доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor.ByType.Validation', N'Delivery types'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor.ById.Placeholder', N'Укажите способы доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor.ById.Placeholder', N'Specify shipping methods'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor.ById.Validation', N'Способы доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor.ById.Validation', N'Shipping methods'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor.ExcludeByType.Validation', N'Для типов доставки кроме'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor.ExcludeByType.Validation', N'For delivery types other than'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.ValidFor.ExcludeById.Validation', N'Для способов доставки кроме'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.ValidFor.ExcludeById.Validation', N'For shipping methods other than'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules', N'Правило'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules', N'Rule'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.AddRule', N'Добавить правило'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.AddRule', N'Add rule'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.FixedCost', N'Фиксированная стоимость доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.FixedCost', N'Fixed shipping cost'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.FixedCost.Placeholder', N'Стоимость'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.FixedCost.Placeholder', N'Cost'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.FixedCost.ValidationName', N'Стоимость'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.FixedCost.ValidationName', N'Cost'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.IncreaseCost', N'Увеличить стоимость доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.IncreaseCost', N'Increase the shipping cost'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.IncreaseCost.Placeholder', N'Стоимость'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.IncreaseCost.Placeholder', N'Cost'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.IncreaseCost.ValidationName', N'Стоимость'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.IncreaseCost.ValidationName', N'Cost'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.IncreaseCost.Percents.Placeholder', N'Значение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.IncreaseCost.Percents.Placeholder', N'Percents'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.IncreaseCost.Percents.ValidationName', N'Значение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.IncreaseCost.Percents.ValidationName', N'Percents'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.ReduceCost', N'Уменьшить стоимость доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.ReduceCost', N'Reduce the shipping cost'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.ReduceCost.Placeholder', N'Стоимость'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.ReduceCost.Placeholder', N'Cost'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.ReduceCost.ValidationName', N'Стоимость'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.ReduceCost.ValidationName', N'Cost'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.ReduceCost.Percents.Placeholder', N'Значение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.ReduceCost.Percents.Placeholder', N'Percents'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.ReduceCost.Percents.ValidationName', N'Значение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.ReduceCost.Percents.ValidationName', N'Percents'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.IncreaseCostByOrderSum', N'Увеличить стоимость доставки от суммы заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.IncreaseCostByOrderSum', N'Increase the shipping cost from order amount'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.IncreaseCostByOrderSum.Placeholder', N'Значение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.IncreaseCostByOrderSum.Placeholder', N'Percents'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.IncreaseCostByOrderSum.ValidationName', N'Значение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.IncreaseCostByOrderSum.ValidationName', N'Percents'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.ReduceCostByOrderSum', N'Уменьшить стоимость доставки от суммы заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.ReduceCostByOrderSum', N'Reduce the shipping cost from order amount'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.ReduceCostByOrderSum.Placeholder', N'Значение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.ReduceCostByOrderSum.Placeholder', N'Percents'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.ReduceCostByOrderSum.ValidationName', N'Значение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.ReduceCostByOrderSum.ValidationName', N'Percents'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.SwitchOff', N'Исключить/убрать доставку'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.SwitchOff', N'Exclude shipping'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.Currency', N'Валюта'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.Currency', N'Currency'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.Rules.Currency.SetCurrency', N'Выберите валюту'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.Rules.Currency.SetCurrency', N'Choose a currency'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If', N'Если'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If', N'When'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.AddFilter', N'Добавить условие'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.AddFilter', N'Add filter'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.TotalPrice', N'Стоимость заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.TotalPrice', N'Cost of order'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.ShippingCost', N'Стоимость доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.ShippingCost', N'Cost of delivery'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.Weight', N'Вес'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.Weight', N'Weight'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.FromPlaceholder', N'От'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.FromPlaceholder', N'From'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.ToPlaceholder', N'До'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.ToPlaceholder', N'To'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.Currency', N'Валюта'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.Currency', N'Currency'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.Currency.SetCurrency', N'Выберите валюту'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.Currency.SetCurrency', N'Choose a currency'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.Kg', N'кг'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.Kg', N'kg'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingRules.Validation.EditorsParamsIsNotFilledIn', N'Не указано правило'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingRules.Validation.EditorsParamsIsNotFilledIn', N'The rule is not specified'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.TypeOfComparison', N'Тип сравнения'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.TypeOfComparison', N'Type of comparison'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.SelectTypeOfComparison', N'Выберите тип сравнения'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.SelectTypeOfComparison', N'Select the type of comparison'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.TypeOfComparison.More', N'Больше'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.TypeOfComparison.More', N'More'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.TypeOfComparison.Less', N'Меньше'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.TypeOfComparison.Less', N'Less'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.TypeOfComparison.Range', N'Диапозон'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.TypeOfComparison.Range', N'Range'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingRules.If.Value', N'Значение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingRules.If.Value', N'Value'

GO--


EXEC [Settings].[sp_AddUpdateInternalSetting] 'ActivityTriggerLogServiceUrl', 'https://activity.advsrvone.pw/trigger'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.PersonalAccount.Bonus.Title', 'Карта лояльности';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.PersonalAccount.Bonus.Title', 'Loyalty card';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.PersonalAccount.Bonus.Cashback', 'Кэшбэк';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.PersonalAccount.Bonus.Cashback', 'Cashback';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.PersonalAccount.Bonus.LoyaltyLevel', 'Уровень карты';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.PersonalAccount.Bonus.LoyaltyLevel', 'Card level';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.PersonalAccount.Bonus.CardBlocked', 'Заблокирована';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.PersonalAccount.Bonus.CardBlocked', 'Blocked';

GO--

IF NOT EXISTS(SELECT 1
              FROM sys.columns
              WHERE (name = N'CalculatePriceAutomatically') AND object_id = OBJECT_ID(N'[Catalog].[PriceRule]'))
BEGIN
    ALTER TABLE Catalog.PriceRule ADD
        CalculatePriceAutomatically bit NULL,
        CalculationPriceMode tinyint NULL,
        MarkupPercentage float(53) NULL,
        MarkupAmount float(53) NULL
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Catalog.PriceRuleTypeCalculationPriceMode.OfferPrice', 'От цены товара';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Catalog.PriceRuleTypeCalculationPriceMode.OfferPrice', 'From price of product';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Catalog.PriceRuleTypeCalculationPriceMode.SupplyPrice', 'От закупочной цены';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Catalog.PriceRuleTypeCalculationPriceMode.SupplyPrice', 'From supply price';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditPriceRule.CalculatePriceAutomatically', 'Рассчитывать цену автоматически';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditPriceRule.CalculatePriceAutomatically', 'Calculate price automatically';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditPriceRule.CalculatePriceAutomaticallyHint', 'Можно создать тип цен, в котором цены рассчитываются автоматически по заданному правилу. Цена будет считаться от базовой цены плюс наценка или скидка. Базовую цену можно выбрать от цены товара или от закупочной цены. Наценка или скидка может быть в процентах и в валюте товара.<br><br> По умолчанию в товаре не нужно заполнять цену, если выбрано "Рассчитывать цену автоматически", если цена указана, то применится она.';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditPriceRule.CalculatePriceAutomaticallyHint', 'You can create a price type in which prices are calculated automatically according to a specified rule. The price will be calculated as the base price plus a markup or discount. The base price can be selected from the product price or the purchase price. The markup or discount can be in percentage and in currency of product.<br><br> By default, you do not need to fill in the price for the product if “Calculate price automatically” is selected; if the price is specified, it will be applied.';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Checkout.CheckoutCart.Order.Goods', 'Товары';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Checkout.CheckoutCart.Order.Goods', 'Goods';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Users.Validate.InvalidAuthCode', 'Невалидный код аутентификации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Users.Validate.InvalidAuthCode', 'Invalid authentication code' 
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Settings.AddEditUserCtrl.NoActiveTwoFactorAuthModules', 'Нет активных модулей двухфакторной аутентификации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Settings.AddEditUserCtrl.NoActiveTwoFactorAuthModules', 'There are no active two-factor authentication modules'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditUser.TwoFactorAuth', 'Двухфакторная аутентификация'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditUser.TwoFactorAuth', 'Two-factor authentication'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditUser.SecretKey', 'Секретный ключ'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditUser.SecretKey', 'Secret key'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditUser.EnterAuthCode', 'Введите код для авторизации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditUser.EnterAuthCode', 'Enter the code to authorize'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditUser.AuthCode', 'Код авторизации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditUser.AuthCode', 'Authorization code'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditUser.AppsForTotpAuth', 'Отсканируйте qr-код в приложении для TOTP авторизации. Список рекомендуемых приложений см. по ссылке: <br/><a href="https://www.advantshop.net/help/pages/2factor-auth" target="_blank">Список TOTP-приложений</a>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditUser.AppsForTotpAuth', 'Scan the QR code in the TOTP authorization app. For a list of recommended apps, see the link: <br/><a href="https://www.advantshop.net/help/pages/2factor-auth" target="_blank">List of TOTP apps</a>'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Account.CodeSentToEmail', 'Код отправлен на email'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Account.CodeSentToEmail', 'Code sent to email'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Account.SendCodeByEmail', 'Отправить код на email'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Account.SendCodeByEmail', 'Send code by email'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Account.AccessIsBlockedTooManyAttempts', 'Доступ заблокирован. Слишком много попыток.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Account.AccessIsBlockedTooManyAttempts', 'Access is blocked. Too many attempts.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Shared.AuthCode', 'Код авторизации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Shared.AuthCode', 'Authorization code'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Shared.YourAuthCode', 'Ваш код авторизации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Shared.YourAuthCode', 'Your authorization code'

GO--

DELETE FROM [Settings].[Settings] WHERE Name = 'ActiveTwoFactorAuthModule'
DELETE FROM [Settings].[Localization]
    WHERE ResourceKey = 'Admin.Settings.Users.TwoFactorAuth'
    OR ResourceKey = 'Admin.Settings.Users.EnableTwoFactor'
    OR ResourceKey = 'Admin.Settings.Users.Email'
    OR ResourceKey = 'Admin.Settings.Users.Password'
    OR ResourceKey = 'Admin.Settings.Users.GetCode'
    OR ResourceKey = 'Admin.Settings.Users.EnterKeyManually'

GO--

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Customers].[TotpBan]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Customers].[TotpBan]
    (
        [Ip] [nvarchar](100) NOT NULL,
        [UntilDate] [datetime] NOT NULL
    )
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.PriceRules.AreYouSureDeleteSelected', 'Вы уверены, что хотите удалить? Будут удалены только типы цен, которые не используются в товарах, остальные можно удалить вручную.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.PriceRules.AreYouSureDeleteSelected', 'Are you sure you want to delete? Only price types that are not used in products will be deleted; the rest can be deleted manually.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.Order', 'Заказ';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.Order', 'Order';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Bonus.CardTier', 'Уровень'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Bonus.CardTier', 'Tier'

EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Bonus.BonusHistory.Foundation', 'Reason'

EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Bonus.TransactionsMode.Subtract', 'Write-offs'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Bonuses.Bonus.TransactionCreatedToday', 'Сегодня {0}'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Bonuses.Bonus.TransactionCreatedToday', 'Today {0}'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Bonuses.Bonus.TransactionCreatedYesterday', 'Вчера {0}'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Bonuses.Bonus.TransactionCreatedYesterday', 'Yesterday {0}'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Settings.SettingsCatalog.ReviewFormType.Default', 'По умолчанию'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.PushStatus.Sent', 'Отправлено';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.PushStatus.Sent', 'Sent';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.PushStatus.Delivered', 'Доставлено';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.PushStatus.Delivered', 'Delivered';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.PushStatus.Opened', 'Открыто';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.PushStatus.Opened', 'Opened';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.PushStatus.Failed', 'Ошибка';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.PushStatus.Failed', 'Failed';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.TriggerLogLevel.Info', 'Инфо';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.TriggerLogLevel.Info', 'Info';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.TriggerLogLevel.Success', 'Успешное выполнение';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.TriggerLogLevel.Success', 'Success';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.TriggerLogLevel.Warning', 'Предупреждение';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.TriggerLogLevel.Warning', 'Warning';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.TriggerLogLevel.Error', 'Ошибка';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.TriggerLogLevel.Error', 'Error';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Settings.Import301RedCtrl.ErrorImport', 'Ошибка при импорте. Убедитесь, что загружаете правильный файл. <a href="https://www.advantshop.net/help/pages/robots-txt#a10" target="_blank">Инструкция</a>';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Settings.Import301RedCtrl.ErrorImport', 'Import error. Please, check file. <a href="https://www.advantshop.net/help/pages/robots-txt#a10" target="_blank">Instruction</a>';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Settings.Import301RedCtrl.ErrorMissingField', 'Не найдено обязательное поле. Проверьте, что заголовок имеет обязательные поля "RedirectFrom;RedirectTo;ProductArtNo"';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Settings.Import301RedCtrl.ErrorMissingField', 'Not found required field, check header in file "RedirectFrom;RedirectTo;ProductArtNo"';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Settings.Import301RedCtrl.ErrorInRow', 'Ошибка в строке {0}';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Settings.Import301RedCtrl.ErrorInRow', 'Error in row {0}';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Settings.Import301RedCtrl.ErrorsDuringImport', 'Файл импортировался, но в процессе импорта произошли ошибки: {0}';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Settings.Import301RedCtrl.ErrorsDuringImport', 'The file was imported, but errors occurred during the import process: {0}';

GO--

EXEC [Settings].[sp_AddUpdateInternalSetting] 'SandboxThawaniPaymentMethod', 'https://uatcheckout.thawani.om/api/v1'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'BaseThawaniPaymentMethod', 'https://checkout.thawani.om/api/v1'

EXEC [Settings].[sp_AddUpdateInternalSetting] 'SandboxThawaniReturnUrl', 'https://uatcheckout.thawani.om/pay'
EXEC [Settings].[sp_AddUpdateInternalSetting] 'BaseThawaniReturnUrl', 'https://checkout.thawani.om/pay'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.PaymentMethods.Thawani.ApiKey', 'ApiKey';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.PaymentMethods.Thawani.ApiKey', 'ApiKey';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.PaymentMethods.Thawani.SecretKey', 'SecretKey';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.PaymentMethods.Thawani.SecretKey', 'SecretKey';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.PaymentMethods.Thawani.PublishableKey', 'PublishableKey';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.PaymentMethods.Thawani.PublishableKey', 'PublishableKey';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Modules.Details.DefaultInstructionTitle', 'Инструкция';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Modules.Details.DefaultInstructionTitle', 'Instructions';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.SettingsBonus.WithoutPromoCode', 'Без промокода'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.SettingsBonus.WithoutPromoCode', 'Without a promo code'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.BonusSystem.BonusSettingsModel.SelectPromoCode', 'Выберите промокод'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.BonusSystem.BonusSettingsModel.SelectPromoCode', 'Select a promo code'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsBonus.Index.BringFriend', 'Приведи друга'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsBonus.Index.BringFriend', 'Bring a friend'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsBonus.Index.PromoCode', 'Промокод'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsBonus.Index.PromoCode', 'Promo code'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsBonus.Index.ProgramConditions', 'Условия программы'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsBonus.Index.ProgramConditions', 'Program conditions'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'MyAccount.BringFriend.BringFriend', 'Приведи друга'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'MyAccount.BringFriend.BringFriend', 'Bring a friend'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'MyAccount.BringFriend.ProgramConditions', 'Условия программы'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'MyAccount.BringFriend.ProgramConditions', 'Program conditions'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'MyAccount.BringFriend.Recommend', 'Рекомендовать'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'MyAccount.BringFriend.Recommend', 'Recommend'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MyAccount.CouldNotCopyLink', 'Скопировать ссылку не удалось'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MyAccount.CouldNotCopyLink', 'The link could not be copied'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MyAccount.LinkCopied', 'Ссылка скопирована'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MyAccount.LinkCopied', 'The link has been copied'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Crm.ELeadFieldType.ReferralCode', 'Реферальный код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Crm.ELeadFieldType.ReferralCode', 'Referral code'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Crm.ELeadFieldType.ReferralBonusAccount', 'Бонусный счет реферала'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Crm.ELeadFieldType.ReferralBonusAccount', 'Referral bonus account'

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'ReferralCode' AND object_id = OBJECT_ID(N'[Customers].[Customer]'))
BEGIN
    ALTER TABLE [Customers].[Customer]
    ADD ReferralCode [nvarchar](50) NULL
END

GO--

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Customers].[ReferralCustomer]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Customers].[ReferralCustomer](
        [CustomerId] [uniqueidentifier] NOT NULL,
        [ReferralCustomerId] [uniqueidentifier] NOT NULL,
    CONSTRAINT [PK_ReferralCustomer] PRIMARY KEY CLUSTERED 
    (
        [CustomerId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
    CONSTRAINT [FK_ReferralCustomer_Customer_CustomerId]
        FOREIGN KEY ([CustomerId])
        REFERENCES [Customers].[Customer]([CustomerID])
        ON DELETE CASCADE
    ) ON [PRIMARY]
END

GO--

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Numbers') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.Numbers (n INT PRIMARY KEY);
END

GO--

IF NOT EXISTS (Select 1 From dbo.Numbers)
BEGIN
    WITH Numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1
    FROM Numbers
    WHERE n < 1000000
    )
    INSERT INTO dbo.Numbers (n)
    SELECT n FROM Numbers option(maxrecursion 0);
END

GO--

IF OBJECT_ID('dbo.STRING_SPLIT_WITH_ORDER', 'IF') IS NOT NULL
    DROP FUNCTION dbo.STRING_SPLIT_WITH_ORDER;
GO--

CREATE FUNCTION dbo.STRING_SPLIT_WITH_ORDER
(
    @string NVARCHAR(MAX),
    @separator NVARCHAR(10)
)
RETURNS TABLE
AS
RETURN
(
    WITH Boundaries AS
    (
        SELECT
            n AS startPos,
            CHARINDEX(@separator, @string + @separator, n) AS nextPos
        FROM dbo.Numbers
        WHERE (n = 1 OR SUBSTRING(@string, n - LEN(@separator), LEN(@separator)) = @separator)
        AND n <= LEN(@string)
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY startPos) AS sort,
        SUBSTRING(@string, startPos, nextPos - startPos) AS value
    FROM Boundaries
    WHERE nextPos > startPos
);

GO--

IF OBJECT_ID('dbo.STRING_SPLIT_INT_WITH_ORDER', 'IF') IS NOT NULL
    DROP FUNCTION dbo.STRING_SPLIT_INT_WITH_ORDER;
GO--

CREATE FUNCTION dbo.STRING_SPLIT_INT_WITH_ORDER
(
    @string NVARCHAR(MAX),
    @separator NVARCHAR(10)
)
RETURNS TABLE
AS
RETURN
(
    WITH Boundaries AS
    (
        SELECT
            n AS startPos,
            CHARINDEX(@separator, @string + @separator, n) AS nextPos
        FROM dbo.Numbers
        WHERE (n = 1 OR SUBSTRING(@string, n - LEN(@separator), LEN(@separator)) = @separator)
        AND n <= LEN(@string)
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY startPos) AS sort,
        CAST(SUBSTRING(@string, startPos, nextPos - startPos) AS INT) AS value
    FROM Boundaries
    WHERE nextPos > startPos
);

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.BonusSystem.Index.InstructionsBringFriend', 'Инструкция. Приведи друга'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.BonusSystem.Index.InstructionsBringFriend', 'Instructions. Bring a friend'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditCarousel.TextTitleLineSpacing', 'Межстрочный интервал заголовка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditCarousel.TextTitleLineSpacing', 'Title line spacing'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditCarousel.TextLineSpacing', 'Межстрочный интервал текста'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditCarousel.TextLineSpacing', 'Text line spacing'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.MobileVersion.ShowWishlist', 'Показывать иконку "Добавить в избранное"'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.MobileVersion.ShowWishlist', 'Show the "Add to favorites" icon'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.MobileVersion.ShowCompare', 'Показывать иконку "Добавить в сравнение"'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.MobileVersion.ShowCompare', 'Show the "Add to compare" icon'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.MobileVersion.ShowQuickView', 'Показывать иконку "Открыть быстрый посмотр"'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.MobileVersion.ShowQuickView', 'Show the "Open quick view" icon'

GO--

UPDATE [Order].[PaymentParam]
SET [Value] = 'Api'
WHERE [Name] = 'YandexKassa_Protocol'
  AND [Value] = ''

GO--

DELETE [Order].[PaymentParam]
WHERE [Name] = 'YandexKassa_ScID'

GO--
       
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.YandexKassa.CreditButtonTextInProductCard', 'Оплатить частями';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.YandexKassa.CreditButtonTextInProductCard', 'Pay by parts';

GO--

IF EXISTS (SELECT * FROM sys.columns WHERE name = N'TitleLineSpacing' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    DROP COLUMN TitleLineSpacing
END

GO--

IF EXISTS (SELECT * FROM sys.columns WHERE name = N'TextLineSpacing' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    DROP COLUMN TextLineSpacing
END

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'TitleLineHeight' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    ADD TitleLineHeight float NULL
END

GO--

IF EXISTS (SELECT * FROM sys.columns WHERE name = N'TitleLineHeight' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    UPDATE [CMS].[CarouselText]
    SET TitleLineHeight = 1.2
    WHERE TitleLineHeight IS NULL
END

GO--

IF EXISTS (SELECT * FROM sys.columns WHERE name = N'TitleLineHeight' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    ALTER COLUMN TitleLineHeight float NOT NULL
END

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'TextLineHeight' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    ADD TextLineHeight float NULL
END

GO--

IF EXISTS (SELECT * FROM sys.columns WHERE name = N'TextLineHeight' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]'))
BEGIN
    UPDATE [CMS].[CarouselText]
    SET TextLineHeight = 1
    WHERE TextLineHeight IS NULL
END

GO--

IF EXISTS (SELECT * FROM sys.columns WHERE name = N'TextLineHeight' AND object_id = OBJECT_ID(N'[CMS].[CarouselText]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[CarouselText]
    ALTER COLUMN TextLineHeight float NOT NULL
END

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'WorksOnlyOnceForCustomer' AND object_id = OBJECT_ID(N'[CRM].[TriggerRule]'))
BEGIN
    ALTER TABLE [CRM].[TriggerRule]
    ADD WorksOnlyOnceForCustomer bit NULL
END

GO--

IF EXISTS (SELECT * FROM sys.columns WHERE name = N'WorksOnlyOnceForCustomer' AND object_id = OBJECT_ID(N'[CRM].[TriggerRule]'))
BEGIN
    UPDATE [CRM].[TriggerRule]
    SET WorksOnlyOnceForCustomer = 0
    WHERE WorksOnlyOnceForCustomer IS NULL
END

GO--

IF EXISTS (SELECT * FROM sys.columns WHERE name = N'WorksOnlyOnceForCustomer' AND object_id = OBJECT_ID(N'[CRM].[TriggerRule]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CRM].[TriggerRule]
    ALTER COLUMN WorksOnlyOnceForCustomer bit NOT NULL
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.TriggeredFired', 'Триггер срабатвает'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.TriggeredFired', 'The trigger is fired'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.NoRestrictions', 'Без ограничений'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.NoRestrictions', 'No restrictions'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.TriggeredOnceOrderLead', 'Один раз для связки покупатель - заказ/лид'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.TriggeredOnceOrderLead', 'Once for the buyer - order/lead link'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.TriggeredOnceCustomer', 'Один раз для конкретного покупателя'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.TriggeredOnceCustomer', 'Once for the buyer'

GO--

UPDATE [Settings].[Localization] SET ResourceKey = 'Admin.Js.AddEditCarousel.TextTitleLineHeight' WHERE ResourceKey = 'Admin.Js.AddEditCarousel.TextTitleLineSpacing'
UPDATE [Settings].[Localization] SET ResourceKey = 'Admin.Js.AddEditCarousel.TextLineHeight' WHERE ResourceKey = 'Admin.Js.AddEditCarousel.TextLineSpacing'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Builder.ShippingDesignMode', 'Стиль отображения способов доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Builder.ShippingDesignMode', 'Display style Shipping method'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.TemplateSettings.ShippingDesignMode.Table', 'Таблица'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.TemplateSettings.ShippingDesignMode.Table', 'Table'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.TemplateSettings.ShippingDesignMode.Tile', 'Плитка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.TemplateSettings.ShippingDesignMode.Tile', 'Tile'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Builder.PaymentDesignMode', 'Стиль отображения способов оплаты'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Builder.PaymentDesignMode', 'Display style Payment method'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.TemplateSettings.PaymentDesignMode.Table', 'Таблица'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.TemplateSettings.PaymentDesignMode.Table', 'Table'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.TemplateSettings.PaymentDesignMode.Tile', 'Плитка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.TemplateSettings.PaymentDesignMode.Tile', 'Tile'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Checkout.EShoppingCartMode.None', 'Не отображать'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Checkout.EShoppingCartMode.None', 'Hide'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Builder.CheckoutTypeTitle', 'Стиль отображения страницы оформления заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Builder.CheckoutTypeTitle', 'Checkout page display style'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.TemplateSettings.CheckoutTypeClassical', 'Классический'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.TemplateSettings.CheckoutTypeClassical', 'Classical'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.TemplateSettings.CheckoutTypeModern', 'Современный'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.TemplateSettings.CheckoutTypeModern', 'Modern'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.StoreAccessMode', 'Отображать витрину магазина'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.StoreAccessMode', 'Display the store showcase'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.StoreAccessModeNote', 'Адрес перенаправления для неавторизованных пользователей. Если не задан, используется страница входа <a href={0}>{0}</a>.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.StoreAccessModeNote', 'Redirect URL for unauthenticated users. If not specified, the login page <a href={0}>{0}</a> will be used.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Configuration.StoreAccessMode.All', 'Всем'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Configuration.StoreAccessMode.All', 'All'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Configuration.StoreAccessMode.AuthenticatedCustomer', 'Только авторизованным пользователям'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Configuration.StoreAccessMode.AuthenticatedCustomer', 'Authorized users only'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Configuration.StoreAccessMode.NoOne', 'Никому'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Configuration.StoreAccessMode.NoOne', 'No one'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.NoAccessRedirectUrl', 'Адрес приветственной страницы'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.NoAccessRedirectUrl', 'Address of the welcome page'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.LoginUrl', 'Адрес входа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.LoginUrl', 'Address of the login'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.LoginUrlNote', 'Фиксированный адрес страницы входа, доступный для использования во внешних сервисах и интеграциях.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.LoginUrlNote', 'Fixed login page address for use in external services and integrations.'

GO--

IF EXISTS (SELECT *
           FROM [Settings].[Settings]
           WHERE Name = 'IsStoreClosed')
    AND NOT EXISTS (SELECT *
                    FROM [Settings].[Settings]
                    WHERE Name = 'StoreAccessMode')
    BEGIN
        IF (SELECT TOP (1) [Value]
            FROM [Settings].[Settings]
            WHERE [Name] = 'IsStoreClosed') = 'True'
            BEGIN
                INSERT INTO [Settings].[Settings] ([Name], [Value]) 
                VALUES ('StoreAccessMode', 'NoOne') 
            END
        ELSE
            BEGIN
                INSERT INTO [Settings].[Settings] ([Name], [Value])
                VALUES ('StoreAccessMode', 'All')
            END
    END

GO--

IF EXISTS (SELECT *
           FROM [Settings].[Settings]
           WHERE Name = 'IsStoreClosed')
    BEGIN
        DELETE FROM [Settings].[Settings]
        WHERE Name = 'IsStoreClosed'
    END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.Phone', 'Номер телефона'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.Phone', 'Phone number'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.Login', 'Войти'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.Login', 'Login'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.SendCodeAgain', 'Выслать код повторно'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.SendCodeAgain', 'Send code again'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.Confirm', 'Подтвердить'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.Confirm', 'Confirm'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.Registration', 'Вы ещё не зарегистрированы, необходимо зарегистрироваться'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.Registration', 'You are not registered yet, you need to register'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.PhoneTitle', 'Вход по номеру телефона'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.PhoneTitle', 'Login by phone'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.ConfirmationTitle', 'Введите код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.ConfirmationTitle', 'Enter the code'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.RegistrationTitle', 'Регистрация'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.RegistrationTitle', 'Registration'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.PhoneDescription', 'Мы отправим код в SMS — введите номер, чтобы получить его.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.PhoneDescription', 'We will send the code by SMS - enter the number to receive it.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.RegistrationDescription', 'Пожалуйста, зарегистрируйтесь, чтобы продолжить.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.RegistrationDescription', 'Please register to continue.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.ReturnError', 'Не удалось вернуться'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.ReturnError', 'Failed to return'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.RetryError', 'До следующей отправки ещё {{sec}} сек.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.RetryError', 'Still {{sec}} seconds until the next sending'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.ErrorEmptyPhone', 'Укажите корректный номер телефона'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.ErrorEmptyPhone', 'Enter the correct phone'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.CodeSent', 'Код подтверждения выслан на номер '
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.CodeSent', 'Confirmation code sent on number '

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Code.RetryPhoneCountdownText', 'Отправить код повторно можно через {{sec}} сек.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Code.RetryPhoneCountdownText', 'You can resend the code after {{sec}} sec.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.SendEmail', 'Продолжить'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.SendEmail', 'Continue'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.PasswordDescription', 'Вы уже зарегистрированы, необходимо авторизоваться'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.PasswordDescription', 'You are already registered, you need to log in'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.Password', 'Пароль'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.Password', 'Password'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.ForgotPassword', 'Забыли пароль?'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.ForgotPassword', 'Forgot your password?'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.Login', 'Войти'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.Login', 'Login'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.EmailDescription', 'Введите ваш адрес электронной почты — если у вас уже есть аккаунт, мы попросим ввести пароль. Если нет — сразу поможем создать новый.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.EmailDescription', 'Enter your e-mail address - if you already have an account, we will ask you to enter your password. If not, we will help you create a new one right away.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.PasswordDescription', 'Укажите пароль от вашего аккаунта для входа. Если вы забыли пароль, нажмите «Забыли пароль», чтобы восстановить доступ.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.PasswordDescription', 'Enter your account password to log in. If you have forgotten your password, click “Forgot Password” to regain access.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.ForgotPasswordDescription', 'На указанный при регистрации E-mail было выслано сообщение. Проверьте почту и следуйте полученной инструкции.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.ForgotPasswordDescription', 'A E-mail message was sent to your registration E-mail. Check E-Mail and follow the instructions.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.RegistrationDescription', 'Пожалуйста, зарегистрируйтесь, чтобы продолжить.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.RegistrationDescription', 'Please register to continue.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.EmailTitle', 'Введите адрес электронной почты'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.EmailTitle', 'Enter your e-mail address'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.PasswordTitle', 'Введите пароль'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.PasswordTitle', 'Enter your password'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.RegistrationTitle', 'Регистрация'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.RegistrationTitle', 'Registration'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.ForgotPasswordTitle', 'Восстановление пароля'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.ForgotPasswordTitle', 'Password recovery'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.EmailEmptyError', 'Адрес электронной почты должен быть заполнен'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.EmailEmptyError', 'The email address must be filled in'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.ReturnError', 'Не удалось вернуться'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.ReturnError', 'Failed to return'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.PasswordEmptyError', 'Пароль должен быть заполнен'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.PasswordEmptyError', 'The password must be filled in'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.LastName', 'Фамилия'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.LastName', 'Last Name'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.Patronymic', 'Отчество'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.Patronymic', 'Patronymic'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.Email', 'Электронная почта'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.Email', 'Email'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.Password', 'Пароль'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.Password', 'Password'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.PasswordConfirm', 'Пароль (ещё раз)'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.PasswordConfirm', 'Confirm password'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.Bonuses', 'Бонусы'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.Bonuses', 'Bonuses'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.WantToGetBonusCard', 'Хочу получить бонусную карту и оплачивать покупки бонусами!'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.WantToGetBonusCard', 'I want to get a bonus card and pay for purchases with bonuses!'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.ToBonusCart', 'на бонусную карту'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.ToBonusCart', 'to the bonus card'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.NewsSubscription', 'Подписаться на новости'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.NewsSubscription', 'News subscription'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.RegisterButton', 'Зарегистрироваться'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.RegisterButton', 'Register'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.PartnerRegistration', 'Зарегистрироваться в партнерской программе'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.PartnerRegistration', 'Sign up for an affiliate program'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Title.Back', 'Назад'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Title.Back', 'Back'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.InternalError', 'Внутренняя ошибка сервера'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.InternalError', 'Internal server error'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.DefaultMethodError', 'Не удалось получить стандартный метод авторизации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.DefaultMethodError', 'Failed to get the standard authorization method'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.DefaultAuthModuleError', 'Не удалось получить стандартный модуль авторизации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.DefaultAuthModuleError', 'Failed to get the standard authorization module'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.AuthRoutesError', 'Не удалось получить стандартный модуль авторизации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.AuthRoutesError', 'Failed to get the standard authorization module'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.ExistEmailError', 'Не удалось определить существует ли пользователь с данным адресом электронной почты'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.ExistEmailError', 'Failed to determine if a user with this e-mail address exists'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.EmailLoginError', 'Неверный пароль'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.EmailLoginError', 'Incorrect password'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.InitRegistrationError', 'Не удалось получить настройки регистрации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.InitRegistrationError', 'Failed to retrieve registration settings'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.InitCaptchaError', 'Не удалось получить капчу'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.InitCaptchaError', 'Failed to retrieve captcha'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.LoginCodeSettingsError', 'Не удалось получить настройки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.LoginCodeSettingsError', 'Failed to retrieve settings'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.ErrorSendCode', 'Не удалось отправить код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.ErrorSendCode', 'Failed to send code'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.ExistPhoneError', 'Не удалось определить существует ли пользователь с данным номером телефона'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.ExistPhoneError', 'Failed to determine if a user with this phone exists'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.ChangePassword.PasswordDifferent ', 'Новые пароли не совпадают'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.ChangePassword.PasswordDifferent', 'Passwords did not match'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.ChangePassword.Error ', 'При восстановлении пароля возникла ошибка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.ChangePassword.Error', 'An error occurred while trying to recover your password'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.ConfirmCode.AuthByCodeActiveError', 'Авторизация по коду не активна'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.ConfirmCode.AuthByCodeActiveError', 'Authorization by code is not active'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.ConfirmCode.PhoneError', 'Введите корректный номер телефона'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.ConfirmCode.PhoneError', 'Enter the correct phone number'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.ConfirmCode.CustomerError', 'Пользователь с телефоном {0} не найден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.ConfirmCode.CustomerError', 'User with phone {0} not found'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.ConfirmCode.CodeError', 'Неправильный код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.ConfirmCode.CodeError', 'Wrong code'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.ConfirmCode.TooManyError', 'Слишком много попыток'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.ConfirmCode.TooManyError', 'Too many attempts'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.EmailLogin.FieldsError', 'Поля должны быть заполнены'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.EmailLogin.FieldsError', 'The fields must be filled in'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.EmailLogin.PasswordError', 'Неверный пароль'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.EmailLogin.PasswordError', 'Wrong password'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.InitRegistration.LegalEntity', 'Юридическое лицо'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.InitRegistration.LegalEntity', 'Legal entity'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.InitRegistration.PhysicalEntity', 'Физическое лицо'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.InitRegistration.PhysicalEntity', 'Physical entity'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.IsExistEmail.FoundCustomerError', 'Пользователь с такой электронной почтой не найден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.IsExistEmail.FoundCustomerError', 'No user with this e-mail address was found'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.IsExistPhone.FoundCustomerError', 'Пользователь с таким номером телефона не найден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.IsExistPhone.FoundCustomerError', 'No user with this phone was found'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.RecoveryPassword.FieldsError', 'Не верные входные параметры'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.RecoveryPassword.FieldsError', 'Incorrect input parameters'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.Registration.IsExistCustomerError', 'Пользователь с такой электронной почтой уже существует'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.Registration.IsExistCustomerError', 'A user with this email already exists'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.Registration.BonusCardError', 'Бонусная карта уже используется'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.Registration.BonusCardError', 'The bonus card is already in use'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.SendCode.AuthByCodeActiveError', 'Авторизация по коду не активна'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.SendCode.AuthByCodeActiveError', 'Authorization by code is not active'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.SendCode.PhoneError', 'Введите корректный номер телефона'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.SendCode.PhoneError', 'Enter the correct phone number'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.SendCode.CustomerError', 'Пользователь с телефоном {0} не найден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.SendCode.CustomerError', 'User with phone {0} not found'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.SendCode.SendError', 'Ошибка при отправке кода аутентификации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.SendCode.SendError', 'Error when sending authentication code'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.SendRecoveryPassword.CustomerError', 'Пользователь с данным адресом электронной почты отсутствует'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.SendRecoveryPassword.CustomerError', 'There is no user with this e-mail address'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.SendRecoveryPassword.SendError', 'Не удалось отправить письмо восстановления'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.SendRecoveryPassword.SendError', 'Failed to send recovery email'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'CheckoutData.Validate.NeedLogin', 'Необходимо войти'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'CheckoutData.Validate.NeedLogin', 'You need to login'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'CheckoutData.Validate.NeedLoginOrRegister', 'Необходимо войти или зарегистрироваться'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'CheckoutData.Validate.NeedLoginOrRegister', 'You need to login or register'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.LoginDisplayMode', 'Отображать авторизацию как'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.LoginDisplayMode', 'Display authorisation as'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Auth.ELoginDisplayMode.Page', 'Отдельная страница'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Auth.ELoginDisplayMode.Page', 'Single page'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Auth.ELoginDisplayMode.Modal', 'Модальное окно'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Auth.ELoginDisplayMode.Modal', 'Modal window'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.CheckoutLoginDisplayMode', 'Отображать авторизацию в оформлении заказа как'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.CheckoutLoginDisplayMode', 'Display authorization in checkout as'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Auth.ECheckoutLoginDisplayMode.Page', 'Отдельная страница'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Auth.ECheckoutLoginDisplayMode.Page', 'Single page'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Auth.ECheckoutLoginDisplayMode.Inside', 'Внутри формы оформления заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Auth.ECheckoutLoginDisplayMode.Inside', 'Inside the checkout form'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Auth.ECheckoutLoginDisplayMode.Modal', 'Модальное окно'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Auth.ECheckoutLoginDisplayMode.Modal', 'Modal window'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.PhoneConfirmation.PhoneConfirmed', 'Телефон подтвержден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.PhoneConfirmation.PhoneConfirmed', 'Phone confirmed'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.PhoneConfirmation.PhoneNotConfirmed', 'Телефон не подтвержден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.PhoneConfirmation.PhoneNotConfirmed', 'Phone not confirmed'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Registration.PhoneConfirmation', 'Подтверждение телефона'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Registration.PhoneConfirmation', 'Phone confirmation'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.AuthMethods.Or', 'или'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.AuthMethods.Or', 'or'

GO--

IF NOT EXISTS (SELECT 1
               FROM sys.objects
               WHERE object_id = OBJECT_ID(N'Customers.EmailCodeConfirmation')
                 AND type = 'U')
BEGIN
    CREATE TABLE [Customers].[EmailCodeConfirmation]
    (
        Id                int IDENTITY (1,1) NOT NULL,
        Email             NVARCHAR(100)      NOT NULL,
        Code              NVARCHAR(10)       NULL,
        CodeExpiresAt     DATETIME           NULL,
        Attempts          INT                NOT NULL DEFAULT 0,
        AttemptsExpiresAt DATETIME           NULL,
        IsLocked          BIT                NOT NULL DEFAULT 0,
        LockedUntil       DATETIME           NULL,
        UpdatedAt         DATETIME           NOT NULL DEFAULT GETDATE()
    );
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.SendEmailCodeError', 'Не удалось отправить письмо с кодом'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.SendEmailCodeError', 'Failed to send an e-mail with the code'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Service.ConfirmEmailCodeError', 'Не удалось подтвердить электронную почту'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Service.ConfirmEmailCodeError', 'Failed to confirm email'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.ConfirmEmailCode.EmailError', 'Адрес электронной почты не должен быть пустым'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.ConfirmEmailCode.EmailError', 'The email address should not be empty'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.ConfirmEmailCode.CodeError', 'Код не должен быть пустым'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.ConfirmEmailCode.CodeError', 'The code must not be empty'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.ConfirmEmailCode.CustomerError', 'Пользователь не найден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.ConfirmEmailCode.CustomerError', 'User not found'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.EmailConfirmationService.Confirm.CodeError', 'Неправильный код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.EmailConfirmationService.Confirm.CodeError', 'Wrong code'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.EmailConfirmationService.Confirm.CodeLifePeriodError', 'Код устарел'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.EmailConfirmationService.Confirm.CodeLifePeriodError', 'The code is out of date'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.Code', 'Код подтверждения'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.Code', 'Confirmation code'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.ConfirmCode', 'Подтвердить'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.ConfirmCode', 'Confirm'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.SendCodeAgain', 'Выслать код повторно'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.SendCodeAgain', 'Send code again'

GO--

IF NOT EXISTS (SELECT 1
               FROM [Settings].[MailFormatType]
               WHERE [MailType] = 'OnConfirmation')
BEGIN
INSERT INTO [Settings].[MailFormatType] ([TypeName], [SortOrder], [Comment], [MailType])
VALUES ('При подтверждении адреса электронной почты', 450, 'Письмо с кодом безопасности (#CODE#, #LOGO#)', 'OnConfirmation')
END

GO--

IF NOT EXISTS (SELECT 1
               FROM [Settings].[MailFormat]
               WHERE [MailFormatTypeId] = (SELECT TOP(1) MailFormatTypeID FROM [Settings].[MailFormatType] WHERE [MailType] = 'OnConfirmation'))
BEGIN
INSERT INTO [Settings].[MailFormat] ([FormatName],
    [FormatText],
    [SortOrder],
    [Enable],
    [AddDate],
    [ModifyDate],
    [FormatSubject],
[MailFormatTypeId])
VALUES ('При подтверждении адреса электронной почты',
    '<div style="color: #4c4f56; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">
<div class="header" style="border-bottom: 1px solid #ededed; display: table; margin-bottom: 25px; padding-bottom: 25px; width: 100%;">
<div class="logo" style="display: table-cell; text-align: left; vertical-align: middle;">
    #LOGO#
</div>
<div class="phone" style="display: table-cell; text-align: right; vertical-align: middle;">
    <div class="tel" style="font-size: 26px; font-weight: bold; line-height: 1; margin-bottom: 5px;">
    </div>
<div class="inform" style="font-size: 12px;">
    &nbsp;
</div>
</div>
</div>
<div class="data" style="display: table; width: 100%;">
<div class="data-cell" style="display: table-cell; padding: 0; padding-right: 1%; width: 24%;">
<div class="l-row">
    <div class="l-name vi cs-light" style="color: #acacac; display: inline-block; margin: 5px 0; padding-right: 15px; width: 80px; vertical-align: middle;">
        Ваш код подтверждения:
    </div>
    <div class="l-value vi" style="display: inline-block; margin: 5px 0;">
        #CODE#
    </div>
</div>
</div>
</div>',
    1640,
    1,
    GETDATE(),
    GETDATE(),
    'Ваш код безопасности',
    (SELECT TOP(1) MailFormatTypeID FROM [Settings].[MailFormatType] WHERE [MailType] = 'OnConfirmation'))
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.Message', 'Отправить сообщение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.Message', 'Send a message'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Triggers.ETriggerActionType.Message', 'Отправить сообщение'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Triggers.ETriggerActionType.Message', 'Send a message'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.Authorization.Title', 'Авторизация'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.Authorization.Title', 'Authorization'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.Authorization.SkipEmailConfirmation', 'Не требовать email при входе в личный кабинет через телеграм'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.Authorization.SkipEmailConfirmation', 'Do not require email when logging into the personal account via Telegram'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.AuthorizationData.Error', 'Не удалось обработать данные'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.AuthorizationData.Error', 'Failed to process data'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.Registration.ErrorCustomerType', 'Тип пользователя не доступен'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.Registration.ErrorCustomerType', 'User type not available'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.PhoneConfirmation.Service.InitError', 'Не удалось получить данные'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.PhoneConfirmation.Service.InitError', 'Failed to retrieve data'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.ConfirmationDescription', 'Мы отправили код подтверждения на вашу электронную почту {{email}}.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.ConfirmationDescription', 'We have sent a confirmation code to your email {{email}}.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.ConfirmationTitle', 'Введите код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.ConfirmationTitle', 'Enter the code'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.Email', 'Электронная почта'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.Email', 'Email'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.AuthCaptcha.Error', 'Капча не пройдена'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.AuthCaptcha.Error', 'Captcha failed'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.SendCode.Success', 'Код успешно отправлен'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.SendCode.Success', 'The code has been sent successfully'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Login.Email.SendCode.Error', 'Не удалось отправить код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Login.Email.SendCode.Error', 'Could not send the code'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.SendEmailCode.EmptyEmailError', 'Адрес электронной почты не должен быть пустой'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.SendEmailCode.EmptyEmailError', 'The email address should not be empty'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.SendEmailCode.EmptyCustomerError', 'Отсутствует пользователь с данной электронной почтой'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.SendEmailCode.EmptyCustomerError', 'There is no user with this email address'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.SendEmailCode.SendEmailError', 'Произошла ошибка во время отправки письма'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.SendEmailCode.SendEmailError', 'An error occurred while sending an email'

GO--

EXEC [Settings].[sp_AddUpdateInternalSetting] 'MaxSocialMedia', 'https://max.ru/'

GO--

DELETE FROM [Settings].[TemplateSettings] WHERE [Template] = 'Neo' AND [Name] = 'ShowTabsInProductQuickView'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Builder.ShowTabsInProductQuickView', 'Отображать табы в быстром просмотре'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Builder.ShowTabsInProductQuickView', 'Show tabs in quick view'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Catalog.ShowTabsInProductQuickView', 'Отображать табы в быстром просмотре'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Catalog.ShowTabsInProductQuickView', 'Show tabs in quick view'

DELETE FROM [Settings].[TemplateSettings] WHERE [Template] = 'Neo' AND [Name] = 'ShowRelatedProductInProductQuickView'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Builder.ShowRelatedProductInProductQuickView', 'Отображать блок с дополнительными товарами в быстром просмотре'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Builder.ShowRelatedProductInProductQuickView', 'Display a block with additional products in quick view'                                          
                                          
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Catalog.ShowRelatedProductInProductQuickView', 'Отображать блок с дополнительными товарами в быстром просмотре'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Catalog.ShowRelatedProductInProductQuickView', 'Display a block with additional products in quick view'

DELETE FROM [Settings].[TemplateSettings] WHERE [Template] = 'Neo' AND [Name] = 'ShowShippingsInProductQuickView'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Builder.ShowShippingsInProductQuickView', 'Отображать блок доставок в быстром просмотре'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Builder.ShowShippingsInProductQuickView', 'Display a block of shippings in quick view'
                                          
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Catalog.ShowShippingsInProductQuickView', 'Отображать блок доставок в быстром просмотре'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Catalog.ShowShippingsInProductQuickView', 'Display a block of shippings in quick view'
    
GO--


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Users.SignInByEmailApi.EmailByCodeIsProhibited', 'Авторизация по эл. почте с кодом подтверждения не активна'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Users.SignInByEmailApi.EmailByCodeIsProhibited', 'Email authorization with confirmation code is not active'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Users.SignInByEmailApi.WrongEmail', 'Неправильная электронная почта'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Users.SignInByEmailApi.WrongEmail', 'Incorrect email'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Users.SignInByEmailApi.SendEmailError', 'Ошибка при отправке письма'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Users.SignInByEmailApi.SendEmailError', 'Error sending email'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Users.SignInByEmailApi.WrongCode', 'Укажите код подтверждения'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Users.SignInByEmailApi.WrongCode', 'Enter the confirmation code'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Users.EmailCodeAuthorization', 'Авторизация (или регистрация) по коду с электронной почты. 1. Отсылается код на электронную почту.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Users.EmailCodeAuthorization', 'Authorization (or registration) by code from email. 1. Sending code on email.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Users.EmailCodeAuthorization.TwoRequests', 'Авторизация по коду с электронной почты делается двумя запросами:'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Users.EmailCodeAuthorization.TwoRequests', 'Authorization by code from email is done with two requests:'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Users.EmailCodeAuthorization.FirstRequest', '1) /api/users/signInByEmail - пользователю отсылается код на электронную почту. Его нужно ввести в течении 10 мин.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Users.EmailCodeAuthorization.FirstRequest', '1) /api/users/signInByEmail - code is sent to the user''s email address. It must be entered within 10 minutes.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Users.EmailCodeAuthorization.SecondRequest', '2) /api/users/signInByEmailConfirmCode - проверяется введенный пользователем код, если верен, то возвращается авторизованный покупатель, userKey, userId'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Users.EmailCodeAuthorization.SecondRequest', '2) /api/users/signInByEmailConfirmCode - code entered by the user is verified. If it is correct, the authorized buyer, userKey, and userId are returned.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Users.EmailAuthorizationChecking', 'Авторизация (или регистрация) по коду с электронной почты. 2. Проверяется введенный код с электронной почты.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Users.EmailAuthorizationChecking', 'Authorization (or registration) by code from email. 2. Confirm code from email.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Index.AlternativeLogo', 'Альтернитивный логотип'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Index.AlternativeLogo', 'Alternative logo'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Index.UseAlternativeLogo', 'Использовать альтернативный логотип'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Index.UseAlternativeLogo', 'Use an alternative logo'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.EmailConfirmationService.Confirm.CodeLockedError', 'Слишком много попыток. Попробуйте позже.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.EmailConfirmationService.Confirm.CodeLockedError', 'Too many attempts, try later.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.Registration.ConfirmationError', 'Адрес электронной почты не подтвержден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.Registration.ConfirmationError', 'Email confirmation has not been completed'

GO--
                                          
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.ParcelStatus', 'Текущий статус посылки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.ParcelStatus', 'Current status of the parcel'
                                          
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.HideHistory', 'Скрыть историю'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.HideHistory', 'Hide history'
                                          
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.ShowAll', 'Показать все'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.ShowAll', 'Show all'
                                          
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.ShowOnMap', 'Показать на карте'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.ShowOnMap', 'Show on map'
                                          
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.OpeningHours', 'Время работы'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.OpeningHours', 'Opening hours'
                                          
GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Users.SignInByEmailApi.TooManyRequests', 'Слишком много попыток. Попробуйте позже.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Users.SignInByEmailApi.TooManyRequests', 'Too many attempts, try later.'

GO--


IF NOT EXISTS (SELECT 1
               FROM sys.objects
               WHERE object_id = OBJECT_ID(N'Customers.EmailCodeConfirmationIpRateLimit')
                 AND type = 'U')
BEGIN
    CREATE TABLE [Customers].[EmailCodeConfirmationIpRateLimit]
    (
        [Ip]              [nvarchar](50) NOT NULL,
        [LastRequestAt]   [datetime]     NULL,
        [MinuteCount]     [int]          NOT NULL,
        [TenMinutesCount] [int]          NOT NULL,
        [BlockedUntil]    [datetime]     NULL,
        [UpdatedAt]       [datetime]     NOT NULL,
        CONSTRAINT [PK_EmailCodeConfirmationIpRateLimit] PRIMARY KEY CLUSTERED
            (
                [Ip] ASC
            ) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    ) ON [PRIMARY]
END

GO--

IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints 
    WHERE name = 'DF_EmailCodeConfirmationIpRateLimit_MinuteCount'
)
BEGIN
    ALTER TABLE [Customers].[EmailCodeConfirmationIpRateLimit]
        ADD CONSTRAINT [DF_EmailCodeConfirmationIpRateLimit_MinuteCount]
        DEFAULT ((0)) FOR [MinuteCount];
END

GO--

IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints 
    WHERE name = 'DF_EmailCodeConfirmationIpRateLimit_TenMinutesCount'
)
BEGIN
    ALTER TABLE [Customers].[EmailCodeConfirmationIpRateLimit]
        ADD CONSTRAINT [DF_EmailCodeConfirmationIpRateLimit_TenMinutesCount]
        DEFAULT ((0)) FOR [TenMinutesCount];
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.News.HideDate', 'Скрывать дату публикации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.News.HideDate', 'Hide publish date'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Cards.LastPurchase.OrderCost', 'Стоимость продажи'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Cards.LastPurchase.OrderCost', 'Sale cost'

GO--

IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'PurchaseFullAmount'
          AND Object_ID = Object_ID(N'Bonus.Purchase'))
BEGIN
	ALTER TABLE [Bonus].[Purchase]
		ALTER COLUMN [PurchaseFullAmount] [money] NULL;
	EXEC sp_rename 'Bonus.Purchase.PurchaseFullAmount', 'PurchaseFullAmountObsolete', 'COLUMN';
END

GO--

ALTER TABLE [Order].[Order]
	ALTER COLUMN [BonusCardNumber] [nvarchar](255) NULL

GO--

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'BonusSystemOfCard'
          AND Object_ID = Object_ID(N'Order.Order'))
BEGIN
	ALTER TABLE [Order].[Order]
		ADD [BonusSystemOfCard] [nvarchar](255) NULL
END

GO--

IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE Name = N'BonusCardNumber'
          AND Object_ID = Object_ID(N'Customers.Customer'))
BEGIN
	EXEC sp_rename 'Customers.Customer.BonusCardNumber', 'BonusCardNumberObsolete', 'COLUMN';
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.GetBonusSystem.Title', 'Бонусная система'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.GetBonusSystem.Title', 'Bonus system'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.GetBonusSystem.Header', 'Бонусная система'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.GetBonusSystem.Header', 'Bonus system'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.GetBonusSystem.Message', 'Бонусная система "{0}" не используется.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.GetBonusSystem.Message', 'The bonus system "{0}" is not used.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.GetBonusSystem.ButtonActivate', 'Переключиться на "{0}"'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.GetBonusSystem.ButtonActivate', 'Switch to "{0}"'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.System.InternalBonusSystem', 'Внутренняя бонусная система'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.System.InternalBonusSystem', 'Internal bonus system'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.BonusSystemInactive.AreYouSureWantActivate', 'Вы уверены, что хотите переключиться на указанную бонусную?'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.BonusSystemInactive.AreYouSureWantActivate', 'Are you sure you want to switch to the specified bonus card?'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.BonusSystemInactive.BonusSystem', 'Бонусная система'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.BonusSystemInactive.BonusSystem', 'Bonus system'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.BonusSystemInactive.PopupInactive', 'Бонусная система не используется.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.BonusSystemInactive.PopupInactive', 'Bonus system is not used.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.OrderItemsSummary.BonusesToCardAfter', 'Бонусов будет начислено на карту'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.OrderItemsSummary.BonusesToCardAfter', 'Bonus will be credited to the card'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.OrderItemsSummary.BonusesToCardNeed', 'Бонусов к начислению'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.OrderItemsSummary.BonusesToCardNeed', 'Bonus to be credited'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.BonusesToCard', 'Бонусов зачислено на карту:'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.BonusesToCard', 'Bonuses credited to card:'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.BonusesToCardAfter', 'Бонусов будет начислено на карту:'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.BonusesToCardAfter', 'Bonus will be credited to the card:'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.BonusesToCardNeed', 'Бонусов к начислению:'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.BonusesToCardNeed', 'Bonus to be credited:'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Order.BonusesToCardAfterPayment', 'Бонусов будет начислено на карту<br> после оплаты заказа:'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Order.BonusesToCardAfterPayment', 'Bonus will be credited to the card<br> after payment of the order:'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Bonuses.ExternalBonus.AddCard.Error.UserNotFound', 'Покупатель не найден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Bonuses.ExternalBonus.AddCard.Error.UserNotFound', 'The buyer is not found'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Bonuses.ExternalBonus.AddCard.Error.BonusSystemIsNotActive', 'Бонусная деактивирована'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Bonuses.ExternalBonus.AddCard.Error.BonusSystemIsNotActive', 'Bonus system is deactivated'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Bonuses.ExternalBonus.AddCard.Error.BonusSystemCanNotCreateCard', 'Бонусная не может создавать карты'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Bonuses.ExternalBonus.AddCard.Error.BonusSystemCanNotCreateCard', 'Bonus system can not create cards'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Bonuses.ExternalBonus.AddCard.Error.IsNotCreateCard', 'Не удалось создать бонусную карту'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Bonuses.ExternalBonus.AddCard.Error.IsNotCreateCard', 'Failed to create a bonus card'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ExternalBonusSystem.BonusSystem', 'Бонусная система'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ExternalBonusSystem.BonusSystem', 'Bonus system'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ExternalBonusSystem.AreYouSureWantCreateCard', 'Создать бонусную карту покупателю?'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ExternalBonusSystem.AreYouSureWantCreateCard', 'Create a bonus card for the buyer?'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ExternalBonusSystem.IsNotCreateCard', 'Не удалось создать бонусную карту'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ExternalBonusSystem.IsNotCreateCard', 'Failed to create a bonus card'

GO--

IF NOT EXISTS (SELECT * FROM [Settings].[Settings] WHERE [Name] = 'InternalBonusAppActive')
	AND EXISTS (SELECT * FROM [Settings].[Settings] WHERE [Name] = 'BonusAppActive')
BEGIN
	INSERT INTO [Settings].[Settings] ([Name],[Value])
	SELECT TOP 1 'InternalBonusAppActive',[Value] FROM [Settings].[Settings] WHERE [Name] = 'BonusAppActive'
END

GO--

DECLARE @ResourceValue NVARCHAR(MAX);
SET @ResourceValue = (SELECT TOP(1) [ResourceValue] FROM [Settings].[Localization] WHERE LanguageId=1 and ResourceKey='Admin.Customers.ViewBonusCard.CardNumber')
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Orders.ClientBonusCard.CardNumber', @ResourceValue

SET @ResourceValue = (SELECT TOP(1) [ResourceValue] FROM [Settings].[Localization] WHERE LanguageId=2 and ResourceKey='Admin.Customers.ViewBonusCard.CardNumber')
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Orders.ClientBonusCard.CardNumber', @ResourceValue

SET @ResourceValue = (SELECT TOP(1) [ResourceValue] FROM [Settings].[Localization] WHERE LanguageId=1 and ResourceKey='Admin.Customers.ViewBonusCard.Balance')
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Orders.ClientBonusCard.Balance', @ResourceValue

SET @ResourceValue = (SELECT TOP(1) [ResourceValue] FROM [Settings].[Localization] WHERE LanguageId=2 and ResourceKey='Admin.Customers.ViewBonusCard.Balance')
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Orders.ClientBonusCard.Balance', @ResourceValue

SET @ResourceValue = (SELECT TOP(1) [ResourceValue] FROM [Settings].[Localization] WHERE LanguageId=1 and ResourceKey='Admin.Customers.ViewBonusCard.Grade')
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Orders.ClientBonusCard.Grade', @ResourceValue

SET @ResourceValue = (SELECT TOP(1) [ResourceValue] FROM [Settings].[Localization] WHERE LanguageId=2 and ResourceKey='Admin.Customers.ViewBonusCard.Grade')
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Orders.ClientBonusCard.Grade', @ResourceValue

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'TopPanel.AttentionTechDomain', 'Внимание: сейчас вы используете технический домен.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'TopPanel.AttentionTechDomain', 'Please note: You are currently using a technical domain.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'TopPanel.LinkDomain', 'Чтобы сайт открывался по вашему собственному домену, его нужно привязать в '
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'TopPanel.LinkDomain', 'In order for the site to open on your own domain, it needs to be linked to'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'TopPanel.LinkDomain.Settings', 'настройках'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'TopPanel.LinkDomain.Settings', 'settings'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MobileOverlap.MobileVersionAgree', 'Хотите перейти на мобильную версию сайта?'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MobileOverlap.MobileVersionAgree', 'Would you like to switch to the mobile version of the site?'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MobileOverlap.MobileVersionAgree.Yes', 'Да, перейти'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MobileOverlap.MobileVersionAgree.Yes', 'Yes, go ahead'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MobileOverlap.MobileVersionAgree.No', 'Остаться на полной версии'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MobileOverlap.MobileVersionAgree.No', 'Stay on the full version'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MobileOverlap.DesktopVersionAgree', 'Хотите перейти на полную версию сайта?'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MobileOverlap.DesktopVersionAgree', 'Do you want to switch to the full version of the site?'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MobileOverlap.DesktopVersionAgree.Yes', 'Да, перейти'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MobileOverlap.DesktopVersionAgree.Yes', 'Yes, go ahead'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MobileOverlap.DesktopVersionAgree.No', 'Нет, остаться на мобильной версии'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MobileOverlap.DesktopVersionAgree.No', 'No, stay on the mobile version'

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginTop' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ADD MarginTop INT NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginTop' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    UPDATE [CMS].[Carousel]
    SET MarginTop = 0
    WHERE MarginTop IS NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginTop' AND object_id = OBJECT_ID(N'[CMS].[Carousel]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ALTER COLUMN MarginTop INT NOT NULL
END

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginBottom' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ADD MarginBottom INT NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginBottom' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    UPDATE [CMS].[Carousel]
    SET MarginBottom = 0
    WHERE MarginBottom IS NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginBottom' AND object_id = OBJECT_ID(N'[CMS].[Carousel]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ALTER COLUMN MarginBottom INT NOT NULL
END

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginLeft' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ADD MarginLeft INT NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginLeft' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    UPDATE [CMS].[Carousel]
    SET MarginLeft = 0
    WHERE MarginLeft IS NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginLeft' AND object_id = OBJECT_ID(N'[CMS].[Carousel]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ALTER COLUMN MarginLeft INT NOT NULL
END

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginRight' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ADD MarginRight INT NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginRight' AND object_id = OBJECT_ID(N'[CMS].[Carousel]'))
BEGIN
    UPDATE [CMS].[Carousel]
    SET MarginRight = 0
    WHERE MarginRight IS NULL
END

GO--
IF EXISTS (SELECT * FROM sys.columns WHERE name = N'MarginRight' AND object_id = OBJECT_ID(N'[CMS].[Carousel]') AND is_nullable = 1)
BEGIN
    ALTER TABLE [CMS].[Carousel]
    ALTER COLUMN MarginRight INT NOT NULL
END

GO--

IF EXISTS (SELECT *
           FROM sys.objects
           WHERE object_id = OBJECT_ID(N'[CMS].[sp_InsertCarousel]')
             AND type = 'P')
    BEGIN
        DROP PROCEDURE [CMS].[sp_InsertCarousel]
    END

GO--

IF EXISTS (SELECT *
           FROM sys.objects
           WHERE object_id = OBJECT_ID(N'[CMS].[sp_UpdateCarousel]')
             AND type = 'P')
    BEGIN
        DROP PROCEDURE [CMS].[sp_UpdateCarousel]
    END

GO--

IF EXISTS (SELECT *
           FROM sys.objects
           WHERE object_id = OBJECT_ID(N'[CMS].[sp_GetCarousel]')
             AND type = 'P')
    BEGIN
        DROP PROCEDURE [CMS].[sp_GetCarousel]
    END

GO--

IF EXISTS (SELECT *
           FROM sys.objects
           WHERE object_id = OBJECT_ID(N'[CMS].[sp_DeleteCarousel]')
             AND type = 'P')
    BEGIN
        DROP PROCEDURE [CMS].[sp_DeleteCarousel]
    END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditCarousel.Margins', 'Отступы'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditCarousel.Margins', 'Margins'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditCarousel.Top', 'Сверху'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditCarousel.Top', 'Top'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditCarousel.Bottom', 'Снизу'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditCarousel.Bottom', 'Bottom'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditCarousel.Left', 'Слева'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditCarousel.Left', 'Left'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditCarousel.Right', 'Справа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditCarousel.Right', 'Right'

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'Telegram' AND object_id = OBJECT_ID(N'[Catalog].[WarehouseGroup]'))
BEGIN
    ALTER TABLE [Catalog].[WarehouseGroup]
    ADD Telegram [nvarchar](255) NULL
END

GO--


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Crm.EOrderFieldType.ReferralBonusAccountOrderAmountPercentage', 'Бонусный счет реферала в процентах от суммы заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Crm.EOrderFieldType.ReferralBonusAccountOrderAmountPercentage', 'Referral bonus account as a percentage of the order amount'

GO--

DELETE FROM [Settings].[Localization] where ResourceKey = 'MyAccount.BringFriend.BringFriendGetBonuses'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.AddEditCarousel.BlockSizeInPercent', 'Размер блока в % для десктопной версии';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.AddEditCarousel.BlockSizeInPercent', 'Block size in % for desktop';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Tasks.ModalEditTaskCtrl.Confirm', 'Подтвердить'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Tasks.ModalEditTaskCtrl.Confirm', 'Confirm'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Tasks.ModalEditTaskCtrl.MakeYourselfManager', 'Сделать себя исполнителем?'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Tasks.ModalEditTaskCtrl.MakeYourselfManager', 'Make yourself a performer?'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.RecoveryPassword.TheUserIsLoggedIn', 'Действует активная сессия'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.RecoveryPassword.TheUserIsLoggedIn', 'There is an active session'

GO--

UPDATE [CMS].[Menu]
SET Enabled = 0
WHERE MenuItemUrlPath like 'registration%'
   OR MenuItemUrlPath like 'forgotpassword%'
   OR MenuItemUrlPath like '/registration%'
   OR MenuItemUrlPath like '/forgotpassword%'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'UserLayout.Close.AriaLabel', 'Закрыть'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'UserLayout.Close.AriaLabel', 'Close'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Mobile.UserLayout.Close.AriaLabel', 'Закрыть'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Mobile.UserLayout.Close.AriaLabel', 'Close'

GO--

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[Catalog].[OfferPriceRule]') AND name = N'IX_OfferPriceRule_OfferId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_OfferPriceRule_OfferId] ON [Catalog].[OfferPriceRule]
    (
        [OfferId] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
END

GO--


EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Rules.Index.CancellationsBonusDescription', 'Аннулирование действует только для бонусов у которых нет даты окончания. <br>Дата аннулирования определяется исходя из даты начала действия бонусов, если она не указана, то от даты начисления.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Rules.Index.CancellationsBonusDescription', 'Cancellation only applies to bonuses that don''t have expiration dates. <br>The bonus cancellation date is determined based on the bonus start date; if no end date is specified, it''s determined based on the bonus accrual date.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Rules.Index.InstructionsRules', 'Инструкция. Правила'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Rules.Index.InstructionsRules', 'Instruction. Rules'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Common.TopMenu.ShopWindow', 'Посмотреть витрину'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1,'Admin.ExportFeed.SettingsYandex.PriceRule.Help', '<p>Если выбран тип цены, у которого <b>не указана</b> настройка "Рассчитывать цену автоматически", то будут экспортироваться только товары, у которых есть цены с данным типом. Будет выгружаться указанная цена без скидок.</p> <p>Если выбран тип цены, у которого <b>указана</b> настройка "Рассчитывать цену автоматически", то будут экспортироваться все товары. Если у товара указана цена для данного типа, то будет выгружать она. Иначе цена будет автоматически рассчитана и скидки будут учитываться, если выбрано "Учитывать скидки"</p>'
EXEC [Settings].[sp_AddUpdateLocalization] 2,'Admin.ExportFeed.SettingsYandex.PriceRule.Help', '<p>If you select a price type that does not have the “Calculate price automatically” setting selected, only products with prices of this type will be exported. The specified price will be exported without discounts. </p> <p>If you select a price type that has the “Calculate price automatically” setting <b>enabled</b>, all products will be exported, prices will be calculated automatically, discounts will be taken into account if “Take discounts into account” is selected.</p>'

EXEC [Settings].[sp_AddUpdateLocalization] 1,'Admin.ExportFeed.SettingsYandex.PriceRuleIdForOldPrice.Help', 'Если у товара есть цена для данного типа, то в тег olprice будет выгружаться цена с выбранным типом цен без скидок товара. Если у типа цен указана настройка "Рассчитывать цену автоматически" и у товара нет цены с данным типом цен, то она рассчитается автоматически. Иначе старая цена будет считаться от обычной цены товара.'
EXEC [Settings].[sp_AddUpdateLocalization] 2,'Admin.ExportFeed.SettingsYandex.PriceRuleIdForOldPrice.Help', 'If the product has a price for this type, the olprice tag will display the price with the selected price type without discounts. If the price type has the “Calculate price automatically” setting and the product does not have a price with this price type, it will be calculated automatically. Otherwise, the old price will be calculated based on the regular price of the product.'

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'DelayedTriggersStart' AND object_id = OBJECT_ID(N'[Customers].[Customer]'))
BEGIN
    ALTER TABLE Customers.Customer ADD
        DelayedTriggersStart bit NULL
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Social.LinkTwitterActive', 'X'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Social.LinkTwitterActive', 'X'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Social.WidgetTwitterActive', 'X'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Social.WidgetTwitterActive', 'X'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Landings.Views.Blocks.Config.ContactsCenterSimple.TwitterText', 'X';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Landings.Views.Blocks.Config.ContactsCenterSimple.TwitterText', 'X';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.ClosingReceipt.OrderNotFound', 'Заказ не найден.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.ClosingReceipt.OrderNotFound', 'Order not found.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.ClosingReceipt.IsAlreadyClosed', 'Закрывающий чек уже был сформирован.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.ClosingReceipt.IsAlreadyClosed', 'The closing receipt has already been generated.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.ClosingReceipt.OrderIsNotPayed', 'Заказ не оплачен.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.ClosingReceipt.OrderIsNotPayed', 'Order is not payed.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.ClosingReceipt.PaymentMethodNotFound', 'Для заказа не указан метод оплаты, либо он уже удален.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.ClosingReceipt.PaymentMethodNotFound', 'Payment method is not specified for the order, or it has already been deleted.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.ClosingReceipt.PaymentMethodNotSupportedClosingReceipt', 'Метод оплаты не поддерживает формирование закрывающего чека.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.ClosingReceipt.PaymentMethodNotSupportedClosingReceipt', 'Payment method does not support the creation of a closing receipt.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.ClosingReceipt.OrderStateDoNotMatch', 'Заказ имеет несовместимые изменения после оплаты для формирования закрывающего чека.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.ClosingReceipt.OrderStateDoNotMatch', 'Order has incompatible changes after payment to generate a closing receipt.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.ClosingReceipt.NeedMarking', 'В заказе не хватает маркировки.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.ClosingReceipt.NeedMarking', 'The order lacks marking.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.Tinkoff.SendReceiptDataIsDisabled', 'Отключена опция отправки данных для чека.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.Tinkoff.SendReceiptDataIsDisabled', 'The option to send data for the receipt is disabled.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.Tinkoff.PaymentIdNotFound', 'Нет идентификатора платежа из системы банка.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.Tinkoff.PaymentIdNotFound', 'There is no payment ID from the bank''s system.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.Tinkoff.PaymentIsNotConfirmed', 'Платеж в системе банка не в статусе "CONFIRMED".'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.Tinkoff.PaymentIsNotConfirmed', 'The payment in the bank''s system is not in the "CONFIRMED" status.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.Tinkoff.SomethingWentWrong', 'Что-то пошло не так.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.Tinkoff.SomethingWentWrong', 'Something went wrong.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.YandexKassa.SendReceiptDataIsDisabled', 'Отключена опция отправки данных для чека.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.YandexKassa.SendReceiptDataIsDisabled', 'The option to send data for the receipt is disabled.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.YandexKassa.PaymentIdNotFound', 'Нет идентификатора платежа из системы банка.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.YandexKassa.PaymentIdNotFound', 'There is no payment ID from the bank''s system.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.YandexKassa.PaymentIsNotConfirmed', 'Платеж в системе банка не в статусе "succeeded".'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.YandexKassa.PaymentIsNotConfirmed', 'The payment in the bank''s system is not in the "succeeded" status.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.YandexKassa.SomethingWentWrong', 'Что-то пошло не так.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.YandexKassa.SomethingWentWrong', 'Something went wrong.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.Robokassa.SendReceiptDataIsDisabled', 'Отключена опция отправки данных для чека.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.Robokassa.SendReceiptDataIsDisabled', 'The option to send data for the receipt is disabled.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Payment.Robokassa.SomethingWentWrong', 'Что-то пошло не так.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Payment.Robokassa.SomethingWentWrong', 'Something went wrong.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.OrderItemsSummary.CloseReceipt', 'Сформировать закрывающий чек'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.OrderItemsSummary.CloseReceipt', 'Generate a closing receipt'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Order.CloseReceipt', 'Закрывающий чек'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Order.CloseReceipt', 'Closing receipt'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Order.CreateClosingReceipt', 'Сформировать закрывающий чек?'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Order.CreateClosingReceipt', 'Сформировать закрывающий чек?'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Order.CreatedClosingReceipt', 'Закрывающий чек сформирован.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Order.CreatedClosingReceipt', 'The closing receipt has been generated.'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Order.CloseReceiptError', 'Неудалось сформировать чек.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Order.CloseReceiptError', 'Failed to generate a receipt.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Triggers.ETriggerActionType.CloseReceipt', 'Сформировать закрывающий чек';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Triggers.ETriggerActionType.CloseReceipt', 'Generate a closing receipt';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.CloseReceipt', 'Сформировать закрывающий чек'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.CloseReceipt', 'Generate a closing receipt'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Triggers.Action.CloseReceipt.UnknownResult', 'Неизвестный результат формировании закрывающего чека.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Triggers.Action.CloseReceipt.UnknownResult', 'Unknown result of the closing receipt formation.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Triggers.EditTrigger.CloseReceipt.AvailablePayments', 'Поддерживают следующие модули оплаты'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Triggers.EditTrigger.CloseReceipt.AvailablePayments', 'The following payment modules are supported'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Triggers.Action.ErrorCloseReceipt.DefaultEmailSubject', 'Ошибка при формировании закрывающего чека для заказа №#Number#'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Triggers.Action.ErrorCloseReceipt.DefaultEmailSubject', 'Error when forming the closing receipt for order no.#Number#'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Triggers.Action.ErrorCloseReceipt.DefaultEmailBody', '<p>Не удалось сформировать закрывающий чек для заказа №#Number# в платежной системе #PaymentMethod#.</p><p>Ошибка: #ErrorMessage#</p>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Triggers.Action.ErrorCloseReceipt.DefaultEmailBody', '<p>It was not possible to generate a closing receipt for order no.#Number# in payment system of #PaymentMethod#.</p><p>Error: #ErrorMessage#</p>'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Orders.Order.ClosingReceiptStatus', 'Статус закрывающего чека'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Orders.Order.ClosingReceiptStatus', 'Status of closing receipt'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Orders.Order.ClosingReceiptMessage', 'Ошибка закрывающего чека'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Orders.Order.ClosingReceiptMessage', 'Error of closing receipt'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Orders.ClosingReceiptStatus.None', 'Нет'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Orders.ClosingReceiptStatus.None', 'Нет'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Orders.ClosingReceiptStatus.Success', 'Успешно'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Orders.ClosingReceiptStatus.Success', 'Success'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Orders.ClosingReceiptStatus.Error', 'Ошибка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Orders.ClosingReceiptStatus.Error', 'Error'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Orders.ClosingReceiptStatus.NeedMarking', 'В ожидании маркировки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Orders.ClosingReceiptStatus.NeedMarking', 'Need marking'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Orders.OrderInfo.ClosingReceipt.Title', 'Закрывающий чек'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Orders.OrderInfo.ClosingReceipt.Title', 'Closing receipt'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Orders.OrderInfo.ClosingReceipt.Status', 'Статус:'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Orders.OrderInfo.ClosingReceipt.Status', 'Status:'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Orders.OrderInfo.ClosingReceipt.Error', 'Ошибка:'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Orders.OrderInfo.ClosingReceipt.Error', 'Error:'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Orders.ClosingReceiptStatus', 'Статус закрывающего чека'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Orders.ClosingReceiptStatus', 'Status of closing receipt'

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'ClosingReceiptStatus' AND object_id = OBJECT_ID(N'[Order].[Order]'))
BEGIN
    ALTER TABLE [Order].[Order]
    ADD [ClosingReceiptStatus] INT NULL
END

GO--

IF EXISTS (SELECT * FROM [Order].[Order] WHERE [ClosingReceiptStatus] IS NULL)
BEGIN
    UPDATE [Order].[Order]
    SET [ClosingReceiptStatus] = 0
    WHERE [ClosingReceiptStatus] IS NULL
END

GO--

ALTER TABLE [Order].[Order]
ALTER COLUMN [ClosingReceiptStatus] INT NOT NULL

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'ClosingReceiptMessage' AND object_id = OBJECT_ID(N'[Order].[Order]'))
BEGIN
    ALTER TABLE [Order].[Order]
    ADD [ClosingReceiptMessage] nvarchar(MAX) NULL
END

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'OrderStateOfClosingReceipt' AND object_id = OBJECT_ID(N'[Order].[Order]'))
BEGIN
    ALTER TABLE [Order].[Order]
    ADD [OrderStateOfClosingReceipt] nvarchar(MAX) NULL
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Product.Edit.IsMarkingRequired', 'Подлежит обязательной маркировке «Честный знак»'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Product.Edit.IsMarkingRequired', 'Subject to mandatory marking "Honest sign"'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Product.Edit.IsMarkingRequiredHint1', 'Товар подлежит'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Product.Edit.IsMarkingRequiredHint1', 'The product is subject to'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Product.Edit.IsMarkingRequiredHint2', 'маркировке «Честный ЗНАК»'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Product.Edit.IsMarkingRequiredHint2', 'marking "Honest SIGN"'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Product.Edit.IsMarkingRequiredHint3', 'В элементе cargo-types (YML) будет указано значение CIS_REQUIRED'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Product.Edit.IsMarkingRequiredHint3', 'The cargo-types element (YML) will have the value CIS_REQUIRED'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Product.Edit.IsMarkingRequiredHint4', 'Если в заказ добавлен товар с параметром "Обязательная маркировка", то в карточке заказа у этого товара будет отображаться
                        иконка "Честного Знака"'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Product.Edit.IsMarkingRequiredHint4', 'If a product with the "Mandatory marking" parameter is added to the order, then the "Honest Sign" icon will be displayed in the order card for this product'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Products.GetProductBySlug', 'Получить товар по url'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Products.GetProductBySlug', 'Get product by url'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Products.GetProduct', 'Получить товар по id'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Products.GetProduct', 'Get product by id'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsCatalog.CatalogCommon.ShowQuickViewNote', 'Данная настройка позволяет просмотреть кратко карточку товара, не переходя вовнутрь.<br/>Настройка влияет на полную и мобильную версии сайта.<br/><br/>Подробнее: <br/> <a href="https://www.advantshop.net/help/pages/catalog-view#11" target="_blank">Быстрый просмотр товара</a>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsCatalog.CatalogCommon.ShowQuickViewNote', 'This setting allows you to view a short product card without going inside.</br>The setting affects the full and mobile versions of the site.<br/><br/>More details: <br/> <a href = "https://www.advantshop.net/help/pages/catalog-view#11 "target =" _ blank "> Quick view of the product </a>'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.Builder.ShowQuickViewNote', 'Данная настройка позволяет просмотреть кратко карточку товара, не переходя вовнутрь.<br/>Настройка влияет на полную и мобильную версии сайта.<br/><br/>Подробнее: <br/> <a href="https://www.advantshop.net/help/pages/catalog-view#11" target="_blank">Быстрый просмотр товара</a>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.Builder.ShowQuickViewNote', 'This setting allows you to view a short product card without going inside.</br>The setting affects the full and mobile versions of the site.<br/><br/>More details: <br/> <a href = "https://www.advantshop.net/help/pages/catalog-view#11 "target =" _ blank "> Quick view of the product </a>'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.ExportImport.CustomerFields.AttractedByPartner', 'Привлечен партнером'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.ExportImport.CustomerFields.AttractedByPartner', 'Attracted by partner'

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'IsFittingAllowed' AND object_id = OBJECT_ID(N'[Shipping].[YandexPickupPoint]'))
BEGIN
    ALTER TABLE [Shipping].[YandexPickupPoint]
        ADD IsFittingAllowed bit NULL
    ALTER TABLE [Shipping].[YandexPickupPoint]
        ADD IsPartialRefuseAllowed bit NULL
    ALTER TABLE [Shipping].[YandexPickupPoint]
        ADD IsPaperlessPickupAllowed bit NULL
    ALTER TABLE [Shipping].[YandexPickupPoint]
        ADD IsUnboxingAllowed bit NULL
END

GO--

IF EXISTS (SELECT * FROM sys.columns WHERE name = N'IsFittingAllowed' AND object_id = OBJECT_ID(N'[Shipping].[YandexPickupPoint]') AND is_nullable = 1)
BEGIN
    UPDATE [Shipping].[YandexPickupPoint] SET IsFittingAllowed = 0, IsPartialRefuseAllowed = 0, IsPaperlessPickupAllowed = 0, IsUnboxingAllowed = 0
    
    ALTER TABLE [Shipping].[YandexPickupPoint]
        ALTER COLUMN IsFittingAllowed bit NOT NULL
    ALTER TABLE [Shipping].[YandexPickupPoint]
        ALTER COLUMN IsPartialRefuseAllowed bit NOT NULL
    ALTER TABLE [Shipping].[YandexPickupPoint]
        ALTER COLUMN IsPaperlessPickupAllowed bit NOT NULL
    ALTER TABLE [Shipping].[YandexPickupPoint]
        ALTER COLUMN IsUnboxingAllowed bit NOT NULL
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Shipping.Yandex.IsFittingAllowed', 'Разрешена примерка на пвз'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Shipping.Yandex.IsFittingAllowed', 'Fitting on PVZ is allowed'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Shipping.Yandex.IsPaperlessPickupAllowed', 'Разрешена сдача без бумаг на ПВЗ'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Shipping.Yandex.IsPaperlessPickupAllowed', 'It is allowed to deposit without papers on the PVZ'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Shipping.Yandex.IsPartialRefuseAllowed', 'Разрешен частичный выкуп на ПВЗ'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Shipping.Yandex.IsPartialRefuseAllowed', 'Partial redemption of PVZ is allowed'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Services.Shipping.Yandex.IsUnboxingAllowed', 'Разрешено вскрытие транспортной упаковки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Services.Shipping.Yandex.IsUnboxingAllowed', 'It is allowed to open the transport package'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.Confirmations', 'Подтверждение контактных данных'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.Confirmations', 'Contact verification'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.UseEmailConfirmation', 'Использовать подтверждение электронной почты'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.UseEmailConfirmation', 'Use email confirmation'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.UsePhoneConfirmation', 'Использовать подтверждение телефона'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.UsePhoneConfirmation', 'Use phone confirmation'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.UseEmailConfirmation.Help', 'При включении данной настройки покупателю необходимо будет подтвердить электронную почту при регистрации или оформлении заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.UseEmailConfirmation.Help', 'When enabled, the customer will need to confirm their email address during registration and checkout'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.UsePhoneConfirmation.Help', 'При включении данной настройки покупателю необходимо будет подтвердить номер телефона при регистрации или оформлении заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.UsePhoneConfirmation.Help', 'When enabled, the customer will need to confirm their phone number during registration and checkout'

GO--

IF NOT EXISTS(SELECT 1 FROM [Settings].[Settings] WHERE Name = 'SettingsAuth_UsePhoneConfirmation')
    BEGIN
        INSERT INTO [Settings].[Settings] (Name, Value) VALUES ('SettingsAuth_UsePhoneConfirmation', 'True')
    END

GO--
    
IF NOT EXISTS(SELECT 1 FROM [Settings].[Settings] WHERE Name = 'SettingsAuth_UseEmailConfirmation')
    BEGIN
        INSERT INTO [Settings].[Settings] (Name, Value) VALUES ('SettingsAuth_UseEmailConfirmation', 'False')
    END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Order.RecalcProductPrices', 'Пересчитать цены для товаров?'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Order.RecalcProductPrices', 'Recalculate product prices?'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Order.ProductPricesRecalculated', 'Цены товаров пересчитаны'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Order.ProductPricesRecalculated', 'Product prices have been recalculted'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.Registration.ErrorCustomerEmailAlreadyExists', 'Пользователь с таким email уже существует'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.Registration.ErrorCustomerEmailAlreadyExists', 'The user with this email already exists'

GO--

UPDATE [Settings].[MailFormat]
SET [FormatText] = REPLACE([FormatText], 'font-family:Circe,', 'font-family:')
WHERE [FormatName] = 'Подарочный сертификат';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Carousel.TextTitle', 'Текст заголовка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Carousel.TextTitle', 'Text title'

GO--



EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.Checkout.ShoppingCartPopupType', 'Вариант отображения вслывающей корзины'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.Checkout.ShoppingCartPopupType', 'Pop-up cart display variant'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Configuration.TemplateSettings_ShoppingCartPopupType.None', 'Не отображать'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Configuration.TemplateSettings_ShoppingCartPopupType.None', 'Not display'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Configuration.TemplateSettings_ShoppingCartPopupType.Mini', 'Мини'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Configuration.TemplateSettings_ShoppingCartPopupType.Mini', 'Mini'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Configuration.TemplateSettings_ShoppingCartPopupType.Sidebar', 'Боковая панель'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Configuration.TemplateSettings_ShoppingCartPopupType.Sidebar', 'Sidebar'

GO--

IF 
	EXISTS (SELECT 1
		FROM [Settings].[Settings]
		WHERE [Name] = 'EnableShoppingCartPopup'
		  AND [Value] = 'False')
	AND EXISTS (SELECT 1
		FROM [Settings].[Settings]
		WHERE [Name] = 'EnableShoppingCartPopup')
BEGIN
UPDATE ts
SET ts.Value = 'None'
    FROM [Settings].[TemplateSettings] as ts
WHERE ts.Name = 'ShoppingCartPopupType';
END

GO--

IF EXISTS (SELECT 1
    FROM [Settings].[Settings]
    WHERE [Name] = 'EnableShoppingCartPopup')
BEGIN
DELETE
FROM [Settings].[Settings]
WHERE Name = 'EnableShoppingCartPopup';
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Landings.Views.Blocks.Config.ContactsButtonsSocials.RutubeText', 'RUTUBE'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Landings.Views.Blocks.Config.ContactsButtonsSocials.RutubeText', 'RUTUBE'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Landings.Views.Blocks.Config.ContactsButtonsSocials.YandexzenText', 'Дзен'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Landings.Views.Blocks.Config.ContactsButtonsSocials.YandexzenText', 'dzen'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.Error.DefaultCityIfNotAutodetect', 'Выберите город из выпадающего списка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.Error.DefaultCityIfNotAutodetect', 'Select a city from the drop-down list'

GO--

UPDATE [CMS].[StaticBlock]
SET [Content] = REPLACE([Content], 'CirceExtraBold', 'Inter; font-weight: bold')
WHERE [Key] = 'MailoBannerMainRight' AND [Content] LIKE '%CirceExtraBold%';

UPDATE [CMS].[StaticBlock]
SET [Content] = REPLACE([Content], 'Circe', 'Inter')
WHERE [Key] = 'MailoBannerMainRight' AND [Content] LIKE '%Circe%';

UPDATE [CMS].[StaticBlock]
SET [Content] = REPLACE([Content], 'Neris Thin', 'Mulish; font-weight: 700')
WHERE [Key] = 'workingTime' AND [Content] LIKE '%Neris Thin%';

UPDATE [CMS].[StaticBlock]
SET [Content] = REPLACE([Content], 'GothamPro', 'Montserrat')
WHERE [Key] = 'banner_home_page' AND [Content] LIKE '%GothamPro%';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Cards.CardsImportStarted', 'Импорт карт запущен'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Cards.CardsImportStarted', 'Cards import started'

DELETE FROM [Settings].[Localization] WHERE ResourceKey = 'Admin.Js.Cards.CardsUploaded'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Cards.Import.ErrorFormatted', 'Ошибка при обработке строки №{0}. {1}'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Cards.Import.ErrorFormatted', 'Error processing row №{0}. {1}'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Cards.Import.Error.WrongColumnsCountFormatted', 'Количество колонок не может быть меньше {0} или больше {1}'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Cards.Import.Error.WrongColumnsCountFormatted', 'The number of columns cannot be less than {0} or more than {1}'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Cards.Import.Error.MissingPhoneAndEmail', 'Не указан номер телефона и email.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Cards.Import.Error.MissingPhoneAndEmail', 'The phone number and email address are missing.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Cards.Import.Error.CouldNotCreateCustomer', 'Не удалось создать покупателя.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Cards.Import.Error.CouldNotCreateCustomer', 'Could not create a customer.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Cards.UploadCards.Progressbar.Added', 'Добавлено :'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Cards.UploadCards.Progressbar.Added', 'Added :'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Cards.UploadCards.Progressbar.Updated', 'Обновлено :'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Cards.UploadCards.Progressbar.Updated', 'Updated :'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Cards.UploadCards.Progressbar.Errors', 'Ошибок :'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Cards.UploadCards.Progressbar.Errors', 'Errors :'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Cards.UploadCards.Progressbar.ImportCompleted', 'Загрузка завершена'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Cards.UploadCards.Progressbar.ImportCompleted', 'Import is completed'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Cards.UploadCards.DownloadLog', 'Скачать лог импорта (txt)'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Cards.UploadCards.DownloadLog', 'Download the import log (txt)'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Cards.ImportCouldNotBeStarted', 'Не удалось запустить импорт'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Cards.ImportCouldNotBeStarted', 'Import could not be started'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsCustomer.Index.Settings', 'Настройки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsCustomer.Index.Settings', 'Settings'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.CustomerSettings.Title', 'Настройки покупателя'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.CustomerSettings.Title', 'Customer settings'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.CustomerSettings.ForbiddenChangeData', 'Запретить покупателю редактировать общую информацию'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.CustomerSettings.ForbiddenChangeData', 'Prevent the customer from editing general information'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.CustomerSettings.ForbiddenChangeDataHelp', 'Запрет для покупателя на редактирование общей информации в личном кабинете'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.CustomerSettings.ForbiddenChangeDataHelp', 'The customer is prohibited from editing general information in their personal account.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Orders.Order.ShippingTaxType', 'Тип налога доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Orders.Order.ShippingTaxType', 'Shipping tax type'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Orders.Order.ShippingTaxRateFormatted', 'Ставка налога доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Orders.Order.ShippingTaxRateFormatted', 'Shipping tax rate'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.CodeInput.DefaultSendText', 'Получить код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.CodeInput.DefaultSendText', 'Send code'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.CodeInput.DefaultResendText', 'Отправить код повторно'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.CodeInput.DefaultResendText', 'Send code again'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.EmailConfirmation.EmailConfirmedText', 'Email подтвержден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.EmailConfirmation.EmailConfirmedText', 'Email confirmed'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.EmailConfirmation.EmailNotConfirmedText', 'Email не подтвержден'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.EmailConfirmation.EmailNotConfirmedText', 'Email not confirmed'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Checkout.CheckoutUser.EmailConfirmation', 'Подтверждение email'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Checkout.CheckoutUser.EmailConfirmation', 'Email confirmation'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.PhoneConfirmationCode.SendCodeText.Sms', 'Подтвердить через SMS'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.PhoneConfirmationCode.SendCodeText.Sms', 'Confirm with SMS'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.PhoneConfirmationCode.SendCodeText.Call', 'Подтвердить через звонок'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.PhoneConfirmationCode.SendCodeText.Call', 'Confirm with call'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApi.Index.BonusLoyalty', 'Бонусная система'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApi.Index.BonusLoyalty', 'Bonus system'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApi.Index.BonusSystem', 'Внутренняя бонусная система'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApi.Index.BonusSystem', 'Internal bonus system'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApi.Index.BonusSystemGrades', 'Внутренняя бонусная система. Грейды'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApi.Index.BonusSystemGrades', 'Internal bonus system. Grades'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApi.Index.BonusSystemSettings', 'Внутренняя бонусная система. Настройки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApi.Index.BonusSystemSettings', 'Internal bonus system. Settings'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.ApiAuth.BonusSystem', 'Внутренняя бонусная система'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.ApiAuth.BonusSystem', 'Internal bonus system'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.ApiAuth.BonusLoyalty', 'Бонусная система'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.ApiAuth.BonusLoyalty', 'Bonus system'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Widget.MeGetBonusCard.LoyaltyCard', 'Карта лояльности'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Widget.MeGetBonusCard.LoyaltyCard', 'Loyalty card'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Widget.MeGetBonusCard.CardNumber', '№{0}'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Widget.MeGetBonusCard.CardNumber', '#{0}'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Widget.MeGetBonusCard.CountBonuses', 'Бонусов: {0}'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Widget.MeGetBonusCard.CountBonuses', '{0} bonuses'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Widget.MeGetBonusCard.InternalLoyaltyCard', 'Карта лояльности'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Widget.MeGetBonusCard.InternalLoyaltyCard', 'Loyalty card'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Widget.MeGetBonusCard.InternalCardNumber', '№{0}'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Widget.MeGetBonusCard.InternalCardNumber', '#{0}'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Widget.MeGetBonusCard.InternalGradeName', 'Уровень карты: {0}'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Widget.MeGetBonusCard.InternalGradeName', 'Your level: {0}'
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Api.Widget.MeGetBonusCard.InternalBonusPercent', '{0}% Скидка'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Api.Widget.MeGetBonusCard.InternalBonusPercent', '{0}% cashback'

GO--

IF NOT EXISTS (SELECT *
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE CONSTRAINT_NAME='FK_ShippingMethod_Currency')
BEGIN
    UPDATE [Order].[ShippingMethod] SET CurrencyId = null
    WHERE NOT EXISTS(SELECT * FROM [Catalog].[Currency] WHERE [Currency].CurrencyID = [ShippingMethod].CurrencyId)

    ALTER TABLE [Order].[ShippingMethod] WITH CHECK ADD  CONSTRAINT [FK_ShippingMethod_Currency] FOREIGN KEY([CurrencyId])
    REFERENCES [Catalog].[Currency] ([CurrencyID])
    ON DELETE SET NULL
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.Authorization.EmailAuthType', 'Способ входа по электронной почте'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.Authorization.EmailAuthType', 'Email login method'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Auth.Emails.EmailAuthType.Password', 'Пароль'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Auth.Emails.EmailAuthType.Password', 'Password'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Auth.Emails.EmailAuthType.Code', 'Код'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Auth.Emails.EmailAuthType.Code', 'Code'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.Authorization.EmailAuthType.Help', 'Определяет, каким способом покупатель входит в личный кабинет при авторизации по email.<br/><br/><b>Пароль</b> — стандартный вход: покупатель вводит email и пароль.<br/><br/><b>Код</b> — вход без пароля: покупатель вводит email, на который отправляется одноразовый код подтверждения. После ввода кода покупатель авторизуется.<br/><br/>Для работы режима «Код» необходимо, чтобы был подключен сервис отправки писем.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.Authorization.EmailAuthType.Help', 'Determines how a customer logs in when using email authorization.<br/><br/><b>Password</b> — standard login: the customer enters their email and password.<br/><br/><b>Code</b> — passwordless login: the customer enters their email and receives a one-time confirmation code. After entering the code, the customer is authorized.<br/><br/>The "Code" mode requires the mail service to be enabled.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.Autorization.DefaultAuthorizationMethod.Help', 'Определяет, какой метод авторизации будет использоваться по умолчанию.<br/><br/><b>По электронной почте</b> — авторизация по email (пароль или код, в зависимости от настройки "Способ входа по электронной почте").<br/><br/><b>По коду</b> — авторизация по одноразовому коду, отправленному на номер телефона. Если идентификация по коду не включена, данный метод не будет работать и будет использован метод по электронной почте.<br/><br/><b>По модулю авторизации</b> — авторизация через подключённый внешний модуль авторизации. Если не выбран модуль по умолчанию, данный метод не будет работать и будет использован метод по электронной почте.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.Autorization.DefaultAuthorizationMethod.Help', 'Determines the default authentication method.<br/><br/><b>By email</b> — authentication via email (password or code, depending on the "Email login method" setting).<br/><br/><b>By code</b> — authentication via a one-time code sent to a phone number. If code authentication is not enabled, this method will not work and the Email method will be used instead.<br/><br/><b>By authorization module</b> — authentication via a connected external authorization module. If no default module is selected, this method will not work and the Email method will be used instead.'

GO--

IF NOT EXISTS(SELECT 1 FROM [Settings].[Settings] WHERE Name = 'CaptchaRemoteScriptEnabled')
BEGIN
    INSERT INTO [Settings].[Settings] (Name, Value) VALUES ('CaptchaRemoteScriptEnabled', 'False')
END

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingMethod.FivePost.NotSelected', 'Не выбрано'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingMethod.FivePost.NotSelected', 'Not selected'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingMethod.FivePost.StatusAlreadyExists', 'Данный статус уже указан. Чтобы обновить необходимо удалить.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingMethod.FivePost.StatusAlreadyExists', 'This status is already specified. To update, you need to delete it.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingMethod.FivePost.StoreStatus', 'Статус магазина'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingMethod.FivePost.StoreStatus', 'Store status'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingMethod.FivePost.FivePostStatus', 'Статус заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingMethod.FivePost.FivePostStatus', 'Order status'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.ShippingMethod.FivePost.ExecutionStatus', 'Статус исполнения заказа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.ShippingMethod.FivePost.ExecutionStatus', 'Order execution status'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingMethod.FivePost.SyncStatuses', 'Синхронизировать статусы заказов из доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingMethod.FivePost.SyncStatuses', 'Synchronize order statuses from delivery'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ShippingMethod.FivePost.Statuses', 'Статусы'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ShippingMethod.FivePost.Statuses', 'Statuses'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.Created', 'Создан в 5post'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.Created', 'Created in 5post'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.Approved', 'Прошел валидацию системой OMS'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.Approved', 'Validated by the OMS system'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.Rejected', 'Не прошел валидацию системой OMS'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.Rejected', 'Not validated by the OMS system'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.Problem', 'Заказ утерян или испорчен, принимается решение о его дальнейшем пути'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.Problem', 'The order is lost or damaged, and a decision is made about its next steps'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.ReceivedInWarehouseByPlaces', 'Предварительная приемка (необязательно)'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.ReceivedInWarehouseByPlaces', 'Pre-acceptance (optional)'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.Presorted', 'Предсортировка (необязательно)'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.Presorted', 'Pre-sorting (optional)'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.ReceivedInWarehouseInDetails', 'Штучная приемка с проверкой'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.ReceivedInWarehouseInDetails', 'Individual acceptance with verification'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.SortedInWarehouse', 'Поступил на сортировку'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.SortedInWarehouse', 'Entered for sorting'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.PlacedInConsolidationCellInWarehouse', 'Размещен в ячейке сортировки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.PlacedInConsolidationCellInWarehouse', 'Placed in the sorting cell'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.ComplectedInWarehouse', 'Скомплектован (сформирован мешок)'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.ComplectedInWarehouse', 'Packed (bag formed)'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.ReadyToBeShippedFromWarehouse', 'Готов к отгрузке со склада'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.ReadyToBeShippedFromWarehouse', 'Ready for shipment from the warehouse'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.Shipped', 'Отгружен со склада'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.Shipped', 'Shipped from the warehouse'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.ReceivedInStore', 'Принят в магазине'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.ReceivedInStore', 'Accepted in the store'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.PlacedInPostamat', 'Размещен в точке выдачи'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.PlacedInPostamat', 'Placed in postamat'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.PickedUp', 'Выдан клиенту'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.PickedUp', 'Issued to the client'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.ReadyForWithdrawFromPickupPoint', 'Ожидает изъятия из ПВЗ'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.ReadyForWithdrawFromPickupPoint', 'Awaiting withdrawal from the PVZ'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.WithdrawnFromPickupPoint', 'Изъят из ПВЗ'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.WithdrawnFromPickupPoint', 'Withdrawn from the PVZ'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.WaitingForRepickup', 'Ожидает повторную выдачу'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.WaitingForRepickup', 'Awaiting re-issuance'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.ReadyForReturn', 'Готов к возврату'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.ReadyForReturn', 'Ready for a refund'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.Lost', 'Груз утерян'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.Lost', 'The cargo is lost'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.ReadyForUtilize', 'Груз готов к утилизации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.ReadyForUtilize', 'The cargo is ready for disposal'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.Utilized', 'Груз был утилизирован'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.Utilized', 'The cargo has been disposed of'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.Cancelled', 'Отменен партнером'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.Cancelled', 'Cancelled by a partner'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.ReturnedToPartner', 'Возвращен партнеру'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.ReturnedToPartner', 'Returned to the partner'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Shipping.FivePost.ExecutionStatus.ReceivedInDrop', 'Принят на Drop-off'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Shipping.FivePost.ExecutionStatus.ReceivedInDrop', 'Accepted for Drop-off'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Crm.ETriggerCustomerContactFieldType.Country', 'Страна в адресной книге'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Crm.ETriggerCustomerContactFieldType.Country', 'Country in the address book'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Crm.ETriggerCustomerContactFieldType.Region', 'Регион в адресной книге'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Crm.ETriggerCustomerContactFieldType.Region', 'Region in the address book'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Crm.ETriggerCustomerContactFieldType.City', 'Город в адресной книге'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Crm.ETriggerCustomerContactFieldType.City', 'City in the address book'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Orders.Order.DeliveryDate', 'Дата доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Orders.Order.DeliveryDate', 'Delivery date'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Orders.Order.DeliveryInterval', 'Время доставки'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Orders.Order.DeliveryInterval', 'Delivery time'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Auth.ECheckoutLoginDisplayMode.Default', 'По умолчанию'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Auth.ECheckoutLoginDisplayMode.Default', 'Default'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Checkout.CheckoutUser.Login', 'Войти'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Checkout.CheckoutUser.Login', 'Login'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Checkout.CheckoutUser.LoginAndRegister', 'Войти или зарегистрироваться'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Checkout.CheckoutUser.LoginAndRegister', 'Login or register'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeeed.Settings.ExportFile.Help.Title', 'Файл'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeeed.Settings.ExportFile.Help.Title', 'File'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeeed.Settings.ExportFile.Help.Body', 'Последний экспортированный файл выгрузки.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeeed.Settings.ExportFile.Help.Body', 'Most recent export.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.Settings.JobTimeStart.Help.Title', 'Время запуска'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.Settings.JobTimeStart.Help.Title', 'Start time'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.Settings.JobTimeStart.Help.Body', 'Время старта автоматической выгрузки в 24-часовом формате.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.Settings.JobTimeStart.Help.Body', 'Automatic export start time (24-hour format).'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.Settings.Interval.Help.Title', 'Интервал запуска'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.Settings.Interval.Help.Title', 'Interval'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.Settings.Interval.Help.Body', 'Частота выгрузки файла.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.Settings.Interval.Help.Body', 'Export frequency.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeeed.SettingsAvito.Currency.Help.Title', 'Валюта'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeeed.SettingsAvito.Currency.Help.Title', 'Currency'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeeed.SettingsAvito.Currency.Help.Body', 'Цены товаров будут сконвертированны во время выгрузки в выбранную валюту.<p><br />Изменить курс конвертации можно в настройках валют (настройки → товары → валюты).</p>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeeed.SettingsAvito.Currency.Help.Body', 'Items prices will be converted to the selected here currency during the export.<p><br />Conversion rate can be changed in the currency settings (settings → products → currencies).</p>'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.PublicationDateOffset.Help.Title', 'Смещение даты публикации'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.PublicationDateOffset.Help.Title', 'Publication date offset'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.PublicationDateOffset.Help.Body', 'Количество дней с момента выгрузки объявлений, через которое они будут опубликованы в Авито.<p><br />Если во время выгрузки объявлений указанная тут дата ещё не наступила, то они (объявления) будут закрыты на стороне Авито до наступления даты публикации.</p>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.PublicationDateOffset.Help.Body', 'The number of days from the date of uploading the ads, after which they will be published in Avito.<p><br />If the date indicated here has not yet arrived at the time of uploading the ads, then they (ads) will be closed on the Avito side before the publication date.</p>'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.DurationOfPublicationInDays.Help.Title', 'Длительность публикации в днях'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.DurationOfPublicationInDays.Help.Title', 'Duration of publication in days'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.DurationOfPublicationInDays.Help.Body', 'Выгруженные объявления будут закрыты через указанное здесь количество дней со дня публикации включительно.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.DurationOfPublicationInDays.Help.Body', 'Exported ads will be hidden when the number of days specified here including the publication date will pass.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeeed.SettingsAvito.ProductDescriptionType.Help.Title', 'Описание'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeeed.SettingsAvito.ProductDescriptionType.Help.Title', 'Description'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeeed.SettingsAvito.ProductDescriptionType.Help.Body', 'Тип описания товара для экспорта в карточку товара Авито.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeeed.SettingsAvito.ProductDescriptionType.Help.Body', 'Type of product description for export to the Avito product card.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.UnloadProperties.Help.Title', 'Выгружать свойства товара в описании'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.UnloadProperties.Help.Title', 'Unload product properties in the description'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.UnloadProperties.Help.Body', 'Свойства товара выгрузятся в тексте описания объявления так:<br /> <b>свойство</b>: <i>значение свойства</i>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.UnloadProperties.Help.Body', 'The product properties will be exported to an ads description this way:<br /> <b>property</b>: <i>the value of the property</i>'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.DefaultAvitoCategory.Help.Title', 'Категория товара по умолчанию'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.DefaultAvitoCategory.Help.Title', 'Default Avito product category'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.DefaultAvitoCategory.Help.Body', 'Указанная категория будет присвоена всем выгружаемым объявлениям.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.DefaultAvitoCategory.Help.Body', 'The specified here category will be assigned to all exported ads.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.AboveAdditionalDescription.Help.Title', 'Добавить дополнительное описание в начало'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.AboveAdditionalDescription.Help.Title', 'Add additional description at the beginnig'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.AboveAdditionalDescription.Help.Body', 'Указанный здесь текст будет отображаться перед содержанием краткого или полного описания выгружаемых товаров.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.AboveAdditionalDescription.Help.Body', 'Specify a text here to display it before any short or full description of an exported item.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.BelowAdditionalDescription.Help.Title', 'Добавить дополнительное описание в конец'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.BelowAdditionalDescription.Help.Title', 'Add additional description at the end'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.BelowAdditionalDescription.Help.Body', 'Указанный здесь текст, будет отображаться после содержания краткого или полного описания выгружаемых товаров.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.BelowAdditionalDescription.Help.Body', 'Specify a text here to display it after any short or full description of an exported item.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.NotExportColorSize.Help.Title', 'Не выводить цвет, размер в описании'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.NotExportColorSize.Help.Title', 'Not export color, size in description'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.NotExportColorSize.Help.Body', 'Убирает описание цвета и размера из поля описания.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.NotExportColorSize.Help.Body', 'Hides color and size properties from description field.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.ExportMode.Help.Title', 'Выгружать'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.ExportMode.Help.Title', 'Export'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.ExportMode.Help.Body', '<b>Товар</b>: модификации товаров не будут выгружены отдельными объявлениями.<p><br /><b>Модификацию</b>: модификации товаров будут выгружены отдельными объявлениями.</p>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.ExportMode.Help.Body', '<b>Product</b>: Product modifications will not be exported as separate ads.<p><br /><b>Offer</b>: product modifications will be exported as separate ads.</p>'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.PaidServices.Help.Title', 'Платные услуги'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.PaidServices.Help.Title', 'Paid services'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.PaidServices.Help.Body', '<p>Платный статус объявления (Free, Premium, VIP, PushUp, Highlight, TurboSale, QuickSale)</p><p>.По умолчанию используется Free.</p><p>Для применения услуги нужны средства на Кошельке Avito.</p><br/><br/><p>Подробнее: <a href="https://www.advantshop.net/help/pages/nastroika-vygruzki-avito-avtozagruzka" target="_blank">Настройка выгрузки "Avito Автозагрузка"</a></p>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.PaidServices.Help.Body', '<p>Paid status of an ad (Free, Premium, VIP, PushUp, Highlight, TurboSale, QuickSale)</p><p>.Free is used by default.</p><p>You need positive Avito balance to use this feature.</p><br/><br/><p>More: <a href="https://www.advantshop.net/help/pages/nastroika-vygruzki-avito-avtozagruzka" target="_blank">here</a>.</p>'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.EmailMessages.Help.Title', 'Сообщения на email'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.EmailMessages.Help.Title', 'Email messages'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.EmailMessages.Help.Body', '<p>Возможность написать сообщение по объявлению через сайт</p>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.EmailMessages.Help.Body', '<p>The ability to send messages to an ad by site'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.ManagerName.Help.Title', 'Имя менеджера'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.ManagerName.Help.Title', 'Manager''s name'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.ManagerName.Help.Body', '<p>Имя менеджера, контактного лица компании по данному объявлению — строка не более 40 символов.</p>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.ManagerName.Help.Body', '<p>Manager''s or contact person''s name (up to 40 symbols long).</p>'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.Phone.Help.Title', 'Контактный телефон'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.Phone.Help.Title', 'Contact number'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.Phone.Help.Body', '<p>Контактный телефон — строка, содержащая только один российский номер телефона; должен быть обязательно указан код города или мобильного оператора. Корректные примеры:</p><ul><li>«+7 (495) 777-10-66»</li><li>«(81374) 4-55-75»</li><li>«8 905 207 04 90»</li><li>«+7 905 2070490»</li><li>«88123855085»</li><li>«9052070490»</li></ul>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.Phone.Help.Body', '<p>Contact number - string, containing only one russian phone number. A version with a city code or mobile operator number is required. Examples:</p><ul><li>«+7 (495) 777-10-66»</li><li>«(81374) 4-55-75»</li><li>«8 905 207 04 90»</li><li>«+7 905 2070490»</li><li>«88123855085»</li><li>«9052070490»</li></ul>'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.Address.Help.Title', 'Адрес'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.Address.Help.Title', 'Address'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.Address.Help.Body', '<p>Пример: Россия, Тамбовская область, Моршанск, Лесная улица, 7</p>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.Address.Help.Body', '<p>Example: Russia, Tombov region, Morshansk, Lesnaya street, 7</p>'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeeed.SettingsAvito.ExportNotAvailable', 'Выгружать недоступные товары'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeeed.SettingsAvito.ExportNotAvailable', 'Export unavailable products'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.ExportNotAvailable.Help.Title', 'Выгружать недоступные товары'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.ExportNotAvailable.Help.Title', 'Export unavailable products'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.ExportFeed.SettingsAvito.ExportNotAvailable.Help.Body', '<p>Товар будет выгружен, даже если он не в наличии, без цены или неактивен.</p>'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.ExportFeed.SettingsAvito.ExportNotAvailable.Help.Body', '<p>Product will be exported even if it is out of stock, without price or inactive.</p>'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Checkout.Error.LoginOrRegisterRequired', 'Для оформления заказа необходимо войти или зарегистрироваться'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Checkout.Error.LoginOrRegisterRequired', 'To place an order, please log in or register'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Checkout.Error.LoginRequired', 'Для оформления заказа необходимо войти'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Checkout.Error.LoginRequired', 'To place an order, please log in'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.CheckoutLoginDisplayMode.Help', 'Определяет, каким образом отображается авторизация на странице оформления заказа для незарегистрированных покупателей.<br/><br/><b>По умолчанию</b> — в форме оформления заказа заполняется информация о покупателе с возможностью войти в аккаунт.<br/><br/><b>Отдельная страница</b> — при переходе на страницу оформления заказа неавторизованный покупатель перенаправляется на отдельную страницу авторизации.<br/><br/><b>Модальное окно</b> — в форме оформления заказа отображается кнопка входа. При нажатии открывается модальное окно авторизации. Оформление заказа для неавторизованных покупателей недоступно.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.CheckoutLoginDisplayMode.Help', 'Determines how authorization is displayed on the checkout page for unregistered customers.<br/><br/><b>Default</b> — the checkout form includes customer information fields with an option to sign in to an existing account.<br/><br/><b>Single page</b> — when navigating to the checkout page, an unauthorized customer is redirected to a dedicated login page.<br/><br/><b>Modal window</b> — a login button is displayed on the checkout form. Clicking it opens a login modal. Checkout is not available for unauthorized customers.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.AuthYandexActive', 'Яндекс'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.AuthYandexActive', 'Yandex'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.AuthMailActive', 'Mail.ru'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.AuthMailActive', 'Mail.ru'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.AuthVkIdActive', 'VK ID'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.AuthVkIdActive', 'VK ID'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.AuthVkWarnMessage', 'Если у вас ранее был настроен канал продаж ВКонтакте и используется это же приложение, то не входите через VK ID в клиентской части под этим пользователем (другим можно). Т.к. приложение одно, а доступы разные, ВКонтакте отзовет доступ выданный каналу продаж и нужно будет переподключать канал продаж.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.AuthVkWarnMessage', 'If you previously had a VKontakte sales channel configured using the same application, do not log in via VK ID on the storefront under that user (other users are fine). Since it is the same application with different access rights, VKontakte will revoke the access granted to the sales channel and you will need to reconnect it.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.AuthVkontakteActive', 'Vk.com'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.AuthVkontakteActive', 'Vk.com'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.AuthOdnoklassnikiActive', 'Odnoklassniki.ru'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.AuthOdnoklassnikiActive', 'Odnoklassniki.ru'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.AuthGoogleActive', 'Google'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.AuthGoogleActive', 'Google'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.AuthFacebookActive', 'Facebook'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.AuthFacebookActive', 'Facebook'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.PhoneDuplicates.Warning', 'Для включения настройки необходимо избавиться от дубликатов номеров телефонов'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.PhoneDuplicates.Warning', 'To enable the setting, you need to remove duplicate phone numbers'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.PhoneDuplicates.DownloadFile', 'Скачать файл'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.PhoneDuplicates.DownloadFile', 'Download file'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.OAuth', 'Внешние способы входа'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.OAuth', 'External login methods'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.SystemSettings.OAuth.ForbiddenInRussia', '* В Российской Федерации запрещена авторизация и регистрация на сайтах и в приложениях через иностранные сервисы, такие как Google, Facebook и д.р.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.SystemSettings.OAuth.ForbiddenInRussia', '* In the Russian Federation, authorization and registration on websites and applications through foreign services such as Google, Facebook, etc. is prohibited.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.LoginOpenId.AuthMailText', 'Войти через Mail'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.LoginOpenId.AuthMailText', 'Login with Mail'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.LoginOpenId.AuthOkText', 'Войти через OK'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.LoginOpenId.AuthOkText', 'Login with OK'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'User.LoginOpenId.AuthYandexText', 'Войти через Yandex'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'User.LoginOpenId.AuthYandexText', 'Login with Yandex'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Modules.UpdateModule.NotExistModuleError', 'Не удалось найти модуль для обновления'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Modules.UpdateModule.NotExistModuleError', 'Unable to find module to update'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Modules.UpdateModule.RemoteServerError', 'Внешний сервис недоступен, попробуйте обновить модуль позже'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Modules.UpdateModule.RemoteServerError', 'The remote server is unavailable. Please try updating the module later.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Modules.UpdateAllModules.RemoteServerError', 'Внешний сервис недоступен, попробуйте обновить модули позже'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Modules.UpdateAllModules.RemoteServerError', 'The remote server is unavailable. Please try updating the modules later.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Modules.UninstallModule.RemoteServerError', 'Внешний сервис недоступен, попробуйте удалить модуль позже'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Modules.UninstallModule.RemoteServerError', 'The remote server is unavailable. Please try uninstalling the module later.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Modules.InstallModule.RemoteServerError', 'Внешний сервис недоступен, попробуйте установить модуль позже'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Modules.InstallModule.RemoteServerError', 'The remote server is unavailable. Please try installing the module later.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Modules.InstallModule.InvalidParams', 'Не удалось установить модуль: не переданы обязательные параметры (идентификатор, версия)'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Modules.InstallModule.InvalidParams', 'Failed to install the module: required parameters are missing (identifier, version)'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Modules.Unavailable.Title', 'Раздел временно недоступен'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Modules.Unavailable.Title', 'Section temporarily unavailable'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Modules.Unavailable.Description', 'Сервис управления модулями не отвечает. Установленные модули продолжают работать, однако управление ими (установка, обновление, включение/выключение) временно недоступно.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Modules.Unavailable.Description', 'The module management service is not responding. Installed modules continue to work, but managing them (installation, update, enable/disable) is temporarily unavailable.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Modules.Unavailable.Refresh', 'Обновить страницу'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Modules.Unavailable.Refresh', 'Refresh page'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Modules.Unavailable.Title', 'Магазин модулей недоступен'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Modules.Unavailable.Title', 'Module store is unavailable'

GO--

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Module].[MobileApp_RequestHistory]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Module].[MobileApp_RequestHistory](
        [Ip] [varbinary](16) NOT NULL,
        [CreatedOn] [datetime] NOT NULL,
        [Url] [nvarchar](350) NOT NULL,
        [IpStr] [nvarchar](100) NOT NULL,
        [UserId] [uniqueidentifier] NULL
    ) ON [PRIMARY]
END

GO--
IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name = 'IX_MobileApp_RequestHistory_IpCreatedOn' AND object_id = OBJECT_ID(N'[Module].[MobileApp_RequestHistory]'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_MobileApp_RequestHistory_IpCreatedOn
    ON Module.MobileApp_RequestHistory
    (
        Ip,
        CreatedOn
    );
END

GO--

if not exists (Select 1 From Settings.Settings Where Name = 'MobileAppRequestHistory_CheckAfterDate')
begin
    Insert Into Settings.Settings (Name, Value) Values ('MobileAppRequestHistory_CheckAfterDate', CONVERT(nvarchar(MAX), dateadd(hour, 3, GETDATE()), 126));
end

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Users.SMSCodeAuthorization', 'Авторизация (или регистрация) по номеру телефона. 1. Отсылается sms-код или проверочный звонок по номеру телефона.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Users.SMSCodeAuthorization', 'Authorization (or registration) by phone number. 1. Sending SMS code or call by phone number.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Users.SMSCodeAuthorization.TwoRequests', 'Метод позволяет реализовать проверку номера телефона для авторизации или регистрации. В зависимости от настроек доступны варианты подтверждения через: смс код, проверочный звонок.<br/> Делается 2 запроса:'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Users.SMSCodeAuthorization.TwoRequests', 'This method allows you to verify a phone number for authorization or registration. Depending on the settings, the following verification options are available: SMS code, verification call.<br/> Two requests are made:'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Users.SMSCodeAuthorization.FirstRequest', '1) /api/users/signInByPhone - пользователю отсылается sms-код или происходит звонок. Код нужно ввести в течении 10 мин.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Users.SMSCodeAuthorization.FirstRequest', '1) /api/users/signInByPhone - the user is sent an SMS code/call. It must be entered within 10 minutes.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Users.SMSCodeAuthorization.Attention', 'Внимание! Можно использовать только после других запросов (init, cart, catalog, product). Иначе ip будет заблокирован для отсылки.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Users.SMSCodeAuthorization.Attention', 'Attention! Can only be used after other requests (init, cart, catalog, product). Otherwise, the IP will be blocked for sending.'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApiAuth.Index.Users.SMSAuthorizationChecking', 'Авторизация (или регистрация) по номеру телефона. 2. Проверяется введенный код и пользователь авторизуется.'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApiAuth.Index.Users.SMSAuthorizationChecking', 'Authorization (or registration) by phone number. 2. Checking the entered code and authorization.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.CustomerSettings.ForbiddenChangeAddressBook', 'Запретить покупателю редактировать адресную книгу'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.CustomerSettings.ForbiddenChangeAddressBook', 'Prevent the buyer from editing the address book'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Settings.CustomerSettings.ForbiddenChangeAddressBookHelp', 'Запрет для покупателя на редактирование адресной книги в личном кабинете'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Settings.CustomerSettings.ForbiddenChangeAddressBookHelp', 'The buyer is prohibited from editing the address book in their personal account.'

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MyAccount.BringFriend.Recommend', 'Рекомендовать';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MyAccount.BringFriend.Recommend', 'Recommend';
EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Js.MyAccount.BringFriend.SendLinkToFriend', 'Отправьте ссылку другу: он получит скидку, а на ваш счет будут начислены бонусы за его заказ.';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Js.MyAccount.BringFriend.SendLinkToFriend', 'Send the link to a friend: they will receive a discount, and bonuses for their order will be added to your account.';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Customers.ViewInfo.BringFriendReferrer', 'Реферер по программе «Приведи друга»';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Customers.ViewInfo.BringFriendReferrer', 'Referrer for the «Bring a Friend» program';

GO--

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApi.Index.Metrics', 'Метрики';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApi.Index.Metrics', 'Metrics';

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.SettingsApi.Index.Metrics.SendDeviceInfo', 'Отправить информацию об устройстве';
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.SettingsApi.Index.Metrics.SendDeviceInfo', 'Send device info';

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'AppVersion' AND object_id = OBJECT_ID(N'[Module].[MobileApp_RequestHistory]'))
BEGIN
    ALTER TABLE Module.MobileApp_RequestHistory ADD
        AppVersion nvarchar(50) NULL,
        DeviceId nvarchar(350) NULL,
        Metrics nvarchar(MAX) NULL,
        MetricsHash int NULL
END

GO--

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = N'AppId' AND object_id = OBJECT_ID(N'[Module].[MobileApp_RequestHistory]'))
BEGIN
ALTER TABLE Module.MobileApp_RequestHistory ADD
	AppId uniqueidentifier NULL
END

GO--

UPDATE [Settings].[InternalSettings] SET [settingValue] = '14.0.0' WHERE [settingKey] = 'db_version'
