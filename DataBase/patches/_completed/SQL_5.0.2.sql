update settings.settings set value='True' where name = 'ShowCopyright'

GO--

update cms.staticblock set content = replace(content, '2014', '2015')

GO--


IF((SELECT COUNT('BlogItem') FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'Module' AND TABLE_NAME = 'BlogItem') > 0) 
begin

DECLARE @ItemId int
DECLARE @ItemCategoryUrl nvarchar (150)
DECLARE @UrlPath nvarchar (150)

--DECLARE @tempTable table(ItemId int, ItemCategoryUrl  nvarchar (150), UrlPath nvarchar (150))

DECLARE blogItems CURSOR FOR SELECT ItemId, (Select UrlPath From [Module].BlogCategory Where BlogCategory.ItemCategoryId = BlogItem.ItemCategoryId) as ItemCategoryUrl, UrlPath from [Module].BlogItem

OPEN blogItems

FETCH blogItems INTO @ItemId, @ItemCategoryUrl, @UrlPath

WHILE @@FETCH_STATUS = 0
BEGIN


--insert into @tempTable (ItemId, ItemCategoryId, UrlPath) values (@ItemId, @ItemCategoryId, @UrlPath) 
insert into  [Settings].[Redirect] ( RedirectFrom, RedirectTo, ProductArtNo) values ('articles/'+@ItemCategoryUrl+'/'+@UrlPath,'blog/'+@UrlPath,null)

FETCH NEXT FROM blogItems INTO @ItemId, @ItemCategoryUrl, @UrlPath
END

CLOSE blogItems

DEALLOCATE blogItems
end

GO--

