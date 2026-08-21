EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Settings.SettingsFeatures.GsSymbolAutoFix', 'Автоматическая вставка GS-символов'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Settings.SettingsFeatures.GsSymbolAutoFix', 'Automatic insertion of GS symbols'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Core.Settings.SettingsFeatures.GsSymbolAutoFixDescription', 'При сканировании маркировки товара вставляются GS-символы'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Core.Settings.SettingsFeatures.GsSymbolAutoFixDescription', 'When scanning product markings, GS symbols are inserted'

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
							(SELECT COUNT(DISTINCT SizeId) FROM Catalog.Offer WHERE Offer.ProductId = @productId) <= 1 
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
				AllowAddToCartInCatalog = (CASE WHEN ((SELECT COUNT(DISTINCT SizeId) FROM Catalog.Offer WHERE Offer.ProductId = pe.ProductId) <= 1 
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

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Order.RecalcProductPrices', 'Пересчитать цены для товаров?'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Order.RecalcProductPrices', 'Recalculate product prices?'

EXEC [Settings].[sp_AddUpdateLocalization] 1, 'Admin.Js.Order.ProductPricesRecalculated', 'Цены товаров пересчитаны'
EXEC [Settings].[sp_AddUpdateLocalization] 2, 'Admin.Js.Order.ProductPricesRecalculated', 'Product prices have been recalculted'

GO--

IF NOT EXISTS(SELECT 1 FROM [Settings].[Settings] WHERE Name = 'CaptchaRemoteScriptEnabled')
BEGIN
    INSERT INTO [Settings].[Settings] (Name, Value) VALUES ('CaptchaRemoteScriptEnabled', 'False')
END

GO--