IF not  EXISTS (SELECT * FROM sys.objects 
WHERE object_id = OBJECT_ID(N'[Order].[OrderStatus1C]') AND type in (N'U'))
	CREATE TABLE [Order].[OrderStatus1C](
	[OrderId] [int] NOT NULL,
	[Status1C] [nvarchar](max) NOT NULL,
	[OrderId1C] [nvarchar](max) NOT NULL,
	[OrderDate] [nvarchar](max) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO--


ALTER PROCEDURE [Catalog].[PreCalcProductParamsMass] AS BEGIN  
SET NOCOUNT ON;  
INSERT INTO [Catalog].[ProductExt] (ProductId,CountPhoto,PhotoId,VideosAvailable,MaxAvailable,NotSamePrices,MinPrice,Colors,AmountSort,OfferId,Comments,CategoryId)  
  (SELECT ProductId, 0, NULL, 0, 0, 0, 0, NULL, 0, NULL, 0, NULL  
   FROM [Catalog].Product  
   WHERE Product.ProductId NOT IN (SELECT ProductId FROM [Catalog].[ProductExt]))  
         
UPDATE [Catalog].[ProductExt]  
SET [CountPhoto] =  
	   (SELECT Top(1) CASE  
		   WHEN Offer.ColorID IS NOT NULL THEN  
			(SELECT Count(PhotoId)  
			 FROM [Catalog].[Photo]  
			 WHERE ([Photo].ColorID = Offer.ColorID  
			  OR [Photo].ColorID IS NULL)  
			   AND [Photo].[ObjId] = [ProductExt].ProductId  
			   AND TYPE = 'Product')  
		   ELSE  
			(SELECT Count(PhotoId)  
			 FROM [Catalog].[Photo]  
			 WHERE [Photo].[ObjId] = [ProductExt].ProductId  
			   AND TYPE = 'Product')  
		  END  
		FROM [Catalog].[Offer]  
		WHERE [ProductID] = [ProductExt].ProductId AND main =1),  
      
    [PhotoId] =  
	   (SELECT Top(1) CASE  
		   WHEN Offer.ColorID IS NOT NULL THEN  
			(SELECT TOP (1) PhotoId  
			 FROM [Catalog].[Photo]  
			 WHERE ([Photo].ColorID = Offer.ColorID  
			  OR [Photo].ColorID IS NULL)  
			   AND [Photo].[ObjId] = [ProductExt].ProductId  
			   AND TYPE = 'Product'  
			 ORDER BY main DESC, [Photo].[PhotoSortOrder],[PhotoId])  
		   ELSE  
			(SELECT TOP (1) PhotoId  
			 FROM [Catalog].[Photo]  
			 WHERE [Photo].[ObjId] = [ProductExt].ProductId  
			   AND TYPE = 'Product'  
			 ORDER BY main DESC ,[Photo].[PhotoSortOrder])  
		  END  
		FROM [Catalog].[Offer]  
		WHERE [ProductID] = [ProductExt].ProductId AND main =1),  
      
    [VideosAvailable] =  
	   (SELECT Top(1) CASE  
		   WHEN COUNT(ProductVideoID) > 0 THEN 1  
		   ELSE 0  
		  END  
		FROM [Catalog].[ProductVideo]  
		WHERE ProductID = [ProductExt].ProductId),  
      
    [MaxAvailable] =  
	   (SELECT Top(1) CASE  
		   WHEN Max(Offer.Amount) > 0 THEN 1  
		   ELSE 0  
		  END  
		FROM [Catalog].Offer  
		WHERE ProductId = [ProductExt].ProductId),  
      
    [NotSamePrices] =  
	   (SELECT Top(1) CASE  
		   WHEN max(price) - min(price) > 0 THEN 1  
		   ELSE 0  
		  END  
		FROM [Catalog].offer  
		WHERE offer.productid = [ProductExt].ProductId and price >0),  
      
    [MinPrice] = (SELECT min(price) FROM [Catalog].offer WHERE offer.productid = [ProductExt].ProductId and price >0),  
     
	[PriceTemp] =  
	   (SELECT ([MinPrice] - [MinPrice] * [Product].Discount / 100) * CurrencyValue     
	    FROM catalog.product 
	    inner join catalog.Currency on product.currencyid = Currency.currencyid  
	    WHERE product.productid = [ProductExt].ProductId),  
  
    [Colors] = (SELECT [Settings].[ProductColorsToString]([ProductExt].ProductId)),  
     
    [AmountSort] =  
	   (SELECT Top(1) CASE  
		   WHEN MaxAvailable <= 0  
			 OR MaxAvailable < IsNull(Product.MinAmount, 0) THEN 0  
		   ELSE 1  
		  END  
		FROM [Catalog].Offer  
		INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId  
		WHERE Offer.ProductId = [ProductExt].ProductId AND main = 1),  
     
    [OfferId] =  
	   (SELECT Top(1) OfferID  
		FROM [Catalog].offer  
		WHERE offer.productid = [ProductExt].ProductId AND (offer.Main = 1 OR offer.Main IS NULL)),  
   
	[Comments] =   
	   (SELECT Count(ReviewId) From CMS.Review Where EntityId = [ProductExt].ProductId And Checked = 1),  
     
	[Gifts] =  
	   (SELECT Top(1) CASE  
		   WHEN COUNT(ProductID) > 0 THEN 1  
		   ELSE 0  
		  END  
		FROM [Catalog].[ProductGifts]  
		WHERE ProductID = [ProductExt].ProductId),  
   
	-- 1. get main category of product, 2. get root category by main category  
	[CategoryId] =      
	   (Select Top 1 id From [Settings].[GetParentsCategoryByChild]((SELECT top 1 CategoryID FROM [Catalog].ProductCategories WHERE ProductID = [ProductExt].ProductId ORDER BY Main DESC)) Order by sort desc)  
END  

GO--



ALTER PROCEDURE [Catalog].[PreCalcProductParams] @productId INT    
AS    
BEGIN    
 SET NOCOUNT ON;    
    
 DECLARE @CountPhoto INT    
 DECLARE @Type NVARCHAR(10)    
 DECLARE @PhotoId INT    
 DECLARE @MaxAvailable BIT    
 DECLARE @VideosAvailable BIT    
 DECLARE @Colors NVARCHAR(max)    
 DECLARE @NotSamePrices BIT    
 DECLARE @MinPrice FLOAT  
 DECLARE @PriceTemp FLOAT     
 DECLARE @AmountSort BIT    
 DECLARE @OfferId int    
 DECLARE @Comments int  
 DECLARE @CategoryId int  
 DECLARE @Gifts bit  
     
 if not exists(select  ProductID from [Catalog].Product where ProductID=@productId)    
 return    
    
 SET @Type = 'Product'    
 --@CountPhoto    
 SET @CountPhoto = (    
   SELECT CASE     
     WHEN Offer.ColorID IS NOT NULL    
      THEN (    
        SELECT Count(PhotoId)    
        FROM [Catalog].[Photo]    
        WHERE (    
          [Photo].ColorID = Offer.ColorID    
          OR [Photo].ColorID IS NULL    
          )    
         AND [Photo].[ObjId] = @productId    
         AND Type = @Type    
        )    
     ELSE (    
       SELECT Count(PhotoId)    
       FROM [Catalog].[Photo]    
       WHERE [Photo].[ObjId] = @productId    
        AND Type = @Type    
       )    
     END    
   FROM [Catalog].[Offer]    
   WHERE [ProductID] = @productId and main =1    
   )    
 --@PhotoId    
 SET @PhotoId = (    
   SELECT CASE     
     WHEN Offer.ColorID IS NOT NULL    
      THEN (    
        SELECT TOP (1) PhotoId    
        FROM [Catalog].[Photo]    
        WHERE (    
          [Photo].ColorID = Offer.ColorID    
          OR [Photo].ColorID IS NULL    
          )    
         AND [Photo].[ObjId] = @productId    
         AND Type = @Type    
        ORDER BY main DESC    
         ,[Photo].[PhotoSortOrder]    
        )    
     ELSE (    
       SELECT TOP (1) PhotoId    
       FROM [Catalog].[Photo]    
       WHERE [Photo].[ObjId] = @productId    
        AND Type = @Type    
        ORDER BY main DESC    
         ,[Photo].[PhotoSortOrder]
         ,[PhotoId]
       )    
     END    
   FROM [Catalog].[Offer]     
   WHERE [ProductID] = @productId and main =1    
   )     
 --VideosAvailable    
 IF (    
   SELECT COUNT(ProductVideoID)    
   FROM [Catalog].[ProductVideo]    
   WHERE ProductID = @productId    
   ) > 0    
 BEGIN    
  SET @VideosAvailable = 1    
 END    
 ELSE    
 BEGIN    
  SET @VideosAvailable = 0    
 END    
    
 --@MaxAvailable    
 IF (    
   SELECT Max(Offer.Amount)    
   FROM [Catalog].Offer    
   WHERE ProductId = @productId    
   ) > 0    
 BEGIN    
  SET @MaxAvailable = 1    
 END    
 ELSE    
 BEGIN    
  SET @MaxAvailable = 0    
 END    
    
 --AmountSort    
 SET @AmountSort = (    
   SELECT CASE     
     WHEN @MaxAvailable <= 0    
      OR @MaxAvailable < IsNull(Product.MinAmount, 0)    
      THEN 0    
     ELSE 1    
     END    
   FROM [Catalog].Offer inner join [Catalog].Product on Product.ProductId=Offer.ProductId    
   WHERE Offer.ProductId = @productId    
    AND main = 1    
   )    
 --Colors    
 SET @Colors = (    
   SELECT [Settings].[ProductColorsToString](@productId)    
   )    
    
 --@NotSamePrices    
 IF (    
   SELECT max(price) - min(price)    
   FROM [Catalog].offer    
   WHERE offer.productid = @productId and price > 0 
   ) > 0    
 BEGIN    
  SET @NotSamePrices = 1    
 END    
 ELSE    
 BEGIN    
  SET @NotSamePrices = 0    
 END    

 --@MinPrice    
 SET @MinPrice = (    
   SELECT min(price)    
   FROM CATALOG.offer    
   WHERE offer.productid = @productId and price > 0 
   )    

 --@OfferId  
 SET @OfferId = (SELECT OfferID    
   FROM CATALOG.offer    
   WHERE offer.productid = @productId and (offer.Main = 1 OR offer.Main IS NULL))   


 --@PriceTemp    
 SET @PriceTemp = (    
   SELECT (@MinPrice - @MinPrice * [Product].Discount / 100) * CurrencyValue     
   FROM Catalog.Product 
   inner join Catalog.Currency on Product.Currencyid = Currency.Currencyid  
   WHERE Product.Productid = @productId
   )    

 --@Comments  
 SET @Comments = (  
	SELECT Count(ReviewId) From CMS.Review Where EntityId = @productId And Checked = 1  
 )   
     
--@Gifts  
SET @Gifts =  
   (SELECT Top(1) CASE WHEN COUNT(ProductID) > 0 THEN 1 ELSE 0 END  
    FROM [Catalog].[ProductGifts]  
    WHERE ProductID = @productId)  
   
 --@CategoryId  
 Declare @MainCategoryId int  
 SET @MainCategoryId = (SELECT top 1 CategoryID FROM [Catalog].ProductCategories WHERE ProductID = @productId ORDER BY Main DESC)  
 IF @MainCategoryId IS NOT NULL  
 BEGIN  
 SET @CategoryId = (  
  Select Top 1 id From [Settings].[GetParentsCategoryByChild](@MainCategoryId) Order by sort desc  
 )  
 END  
    
 IF (    
   SELECT Count(productid)    
   FROM [Catalog].ProductExt    
   WHERE productid = @productId    
   ) > 0    
 BEGIN    
  UPDATE [Catalog].[ProductExt]    
  SET [CountPhoto] = @CountPhoto    
   ,[PhotoId] = @PhotoId       
   ,[VideosAvailable] = @VideosAvailable    
   ,[MaxAvailable] = @MaxAvailable    
   ,[NotSamePrices] = @NotSamePrices    
   ,[MinPrice] = @MinPrice    
   ,[Colors] = @Colors    
   ,[AmountSort] = @AmountSort    
   ,[OfferId] = @OfferId  
   ,[Comments] = @Comments   
   ,[CategoryId] = @CategoryId  
   ,[PriceTemp] = @PriceTemp  
   ,[Gifts] = @Gifts  
  WHERE [ProductId] = @productId    
 END    
 ELSE    
 BEGIN    
  INSERT INTO [Catalog].[ProductExt] (    
    [ProductId]    
   ,[CountPhoto]    
   ,[PhotoId]       
   ,[VideosAvailable]    
   ,[MaxAvailable]    
   ,[NotSamePrices]    
   ,[MinPrice]    
   ,[Colors]    
   ,[AmountSort]    
   ,[OfferId]  
   ,[Comments]  
   ,[CategoryId]  
   ,[PriceTemp]  
   ,[Gifts]  
   )    
  VALUES (    
    @productId    
   ,@CountPhoto    
   ,@PhotoId    
   ,@VideosAvailable    
   ,@MaxAvailable    
   ,@NotSamePrices    
   ,@MinPrice    
   ,@Colors    
   ,@AmountSort    
   ,@OfferId  
   ,@Comments  
   ,@CategoryId  
   ,@PriceTemp  
   ,@Gifts  
   )    
 END    
END   

GO--
ALTER PROCEDURE [Catalog].[sp_ParseProductProperty]
		@nameProperty nvarchar(100),
		@propertyValue nvarchar(255),
		@productId int,
		@sort int
AS
BEGIN
	-- select or create property
	Declare @propertyId int
	if ((select count(PropertyID) from Catalog.[Property] where Name = @nameProperty)= 0)
		begin
			insert into Catalog.[Property] (Name,UseInFilter,Useindetails,SortOrder,[type]) values (@nameProperty,1,1,0,1)
			set @propertyId = (Select SCOPE_IDENTITY())
		end
	else
		set @propertyId = (select top(1) PropertyID from Catalog.[Property] where Name = @nameProperty)

		-- select or create value
	 Declare @propertyValueId int

	 Declare @useinfilter bit
	 set @useinfilter = (Select Top 1 UseInFilter from Catalog.[Property] Where PropertyID=@propertyId)
	 Declare @useindetails bit
	 set @useindetails = (Select Top 1 UseInDetails from Catalog.[Property] Where PropertyID=@propertyId)

	 if ((select count(PropertyValueID) from Catalog.[PropertyValue] where Value = @propertyValue and PropertyId=@propertyId)= 0)
	  begin
	   insert into Catalog.[PropertyValue] 
		  (PropertyId, Value, UseInFilter, UseInDetails, SortOrder) 
		values (@propertyId, @propertyValue, @useinfilter, @useindetails, 0)
	   set @propertyValueId = (Select SCOPE_IDENTITY())
	  end
	 else
	  set @propertyValueId = (select top(1) PropertyValueID from Catalog.[PropertyValue] where Value = @propertyValue and PropertyId=@propertyId)
	
	--create link between product and property value
	if ((select Count(*) from Catalog.ProductPropertyValue where ProductID=@productId and PropertyValueID=@propertyValueId)=0)
		insert into Catalog.ProductPropertyValue (ProductID,PropertyValueID) values (@productId,@propertyValueId)	
END


GO--

update cms.staticblock set content=replace(content, '<img src="userfiles/image/banner.png" width="0" height="0" alt="" />', '') where [key]='bannerDetails'

GO--

UPDATE [Settings].[InternalSettings] SET [settingValue] = '5.0.2' WHERE [settingKey] = 'db_version'
GO--

