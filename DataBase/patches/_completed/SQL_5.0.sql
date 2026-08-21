
ALTER TABLE [Order].[PaymentMethod] ALTER COLUMN PaymentType nvarchar(50);
DROP INDEX IX_ShippingMethod ON [Order].ShippingMethod
GO--

ALTER TABLE [Order].ShippingMethod ALTER COLUMN ShippingType nvarchar(50);
update [Order].[PaymentMethod] 
set PaymentType=case PaymentType
				when '1' then 'SberBank'
				when '2' then 'Bill'
				when '3' then 'Cash'
				when '4' then 'MailRu'
				when '5' then 'WebMoney'
				when '6' then 'Robokassa'
        when '7' then 'YandexMoney'
        when '8' then 'AuthorizeNet'
        when '9' then 'GoogleCheckout'
        when '10' then 'eWAY'
        when '11' then 'Check'
        when '12' then 'PayPal'
        when '13' then 'TwoCheckout'
        when '14' then 'Assist'
        when '15' then 'ZPayment'
        when '16' then 'Platron'
        when '17' then 'Rbkmoney'
        when '18' then 'CyberPlat'
        when '19' then 'Moneybookers'
        when '20' then 'AmazonSimplePay'
        when '21' then 'ChronoPay'
        when '22' then 'PayOnline'
        when '23' then 'QIWI'
        when '24' then 'PSIGate'
        when '25' then 'PayPoint'
        when '26' then 'SagePay'
        when '27' then 'WorldPay'
        when '28' then 'CashOnDelivery'
        when '29' then 'PickPoint'
        when '30' then 'OnPay'
        when '31' then 'WalletOneCheckout'
        when '32' then 'GiftCertificate'
        when '33' then 'MasterBank'
        when '34' then 'Interkassa'
        when '35' then 'LiqPay'
        when '36' then 'BillUa'
        when '37' then 'Kupivkredit'
        when '38' then 'YesCredit'
        when '39' then 'PayAnyWay'
        when '40' then 'MoscowBank'
        when '41' then 'GateLine'
        when '42' then 'Qppi'
        when '43' then 'BitPay'
        when '44' then 'IntellectMoney'
        when '45' then 'Avangard'
        when '46' then 'Dibs'
        when '47' then 'RsbCredit'
        when '48' then 'DirectCredit'
        when '49' then 'PayPalExpressCheckout'
        when '50' then 'Interkassa2'
        when '51' then 'MoneXy'
        when '52' then 'NetPay'
        when '53' then 'YandexKassa'
        when '54' then 'AlfabankUa'
        when '55' then 'IntellectMoneyMainProtocol'
		end
				
update [Order].ShippingMethod 
set ShippingType=case ShippingType
when '1' then 'FreeShipping'
when '2' then 'FixedRate'
when '3' then 'ShippingByWeight'
when '4' then 'FedEx'        
when '5' then 'Ups'       
when '6' then 'Usps'
when '7' then 'eDost'
when '8' then 'ShippingByShippingCost'
when '9' then 'ShippingByOrderPrice'
when '10' then 'ShippingByRangeWeightAndDistance'
when '11' then 'ShippingNovaPoshta'
when '12' then 'SelfDelivery'
when '13' then 'Multiship'
when '14' then 'Sdek'
when '15' then 'ShippingByProductAmount'
when '16' then 'ShippingByEmsPost'
when '17' then 'CheckoutRu'
end

GO--
IF (EXISTS (SELECT * 
                 FROM INFORMATION_SCHEMA.TABLES 
                 WHERE TABLE_SCHEMA = 'Order' 
                 AND  TABLE_NAME = 'ShippingCache'))
BEGIN
	Drop table [Order].[ShippingCache]    
END

GO--
CREATE TABLE [Order].[ShippingCache](
	[ShippingMethodID] [int] NOT NULL,
	[ParamHash] [int] NOT NULL,
	[Options] [nvarchar](max) NOT NULL,
	[Created] [datetime] NOT NULL,
 CONSTRAINT [PK_ShippingCache] PRIMARY KEY CLUSTERED 
(
	[ShippingMethodID] ASC,
	[ParamHash] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON, FILLFACTOR = 80) ON [PRIMARY]
) ON [PRIMARY]

GO--

ALTER TABLE [Order].[ShippingCache]  WITH CHECK ADD  CONSTRAINT [FK_ShippingCache_ShippingMethod] FOREIGN KEY([ShippingMethodID])
REFERENCES [Order].[ShippingMethod] ([ShippingMethodID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO--

ALTER TABLE [Order].[ShippingCache] CHECK CONSTRAINT [FK_ShippingCache_ShippingMethod]
GO--



Insert Into [Settings].[Settings] (Name, Value) VALUES ('RelatedProductSourceType','0')

GO--

CREATE TABLE [Catalog].[RelatedCategories](
	[CategoryId] [int] NOT NULL,
	[RelatedCategoryId] [int] NOT NULL,
	[RelatedType] [int] NOT NULL
) ON [PRIMARY]

GO--

CREATE TABLE [Catalog].[RelatedProperties](
	[CategoryId] [int] NOT NULL,
	[PropertyId] [int] NOT NULL,
	[RelatedType] [int] NOT NULL
) ON [PRIMARY]

GO--

ALTER TABLE [Catalog].[RelatedProperties]  WITH CHECK ADD  CONSTRAINT [FK_RelatedProperties_Category] FOREIGN KEY([CategoryId])
REFERENCES [Catalog].[Category] ([CategoryID])
ON DELETE CASCADE
GO--

ALTER TABLE [Catalog].[RelatedProperties] CHECK CONSTRAINT [FK_RelatedProperties_Category]
GO--

ALTER TABLE [Catalog].[RelatedProperties]  WITH CHECK ADD  CONSTRAINT [FK_RelatedProperties_Property] FOREIGN KEY([PropertyId])
REFERENCES [Catalog].[Property] ([PropertyID])
ON DELETE CASCADE
GO--

ALTER TABLE [Catalog].[RelatedProperties] CHECK CONSTRAINT [FK_RelatedProperties_Property]
GO--


-----

ALTER TABLE Catalog.Product ADD
	Length float(53) NULL,
	Width float(53) NULL,
	Height float(53) NULL

GO--



Alter PROCEDURE [Catalog].[sp_AddProduct]    
   @ArtNo nvarchar(50) = '',  
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
   @Gtin nvarchar(50),  
   @Adult bit,
   @Length float,
   @Width float,
   @Height float
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
		   ,Gtin  
		   ,Adult
		   ,Length
		   ,Width
		   ,Height
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
		   @Gtin,  
		   @Adult,
		   @Length,
		   @Width,
		   @Height
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
  @ArtNo nvarchar(50),  
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
  @Gtin nvarchar(50),  
  @Adult bit,
  @Length float,
  @Width float,
  @Height float
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
  ,[Gtin]=@Gtin  
  ,[Adult] = @Adult
  ,[Length] = @Length
  ,[Width] = @Width
  ,[Height] = @Height
 WHERE ProductID = @ProductID    
END  

GO--


Update Catalog.Product
Set [Length] = 0,
	Height = 0,
	Width = 0

GO--

Update Catalog.Product
Set [Length] = CAST(REPLACE(PARSENAME(REPLACE(Size,'|','.'),1), ',', '.') as float),
	Height = CAST(REPLACE(PARSENAME(REPLACE(Size,'|','.'),2), ',', '.') as float),
	Width = CAST(REPLACE(PARSENAME(REPLACE(Size,'|','.'),3), ',', '.') as float)

GO--

ALTER TABLE Catalog.Product
	DROP COLUMN Size

GO--


--------

CREATE TABLE [Catalog].[ProductList](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[SortOrder] [int] NOT NULL,
	[Enabled] [bit] NOT NULL,
 CONSTRAINT [PK_ProductList] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO--

CREATE TABLE [Catalog].[Product_ProductList](
	[ListId] [int] NOT NULL,
	[ProductId] [int] NOT NULL,
	[SortOrder] [int] NOT NULL,
 CONSTRAINT [PK_Product_ProductList] PRIMARY KEY CLUSTERED 
(
	[ListId] ASC,
	[ProductId] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO--


ALTER TABLE [Catalog].[Product_ProductList]  WITH CHECK ADD  CONSTRAINT [FK_Product_ProductList_ProductList] FOREIGN KEY([ListId])
REFERENCES [Catalog].[ProductList] ([Id])
ON DELETE CASCADE
GO--

ALTER TABLE [Catalog].[Product_ProductList] CHECK CONSTRAINT [FK_Product_ProductList_ProductList]
GO--

--------

Insert Into [CMS].[StaticBlock] ([Key],[InnerName],[Content],[Added],[Modified],[Enabled]) Values('SearchBottom', 'search bottom block', '', GETDATE(), GETDATE(), 1)
GO--


------




ALTER TABLE Catalog.Category ADD
	DisplayStyle1 int NULL
	
GO--

Update [Catalog].[Category]
	Set DisplayStyle1 = 
	(Case When DisplayStyle <> 'True' and DisplayStyle <> 'Tile' and DisplayStyle <> 'List' and 
			   DisplayStyle <> 'true' and DisplayStyle <> 'tile' and DisplayStyle <> 'list' Then 0	Else 1 End)
GO--


ALTER TABLE [Catalog].[Category]
	DROP COLUMN DisplayStyle
GO--

EXECUTE sp_rename N'Catalog.Category.DisplayStyle1', N'DisplayStyle', 'COLUMN' 
GO--

ALTER TABLE [Catalog].[Category] ALTER COLUMN [DisplayStyle] INTEGER NOT NULL
GO--

ALTER PROCEDURE [Catalog].[sp_UpdateCategory]  
  
  @CategoryID int,  
  @Name nvarchar(255),  
  @ParentCategory int,  
  @Description nvarchar(max),  
  @BriefDescription nvarchar(max),  
  @SortOrder int,  
  @Enabled bit,  
  @DisplayStyle int,  
  @DisplayChildProducts bit = '0',  
  @DisplayBrandsInMenu bit,  
  @DisplaySubCategoriesInMenu bit,  
  @UrlPath nvarchar(150),  
  @Sorting int  
  
AS  
BEGIN    
UPDATE [Catalog].[Category]  
    SET   
     [Name] = @Name  
    ,[ParentCategory] = @ParentCategory  
    ,[Description] = @Description  
    ,[BriefDescription] = @BriefDescription  
    ,[SortOrder] = @SortOrder  
    ,[Enabled] = @Enabled  
    ,[DisplayStyle] = @DisplayStyle  
    ,[DisplayChildProducts] = @DisplayChildProducts  
    ,[DisplayBrandsInMenu] = @DisplayBrandsInMenu  
    ,[DisplaySubCategoriesInMenu] = @DisplaySubCategoriesInMenu  
    ,[UrlPath]=@UrlPath  
    ,Sorting = @Sorting  
  WHERE CategoryID = @CategoryID  
END  
GO--

ALTER PROCEDURE [Catalog].[sp_AddCategory]    
  @Name nvarchar(255),  
  @ParentCategory int,  
  @Description nvarchar(max),  
  @BriefDescription nvarchar(max),  
  @SortOrder int,  
  @Enabled bit,  
  @DisplayStyle int,  
  @DisplayChildProducts bit,  
  @DisplayBrandsInMenu bit,  
  @DisplaySubCategoriesInMenu bit,  
  @UrlPath nvarchar(150),  
  @Sorting int  
AS  
BEGIN  
 INSERT INTO [Catalog].[Category]  
    (  
       [Name]  
      ,[ParentCategory]  
      ,[Description]  
      ,[BriefDescription]  
      ,[Products_Count]  
      ,[SortOrder]  
      ,[Enabled]  
      ,[DisplayStyle]  
      ,[DisplayChildProducts]  
      ,[DisplayBrandsInMenu]  
      ,[DisplaySubCategoriesInMenu]  
      ,[UrlPath]  
      ,[Sorting]
   )  
   VALUES  
   (  
    @Name,  
    @ParentCategory,  
    @Description,  
    @BriefDescription,  
    0,  
    @SortOrder,  
    @Enabled,  
    @DisplayStyle,  
    @DisplayChildProducts,  
    @DisplayBrandsInMenu,  
    @DisplaySubCategoriesInMenu,  
    @UrlPath,  
    @Sorting);  
 Select SCOPE_IDENTITY();  
END 
GO--


ALTER TABLE Catalog.Currency ADD
	RoundNumbers int NULL
GO--

Update Catalog.Currency Set RoundNumbers = 1
GO--

ALTER TABLE Catalog.Currency ADD
	EnablePriceRounding bit NULL
GO--

Update Catalog.Currency Set EnablePriceRounding = 0
GO--

ALTER TABLE Catalog.Currency
	DROP COLUMN PriceFormat
GO--


ALTER PROCEDURE [Catalog].[sp_GetChildCategoriesByParentID]  
 @ParentCategoryID int,  
 @HasProducts bit,  
 @bigType  nvarchar(50),  
 @smallType  nvarchar(50)  
AS  
BEGIN  
  
if @hasProducts = 0  
 SELECT   
  *,  
  (SELECT Count(CategoryID) FROM [Catalog].[Category] AS c WHERE c.ParentCategory = p.CategoryID) AS [ChildCategories_Count],  
  (SELECT PhotoName FROM [Catalog].[Photo] AS c WHERE c.[ObjId] = p.CategoryID and [Type]=@bigType) AS Picture,  
  (SELECT PhotoName FROM [Catalog].[Photo] AS c WHERE c.[ObjId] = p.CategoryID and [Type]=@smallType) AS MiniPicture  
 FROM [Catalog].[Category] AS p WHERE [ParentCategory] = @ParentCategoryID AND CategoryID <> 0   
 ORDER BY SortOrder, Name
else  
 SELECT   
  *,  
  (SELECT Count(CategoryID) FROM [Catalog].[Category] AS c WHERE c.ParentCategory = p.CategoryID) AS [ChildCategories_Count] ,  
  (SELECT PhotoName FROM [Catalog].[Photo] AS c WHERE c.[ObjId] = p.CategoryID and [Type]=@bigType) AS Picture,  
  (SELECT PhotoName FROM [Catalog].[Photo] AS c WHERE c.[ObjId] = p.CategoryID and [Type]=@smallType) AS MiniPicture  
 FROM [Catalog].[Category] AS p WHERE [ParentCategory] = @ParentCategoryID AND CategoryID <> 0 and Products_Count > 0  
 ORDER BY SortOrder, Name
END
GO--




ALTER TABLE Catalog.ProductExt ADD
	Comments int NULL,
	CategoryId int NULL
GO--

Update [Catalog].[ProductExt] Set [ProductExt].Comments = 0
GO--

Update [Catalog].[ProductExt] Set [ProductExt].Comments = c.Amount 
From [Catalog].[ProductExt]
Inner Join (Select Count([ReviewId]) as Amount, EntityId From [CMS].[Review] Where Type = 0 and Checked = 1 Group By EntityId, Type) as c
ON [ProductExt].ProductId = c.EntityId
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
 DECLARE @AmountSort BIT  
 DECLARE @OfferId int  
 DECLARE @Comments int
 DECLARE @CategoryId int
   
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
   WHERE offer.productid = @productId  
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
   WHERE offer.productid = @productId  
   )  
   Set @OfferId = (SELECT OfferID  
   FROM CATALOG.offer  
   WHERE offer.productid = @productId and (offer.Main = 1 OR offer.Main IS NULL)) 
 
 --@Comments
 SET @Comments = (
	SELECT Count(ReviewId) From CMS.Review Where EntityId = @productId And Checked = 1
	)   
 
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
   )  
 END  
END  
GO--



ALTER PROCEDURE [Catalog].[PreCalcProductParamsMass] AS BEGIN
SET NOCOUNT ON;
INSERT INTO [Catalog].[ProductExt] (ProductId,CountPhoto,PhotoId,VideosAvailable,MaxAvailable,NotSamePrices,MinPrice,Colors,AmountSort,OfferId,Comments,CategoryId)
  (SELECT ProductId,
          0,
          NULL,
          0,
          0,
          0,
          0,
          NULL,
          0,
          NULL,
          0,
		  NULL
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
	   WHERE [ProductID] = [ProductExt].ProductId
		 AND main =1),
    
    [PhotoId] =
	  (SELECT Top(1) CASE
						 WHEN Offer.ColorID IS NOT NULL THEN
								(SELECT TOP (1) PhotoId
								 FROM [Catalog].[Photo]
								 WHERE ([Photo].ColorID = Offer.ColorID
										OR [Photo].ColorID IS NULL)
								   AND [Photo].[ObjId] = [ProductExt].ProductId
								   AND TYPE = 'Product'
								 ORDER BY main DESC ,[Photo].[PhotoSortOrder])
						 ELSE
								(SELECT TOP (1) PhotoId
								 FROM [Catalog].[Photo]
								 WHERE [Photo].[ObjId] = [ProductExt].ProductId
								   AND TYPE = 'Product'
								 ORDER BY main DESC ,[Photo].[PhotoSortOrder])
					 END
	   FROM [Catalog].[Offer]
	   WHERE [ProductID] = [ProductExt].ProductId
		 AND main =1),
    
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
	   WHERE offer.productid = [ProductExt].ProductId),
	   
    [MinPrice] =
	  (SELECT min(price) FROM [Catalog].offer WHERE offer.productid = [ProductExt].ProductId),
	  
    [Colors] =
	  (SELECT [Settings].[ProductColorsToString]([ProductExt].ProductId)),
	  
    [AmountSort] =
	  (SELECT Top(1) CASE
						 WHEN MaxAvailable <= 0
							  OR MaxAvailable < IsNull(Product.MinAmount, 0) THEN 0
						 ELSE 1
					 END
	   FROM [Catalog].Offer
	   INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
	   WHERE Offer.ProductId = [ProductExt].ProductId
		 AND main = 1),
		 
    [OfferId] =
	  (SELECT Top(1) OfferID
	   FROM [Catalog].offer
	   WHERE offer.productid = [ProductExt].ProductId
		 AND (offer.Main = 1 OR offer.Main IS NULL)),
	
	[Comments] = 
	  (SELECT Count(ReviewId) From CMS.Review Where EntityId = [ProductExt].ProductId And Checked = 1),
	
	-- 1. get main category of product, 2. get root category by main category
	[CategoryId] = 	  
	  (Select Top 1 id From [Settings].[GetParentsCategoryByChild]((SELECT top 1 CategoryID FROM [Catalog].ProductCategories WHERE ProductID = [ProductExt].ProductId ORDER BY Main DESC)) Order by sort desc)
END

GO--


ALTER FUNCTION [Settings].[ProductColorsToString]  
(  
 @ProductId int  
)  
RETURNS nvarchar(Max)  
AS  
BEGIN  
	DECLARE @result nvarchar(max)  
    ;with cte as (  
		Select Color.ColorID, ColorName, ColorCode, SortOrder, isnull(PhotoName, '') as PhotoName, Sum(1*Offer.Main) as Main  
		From Catalog.Offer 
		Left join catalog.color on Color.ColorID=Offer.ColorID   
		Inner Join catalog.product on Product.ProductID = Offer.ProductID  
		Left join catalog.photo on color.Colorid = photo.ObjId and photo.type = 'color'  
		WHERE Product.ProductID=@ProductId and (Product.AllowPreorder=1 or Offer.Amount >0) 
		Group by Color.ColorID, ColorName, ColorCode, SortOrder,PhotoName  
    )  
    SELECT  @result= coalesce(@result + ', ', '[') + '{ColorId:' + convert(nvarchar(max), ColorID) + ', ColorName:''' + Replace(ColorName, '''', '&rsquo;') + ''', ColorCode:''' + ColorCode +''', PhotoName:''' + PhotoName + ''', Main:' + convert(nvarchar(max), Main) + '}'  
	FROM cte order by SortOrder  
	set @result = @result + ']'  
	return @result  
END 
GO--

[Catalog].[PreCalcProductParamsMass]
GO--



ALTER TABLE Catalog.Product ADD
	CurrencyID int NULL

GO--

ALTER TABLE Catalog.Product ADD CONSTRAINT
	FK_Product_Currency FOREIGN KEY
	(
		CurrencyID
	) REFERENCES Catalog.Currency
	(
	CurrencyID
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
GO--

update catalog.product set 
currencyid = (select top 1 currency.Currencyid from catalog.currency where currencyvalue=1)

GO--




ALTER PROCEDURE [Catalog].[sp_AddProduct]    
   @ArtNo nvarchar(50) = '',  
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
   @Gtin nvarchar(50),  
   @Adult bit,
   @Length float,
   @Width float,
   @Height float,
   @CurrencyID int
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
		   ,Gtin  
		   ,Adult
		   ,Length
		   ,Width
		   ,Height
		   ,CurrencyID
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
		   @Gtin,  
		   @Adult,
		   @Length,
		   @Width,
		   @Height,
		   @CurrencyID
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
  @ArtNo nvarchar(50),  
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
  @Gtin nvarchar(50),  
  @Adult bit,
  @Length float,
  @Width float,
  @Height float,
  @CurrencyID int
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
  ,[Gtin]=@Gtin  
  ,[Adult] = @Adult
  ,[Length] = @Length
  ,[Width] = @Width
  ,[Height] = @Height
  ,[CurrencyID] = @CurrencyID
 WHERE ProductID = @ProductID    
END  
GO--


ALTER procedure [Catalog].[sp_GetPropertyInFilter]  
(    
 @categoryId int,  
 @useDepth bit  
)  
AS  
begin  
if (@useDepth = 1)  
 begin  
  ;WITH products(PropertyValueID)  
  AS  
  (  
   Select distinct PropertyValueID From [Catalog].[ProductPropertyValue]  
   where ProductID in (  
        select [ProductCategories].ProductID from [Catalog].[ProductCategories]  
        Inner Join [Catalog].Product On [ProductCategories].ProductID = [Product].ProductID and [Product].[Enabled] = 1  
        Where [CategoryID] in (Select id from  [Settings].[GetChildCategoryByParent](@categoryId))  
        )  
  )  
  SELECT [PropertyValue].[PropertyValueID],  
    [PropertyValue].[PropertyID],  
    [PropertyValue].[Value],
    [PropertyValue].[RangeValue],      
    [Property].Name as  PropertyName,  
    [Property].SortOrder as  PropertySortOrder,  
    [Property].Expanded as  PropertyExpanded,  
    [Property].Unit as  PropertyUnit,  
    [Property].Type as  PropertyType      
         
  FROM [Catalog].[PropertyValue]  
  Inner Join [Catalog].[Property] On  [Property].PropertyID = [PropertyValue].PropertyID AND [Property].[UseInFilter] = 1   
  Where [PropertyValue].[UseInFilter] = 1 and [PropertyValue].PropertyValueID in (Select PropertyValueID from products)   
  ORDER BY PropertySortOrder, [PropertyValue].[PropertyID], [PropertyValue].[SortOrder], [PropertyValue].[Value]  
 end  
else  
 begin  
  ;WITH products(PropertyValueID)  
  AS  
  (  
   Select distinct PropertyValueID From [Catalog].[ProductPropertyValue]  
   where ProductID in (  
        select [ProductCategories].ProductID from [Catalog].[ProductCategories]  
        Inner Join [Catalog].Product On [ProductCategories].ProductID = [Product].ProductID and [Product].[Enabled] = 1  
        Where [CategoryID] in (@categoryId)  
        )  
  )  
  SELECT [PropertyValue].[PropertyValueID],  
    [PropertyValue].[PropertyID],  
    [PropertyValue].[Value],  
    [PropertyValue].[RangeValue],
    [Property].Name as  PropertyName,  
    [Property].SortOrder as  PropertySortOrder,  
    [Property].Expanded as  PropertyExpanded,  
    [Property].Unit as  PropertyUnit,  
    [Property].Type as  PropertyType      
         
  FROM [Catalog].[PropertyValue]  
  Inner Join [Catalog].[Property] On  [Property].PropertyID = [PropertyValue].PropertyID AND [Property].[UseInFilter] = 1   
  Where [PropertyValue].[UseInFilter] = 1 and [PropertyValue].PropertyValueID in (Select PropertyValueID from products)   
  ORDER BY PropertySortOrder, [PropertyValue].[PropertyID], [PropertyValue].[SortOrder], [PropertyValue].[Value]  
 end   
end  
GO--


ALTER TABLE Catalog.ShoppingCart ADD
	IsGift bit NULL

GO--

ALTER TABLE Catalog.ShoppingCart ADD
	ModuleKey nvarchar(50) NULL

GO--
Insert Into [Settings].[Settings] ([Name],[Value]) Values ('IsStoreClosed', 'False')
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

ALTER PROCEDURE [Catalog].[sp_AddProperty]
	@Name nvarchar(100),
	@UseInFilter bit = 0, 
	@SortOrder int = 0,
	@Expanded bit = 0,
	@UseInDetails bit = 1,
	@Description nvarchar(500),
	@Unit nvarchar(25),
	@Type tinyint,
	@GroupId int,	
	@UseInBrief bit = 0
AS
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [Catalog].[Property] (Name, SortOrder, UseInFilter, Expanded, UseInDetails, Description, Unit, Type, GroupId, UseInBrief) 
	VALUES (@Name, @SortOrder, @UseInFilter, @Expanded, @UseInDetails, @Description, @Unit, @Type, @GroupId, @UseInBrief)
	SELECT SCOPE_IDENTITY()
END

GO--


ALTER PROCEDURE [Catalog].[sp_UpdateProperty]
	@PropertyID int,
    @Name nvarchar(100),
    @UseInFilter bit,
    @SortOrder int,
    @Expanded bit,
	@UseInDetails bit,
	@Description nvarchar(500),
	@Unit nvarchar(25),
	@Type tinyint,
	@GroupId int,
	@UseInBrief bit
AS
BEGIN
	SET NOCOUNT ON;

UPDATE [Catalog].[Property]
   SET [Name] = @Name
      ,[UseInFilter] = @UseInFilter
      ,[SortOrder] = @SortOrder
      ,[Expanded] = @Expanded
	  ,[UseInDetails] = @UseInDetails
	  ,[Description] = @Description
	  ,[Unit] = @Unit
	  ,[Type] = @Type
	  ,[GroupId] = @GroupId
	  ,[UseInBrief] = @UseInBrief
 WHERE [PropertyID] = @PropertyID
END


GO--

update [Catalog].[Property] set useinbrief = 0
update [Catalog].[Propertyvalue] set useinbrief = 0

GO--

ALTER PROCEDURE [Catalog].[sp_GetPropertyValuesByProductID] @ProductID INT
AS
BEGIN
	SET NOCOUNT ON;

	SELECT
		 [PropertyValue].[PropertyValueID]
		,[PropertyValue].[PropertyID]
		,[PropertyValue].[Value]
		,[ProductPropertyValue].[SortOrder]
		,[Property].UseinFilter
		,[Property].UseIndetails
		,[Property].UseInBrief
		,[Property].[Name] as PropertyName
		,[Property].[SortOrder] as PropertySortOrder
		,[Property].[Expanded] as Expanded
		,[Property].[Type] as [Type]
		,[Property].GroupId as GroupId
		,GroupName
		,GroupSortorder
	FROM [Catalog].[PropertyValue]
	INNER JOIN [Catalog].[ProductPropertyValue] ON [ProductPropertyValue].[PropertyValueID] = [PropertyValue].[PropertyValueID]
	inner join [Catalog].[Property] on [Property].[PropertyID] = [PropertyValue].[PropertyID]
	left join Catalog.PropertyGroup on propertyGroup.PropertyGroupID = [Property].GroupID
	WHERE [ProductID] = @ProductID
	ORDER BY case when PropertyGroup.GroupSortOrder is null then 1 else 0 end, PropertyGroup.GroupSortOrder, [Property].[SortOrder], [PropertyValue].[SortOrder]
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
		,Property.NAME AS PropertyName
		,Property.SortOrder AS PropertySortOrder
		,Property.Expanded
		,Property.Type
		,GroupId
		,GroupName
		,GroupSortorder
	FROM [Catalog].[PropertyValue]
	INNER JOIN [Catalog].[Property] ON [Property].[PropertyID] = [PropertyValue].[PropertyID]
	LEFT JOIN [Catalog].PropertyGroup ON PropertyGroup.PropertyGroupID = [Property].GroupID
	WHERE [Property].[PropertyID] = @PropertyID
	order by [PropertyValue].[SortOrder]
END
GO--
ALTER TABLE [Order].[Order] ADD
	ManagerId uniqueidentifier NULL

GO--

CREATE TABLE [Customers].[Departments](
	[DepartmentId] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[Sort] [int] NOT NULL,
	[Enabled] [bit] NOT NULL,
 CONSTRAINT [PK_Departments] PRIMARY KEY CLUSTERED 
(
	[DepartmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO--

CREATE TABLE [Customers].[Managers](
	[ManagerId] [int] IDENTITY(1,1) NOT NULL,
	[CustomerId] [uniqueidentifier] NOT NULL CONSTRAINT [DF_Managers_CustomerID]  DEFAULT (newid()),
	[DepartmentId] [int] NULL,
	[Position] [nvarchar](100) NULL,
 CONSTRAINT [PK_Managers] PRIMARY KEY CLUSTERED 
(
	[CustomerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO--
ALTER TABLE [Customers].[Managers]  WITH CHECK ADD  CONSTRAINT [FK_Managers_Customer] FOREIGN KEY([CustomerId])
REFERENCES [Customers].[Customer] ([CustomerID])
ON DELETE CASCADE

GO--

ALTER TABLE [Customers].[Managers]  WITH CHECK ADD  CONSTRAINT [FK_Managers_Departments] FOREIGN KEY([DepartmentId])
REFERENCES [Customers].[Departments] ([DepartmentId])
ON DELETE SET NULL

GO--

CREATE TABLE [Order].StatusHistory
	(
	Date datetime NOT NULL,
	OrderID int NOT NULL,
	PreviousStatus nvarchar(50) NOT NULL,
	NewStatus nvarchar(50) NOT NULL,
	CustomerID uniqueidentifier NULL,
	CustomerName nvarchar(500) NOT NULL,
	Basis nvarchar(500) NOT NULL
	)  ON [PRIMARY]

GO--


ALTER TABLE Customers.Customer ADD
	AdminComment nvarchar(MAX) NULL

GO--


ALTER PROCEDURE [Customers].[sp_AddCustomer]  
	   @CustomerGroupID int,  
	   @Password nvarchar(100),  
	   @FirstName nvarchar(70),  
	   @LastName nvarchar(70),  
	   @Phone nvarchar(max),  
       @RegistrationDateTime datetime,             
       @Email nvarchar(100),  
       @CustomerRole int,  
       @Patronymic nvarchar(70),
       @BonusCardNumber bigint,
	   @AdminComment nvarchar(MAX)
AS  
BEGIN  
 INSERT INTO [Customers].[Customer]  
           ([CustomerGroupID]  
           ,[Password]  
           ,[FirstName]  
           ,[LastName]  
           ,[Phone]  
           ,[RegistrationDateTime]             
           ,[Email]  
           ,[CustomerRole]  
           ,[Patronymic]
           ,[BonusCardNumber]
		   ,[AdminComment])  
     VALUES  
           (@CustomerGroupID  
           ,@Password  
           ,@FirstName  
           ,@LastName  
           ,@Phone  
           ,@RegistrationDateTime             
           ,@Email  
           ,@CustomerRole  
           ,@Patronymic
           ,@BonusCardNumber
		   ,@AdminComment);  
     SELECT CustomerID from [Customer] where Email =@Email  
END  

GO--


ALTER PROCEDURE [Customers].[sp_UpdateCustomerInfo]  
   @CustomerID uniqueidentifier,  
   @FirstName nvarchar(70),  
   @LastName nvarchar(70),  
   @Phone nvarchar(max),     
   @Email nvarchar(100),  
   @CustomerGroupId int = NULL,  
   @CustomerRole int, 
   @BonusCardNumber bigint,
   @AdminComment nvarchar(MAX)
AS  
BEGIN  
 UPDATE [Customers].[Customer]  
    SET [FirstName] = @FirstName,
		[LastName] = @LastName,
		[Phone] = @Phone,		
		[Email] = @Email,
		[CustomerGroupId] = @CustomerGroupId,
		[CustomerRole] = @CustomerRole,
		[BonusCardNumber] = @BonusCardNumber,
		[AdminComment] = @AdminComment
   WHERE CustomerID = @CustomerID
END 

GO--

ALTER TABLE Customers.Customer ADD
	ManagerId int NULL

GO--

ALTER TABLE Customers.Customer ADD
	Rating int NULL

GO--

Update  Customers.Customer Set Rating = 0

GO--

ALTER TABLE Customers.Customer 
Alter Column Rating int NOT NULL

GO--


ALTER PROCEDURE [Customers].[sp_AddCustomer]  
	   @CustomerGroupID int,  
	   @Password nvarchar(100),  
	   @FirstName nvarchar(70),  
	   @LastName nvarchar(70),  
	   @Phone nvarchar(max),  
       @RegistrationDateTime datetime,             
       @Email nvarchar(100),  
       @CustomerRole int,  
       @Patronymic nvarchar(70),
       @BonusCardNumber bigint,
	   @AdminComment nvarchar(MAX),
	   @ManagerId int,
	   @Rating int
AS  
BEGIN  
 INSERT INTO [Customers].[Customer]  
           ([CustomerGroupID]  
           ,[Password]  
           ,[FirstName]  
           ,[LastName]  
           ,[Phone]  
           ,[RegistrationDateTime]             
           ,[Email]  
           ,[CustomerRole]  
           ,[Patronymic]
           ,[BonusCardNumber]
		   ,[AdminComment]
		   ,[ManagerId]
		   ,[Rating])  
     VALUES  
           (@CustomerGroupID  
           ,@Password  
           ,@FirstName  
           ,@LastName  
           ,@Phone  
           ,@RegistrationDateTime             
           ,@Email  
           ,@CustomerRole  
           ,@Patronymic
           ,@BonusCardNumber
		   ,@AdminComment
		   ,@ManagerId
		   ,@Rating);  
     SELECT CustomerID from [Customer] where Email =@Email  
END  

GO--


ALTER PROCEDURE [Customers].[sp_UpdateCustomerInfo]  
   @CustomerID uniqueidentifier,  
   @FirstName nvarchar(70),  
   @LastName nvarchar(70),  
   @Phone nvarchar(max),     
   @Email nvarchar(100),  
   @CustomerGroupId int = NULL,  
   @CustomerRole int, 
   @BonusCardNumber bigint,
   @AdminComment nvarchar(MAX),
   @ManagerId int,
   @Rating int
AS  
BEGIN  
 UPDATE [Customers].[Customer]  
    SET [FirstName] = @FirstName,
		[LastName] = @LastName,
		[Phone] = @Phone,		
		[Email] = @Email,
		[CustomerGroupId] = @CustomerGroupId,
		[CustomerRole] = @CustomerRole,
		[BonusCardNumber] = @BonusCardNumber,
		[AdminComment] = @AdminComment,
		[ManagerId] = @ManagerId,
		[Rating] = @Rating
   WHERE CustomerID = @CustomerID
END 

GO--

ALTER TABLE [Order].OrderStatus ADD
	IsCompleted bit NULL

GO--

Update [Order].OrderStatus set IsCompleted=0
Update [Order].OrderStatus set IsCompleted=1 where StatusName = 'Доставлен'

GO--

ALTER TABLE [Order].OrderStatus alter column IsCompleted bit not NULL

GO--
ALTER PROCEDURE [Order].[sp_AddOrderStatus]
	@OrderStatusID int,
	@StatusName nvarchar(50),
	@CommandID int,
	@IsDefault bit,
	@IsCanceled bit,
	@IsCompleted bit,
	@Color nvarchar(10),
	@SortOrder int
AS
BEGIN
	declare @hasDefault bit;
	if (select count(orderStatusID) from [Order].[OrderStatus] where isdefault=1) = 1
		set @hasDefault = 1
	else
		set @hasDefault = 0
		
	if (@hasDefault=1 & @IsDefault)
	begin
		update [Order].[OrderStatus] set IsDefault = 0
	end
	
	insert into [Order].[OrderStatus] (StatusName, CommandID, IsDefault, IsCanceled, IsCompleted, Color, SortOrder) 
							   VALUES (@StatusName, @CommandID, @IsDefault | ~@hasDefault, @IsCanceled, @IsCompleted, @Color, @SortOrder)
	select SCOPE_IDENTITY()	    
END

GO--

ALTER PROCEDURE [Order].[sp_UpdateOrderStatus]
	@OrderStatusID int,
	@StatusName nvarchar(50),
	@CommandID int,
	@IsDefault bit,
	@IsCanceled bit,	
	@IsCompleted bit,	
	@Color nvarchar(10),
	@SortOrder int
AS
BEGIN
	declare @hasDefault bit;
	if (select count(orderStatusID) from [Order].[OrderStatus] where isdefault=1 and OrderStatusID<>@OrderStatusID ) = 1
		set @hasDefault = 1
	else
		set @hasDefault = 0

	if (@hasDefault=1 & @IsDefault)
	begin
		update [Order].[OrderStatus] set IsDefault = 0
	end

	update [Order].[OrderStatus]
	SET StatusName = @StatusName, CommandID = @CommandID, IsDefault = @IsDefault | ~@hasDefault,
		IsCanceled = @IsCanceled, IsCompleted=@IsCompleted, Color = @Color, SortOrder = @SortOrder
		Where OrderStatusID = @OrderStatusID
END	

GO--

if(Exists (SELECT
    * 
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
    WHERE CONSTRAINT_NAME ='FK_Order_Customer' ))

     ALTER TABLE [Order].[Order] DROP CONSTRAINT FK_Order_Customer

GO--

ALTER TABLE [Order].[Order] ADD
	OrderType nvarchar(50) NULL
GO--

update [Order].[Order] set OrderType = 'None'

GO--

ALTER TABLE [Order].[Order] 
	alter column OrderType nvarchar(50) not NULL

GO--

ALTER TABLE Customers.CustomerGroup ADD
	MinimumOrderPrice float(53) NULL

GO--

update  Customers.CustomerGroup set MinimumOrderPrice = (Select convert (float, replace(value,',', '.')) from settings.settings where name='MinimalOrderPrice')


ALTER TABLE Customers.CustomerGroup 
alter column  MinimumOrderPrice  float(53) not NULL

GO--

delete from settings.settings where name='MinimalOrderPrice'

GO--

CREATE TABLE [Catalog].[Tag](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](450) NOT NULL,
	[Enabled] [bit] NOT NULL,
	[BriefDescription] [nvarchar](max) NULL,
	[Description] [nvarchar](max) NULL,
	[UrlPath] [nvarchar](450) NOT NULL,
 CONSTRAINT [PK_Tag] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY],
 CONSTRAINT [IX_Tag] UNIQUE NONCLUSTERED 
(
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO--

CREATE TABLE [Catalog].[TagMap](
	[ObjId] [int] NOT NULL,
	[TagId] [int] NOT NULL,
	[Type] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_TagMap] PRIMARY KEY CLUSTERED 
(
	[ObjId] ASC,
	[TagId] ASC,
	[Type] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]
) ON [PRIMARY]

GO--


Create TRIGGER [Catalog].[TagDeleted] ON [Catalog].[Tag]
WITH EXECUTE AS CALLER
FOR DELETE
AS
BEGIN
	SET NOCOUNT ON;
	DELETE FROM [SEO].[MetaInfo] WHERE [ObjId] in (select Id FROM Deleted) and Type='Tag'
	Delete From [Catalog].TagMap where TagId in (select Id FROM Deleted)
END
GO--

CREATE TABLE Settings.Reseller
	(
	ResellerID uniqueidentifier NOT NULL,
	Name nvarchar(50) NOT NULL,
	PurchaseDiscount float(53) NOT NULL,
	RecommendedPriceMargin float(53) NOT NULL,
	ExportOnlyActiveProducts bit NOT NULL,
	)  ON [PRIMARY]

GO--
ALTER TABLE Settings.Reseller ADD CONSTRAINT
	PK_Reseller PRIMARY KEY CLUSTERED 
	(
	ResellerID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]


GO--

CREATE TABLE [Settings].[Localization](
	[LanguageId] [int] NOT NULL,
	[ResourceKey] [nvarchar](100) NOT NULL,
	[ResourceValue] [nvarchar](max) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO--


ALTER TABLE Customers.Managers ADD
	Active bit NULL

GO--

Update Customers.Managers Set Active = 1

GO--

ALTER TABLE Customers.Managers Alter Column Active bit Not Null

GO--

Delete From [Settings].[Language]
GO--

SET IDENTITY_INSERT [Settings].[Language] ON

Insert Into [Settings].[Language] ([LanguageId],[Name],[LanguageCode]) Values (1,'Русский', 'ru-RU')
Insert Into [Settings].[Language] ([LanguageId],[Name],[LanguageCode]) Values (2,'English', 'en-US')

SET IDENTITY_INSERT [Settings].[Language] OFF
GO--

Insert Into [Settings].[Localization] ([LanguageId],[ResourceKey],[ResourceValue]) Values (1, 'MainPage', 'Главная')
Insert Into [Settings].[Localization] ([LanguageId],[ResourceKey],[ResourceValue]) Values (2, 'MainPage', 'Main page')
GO--

CREATE UNIQUE NONCLUSTERED INDEX IX_RedirectFrom ON [Settings].Redirect(RedirectFrom);
GO--

CREATE TABLE [Customers].[ManagerTask](
	[TaskId] [int] IDENTITY(1,1) NOT NULL,
	[AssignedManagerId] [int] NOT NULL,
	[AppointedManagerId] [int] NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Description] [nvarchar](max) NOT NULL,
	[Status] [int] NOT NULL,
	[DueDate] [datetime] NOT NULL,
	[DateCreated] [datetime] NOT NULL,
	[DateModified] [datetime] NOT NULL,
	[OrderId] [int] NULL,
	[CustomerId] [uniqueidentifier] NULL,
 CONSTRAINT [PK_ManagerTask] PRIMARY KEY CLUSTERED 
(
	[TaskId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO--

Alter Table [Catalog].[Product]
Add ActiveView360 bit Null

GO--

Update [Catalog].[Product] Set ActiveView360 = 0

GO--

Alter Table [Catalog].[Product]
Alter Column ActiveView360 bit NOT Null

GO--


ALTER PROCEDURE [Catalog].[sp_UpdateProductById]  
  @ProductID int,      
  @ArtNo nvarchar(50),  
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
  @Gtin nvarchar(50),  
  @Adult bit,
  @Length float,
  @Width float,
  @Height float,
  @CurrencyID int,
  @ActiveView360 bit
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
  ,[Gtin]=@Gtin  
  ,[Adult] = @Adult
  ,[Length] = @Length
  ,[Width] = @Width
  ,[Height] = @Height
  ,[CurrencyID] = @CurrencyID
  ,[ActiveView360] = @ActiveView360
 WHERE ProductID = @ProductID    
END  

GO--


ALTER PROCEDURE [Catalog].[sp_AddProduct]    
   @ArtNo nvarchar(50) = '',  
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
   @Gtin nvarchar(50),  
   @Adult bit,
   @Length float,
   @Width float,
   @Height float,
   @CurrencyID int,
   @ActiveView360 bit
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
		   ,Gtin  
		   ,Adult
		   ,Length
		   ,Width
		   ,Height
		   ,CurrencyID
		   ,ActiveView360
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
		   @Gtin,  
		   @Adult,
		   @Length,
		   @Width,
		   @Height,
		   @CurrencyID,
		   @ActiveView360
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


ALTER TABLE [CMS].[MainMenu] ADD
	ShowInMobile bit NULL
GO--

Update [CMS].[MainMenu] Set ShowInMobile = 1
GO--

ALTER TABLE [CMS].[BottomMenu] ADD
	ShowInMobile bit NULL
GO--

Update [CMS].[BottomMenu] Set ShowInMobile = 0
GO--

ALTER PROCEDURE [CMS].[sp_UpdateMenuItemByItemId]  
 @MenuType nvarchar(20),  
 @MenuItemID int,  
 @MenuItemParentID int,  
 @MenuItemName nvarchar(100),  
 @MenuItemUrlType int,  
 @MenuItemUrlPath nvarchar(MAX),  
 @MenuItemIcon nvarchar(100),  
 @ShowMode int,  
 @Enabled bit,  
 @Blank bit,  
 @SortOrder int,  
 @NoFollow bit,
 @ShowInMobile bit
AS    
BEGIN  
IF @MenuType = 'Top'  
 Begin  
  Update [CMS].[MainMenu]   
   Set [MenuItemParentID] = @MenuItemParentID,   
    [MenuItemName] = @MenuItemName,   
    [MenuItemUrlType] = @MenuItemUrlType,      
    [MenuItemUrlPath] = @MenuItemUrlPath,   
    [MenuItemIcon] = @MenuItemIcon,   
    [ShowMode] = @ShowMode,  
    [Enabled] = @Enabled,  
    [SortOrder] = @SortOrder,  
    [Blank] = @Blank,  
    [Nofollow] = @NoFollow,
    [ShowInMobile] = @ShowInMobile
  Where [MenuItemID] = @MenuItemID  
 END  
Else  
 Begin  
  Update [CMS].[BottomMenu]   
   Set [MenuItemParentID] = @MenuItemParentID,   
    [MenuItemName] = @MenuItemName,   
    [MenuItemUrlType] = @MenuItemUrlType,      
    [MenuItemUrlPath] = @MenuItemUrlPath,   
    [MenuItemIcon] = @MenuItemIcon,   
    [ShowMode] = @ShowMode,  
    [Enabled] = @Enabled,  
    [SortOrder] = @SortOrder,  
    [Blank] = @Blank,  
    [Nofollow] = @NoFollow,
    [ShowInMobile] = @ShowInMobile 
  Where [MenuItemID] = @MenuItemID  
 END  
END 
GO-- 


GO--

CREATE NONCLUSTERED INDEX Brand_CountryID ON Catalog.Brand
	(
	CountryID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO----

CREATE NONCLUSTERED INDEX IX_CustomOptions ON Catalog.CustomOptions
	(
	ProductID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO----


DROP INDEX OfferColorId ON Catalog.Offer
GO--

DROP INDEX IX_ProductId ON Catalog.Offer
GO--
CREATE NONCLUSTERED INDEX Offer_ProductID ON Catalog.Offer
	(
	ProductID
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
ALTER TABLE Catalog.Offer ADD CONSTRAINT
	Offer_ArtNo UNIQUE NONCLUSTERED 
	(
	ArtNo
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO--
CREATE NONCLUSTERED INDEX Offer_ColorId ON Catalog.Offer
	(
	ColorID
	) INCLUDE (ProductID) 
 WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX Offer_Size ON Catalog.Offer
	(
	SizeID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

CREATE NONCLUSTERED INDEX Options_CustomOptionsID ON Catalog.Options
	(
	CustomOptionsID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
DROP INDEX IX_ProductPhoto_1 ON Catalog.Photo
GO--
DROP INDEX IX_ProductPhoto ON Catalog.Photo
GO--
CREATE NONCLUSTERED INDEX ProductPhoto_ObjId ON Catalog.Photo
	(
	ObjId
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX ProductPhoto_OriginName ON Catalog.Photo
	(
	OriginName
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX ProductPhoto_Type ON Catalog.Photo
	(
	Type
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--



ALTER TABLE Catalog.Product_ProductList ADD CONSTRAINT
	FK_Product_ProductList_Product FOREIGN KEY
	(
	ProductId
	) REFERENCES Catalog.Product
	(
	ProductId
	) ON UPDATE  NO ACTION 
	 ON DELETE  CASCADE 

GO--


CREATE NONCLUSTERED INDEX IX_Product_ProductList ON Catalog.Product_ProductList
	(
	ProductId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

GO--
DROP INDEX IX_ProductCategories_1 ON Catalog.ProductCategories
GO--
DROP INDEX IX_ProductCategories ON Catalog.ProductCategories
GO--
CREATE NONCLUSTERED INDEX ProductCategories_ProductID ON Catalog.ProductCategories
	(
	ProductID
	) INCLUDE (CategoryID, Main) 
 WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX ProductCategories_Main ON Catalog.ProductCategories
	(
	Main
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

GO--
CREATE NONCLUSTERED INDEX IX_ProductFile ON Catalog.ProductFile
	(
	ProductID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--


GO--
DROP INDEX IX_PropertyValue_1 ON Catalog.PropertyValue
GO--
DROP INDEX IX_PropertyValue ON Catalog.PropertyValue
GO--
CREATE NONCLUSTERED INDEX PropertyValue_Value ON Catalog.PropertyValue
	(
	Value
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX PropertyValue_UseInFilter ON Catalog.PropertyValue
	(
	UseInFilter
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX PropertyValue_PropertyID ON Catalog.PropertyValue
	(
	PropertyID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

GO--
CREATE NONCLUSTERED INDEX ShoppingCart_OfferId ON Catalog.ShoppingCart
	(
	OfferId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX ShoppingCart_CustomerId ON Catalog.ShoppingCart
	(
	CustomerId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
GO--
CREATE NONCLUSTERED INDEX City_RegionID ON Customers.City
	(
	RegionID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

GO--
DROP INDEX IX_Contact ON Customers.Contact
GO--
CREATE NONCLUSTERED INDEX Contact_CustomerID ON Customers.Contact
	(
	CustomerID
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX Contact_CountryID ON Customers.Contact
	(
	CountryID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX Contact_RegionID ON Customers.Contact
	(
	RegionID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

GO--
DROP INDEX IX_Customer ON Customers.Customer
GO--
CREATE NONCLUSTERED INDEX Customer_Email ON Customers.Customer
	(
	Email
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX Customer_CustomerGroupId ON Customers.Customer
	(
	CustomerGroupId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

GO--
CREATE NONCLUSTERED INDEX Order_ShippingMethodID ON [Order].[Order]
	(
	ShippingMethodID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX Order_PaymentMethodID ON [Order].[Order]
	(
	PaymentMethodID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX Order_OrderStatusID ON [Order].[Order]
	(
	OrderStatusID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
GO--
CREATE NONCLUSTERED INDEX OrderItems_OrderID ON [Order].OrderItems
	(
	OrderID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX OrderItems_PhotoID ON [Order].OrderItems
	(
	PhotoID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX OrderItems_ProductID ON [Order].OrderItems
	(
	ProductID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
DROP INDEX IX_Category ON Catalog.Category
GO--
DROP INDEX IX_ParentCategory ON Catalog.Category
GO--
CREATE NONCLUSTERED INDEX ParentCategory_ParentCategory ON Catalog.Category
	(
	ParentCategory
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX Category_CatLevel ON Catalog.Category
	(
	CatLevel
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

CREATE NONCLUSTERED INDEX IX_CouponCategories ON Catalog.CouponCategories
	(
	CategoryID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

CREATE NONCLUSTERED INDEX CouponCustomers_CustomerID ON Catalog.CouponCustomers
	(
	CustomerID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

CREATE NONCLUSTERED INDEX CouponProducts_ProductID ON Catalog.CouponProducts
	(
	ProductID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--


CREATE NONCLUSTERED INDEX Photo_ColorID ON Catalog.Photo
	(
	ColorID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

IF (EXISTS (SELECT * 
                 FROM INFORMATION_SCHEMA.TABLES 
                 WHERE TABLE_SCHEMA = 'Catalog' 
                 AND  TABLE_NAME = 'ProductFromMoysklad'))
BEGIN
   CREATE NONCLUSTERED INDEX ProductFromMoysklad_ProductId ON Catalog.ProductFromMoysklad
	(
	ProductId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
END

GO--
CREATE NONCLUSTERED INDEX PropertyGroupCategory_CategoryId ON Catalog.PropertyGroupCategory
	(
	CategoryId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
DROP INDEX IX_Ratio_1 ON Catalog.Ratio
GO--
DROP INDEX IX_Ratio ON Catalog.Ratio
GO--
CREATE NONCLUSTERED INDEX Ratio_ProductID ON Catalog.Ratio
	(
	ProductID
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX Ratio_CustomerId ON Catalog.Ratio
	(
	CustomerId
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX RelatedProperties_CategoryId ON Catalog.RelatedProperties
	(
	CategoryId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX RelatedProperties_PropertyId ON Catalog.RelatedProperties
	(
	PropertyId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX Answer_FKIDTheme ON Voice.Answer
	(
	FKIDTheme
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

CREATE NONCLUSTERED INDEX Certificate_OrderID ON [Order].Certificate
	(
	OrderID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

CREATE NONCLUSTERED INDEX CustomerCertificate_CertificateID ON Customers.CustomerCertificate
	(
	CertificateID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX CustomerCoupon_CouponID ON Customers.CustomerCoupon
	(
	CouponID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX CustomerRoleAction_CustomerID ON Customers.CustomerRoleAction
	(
	CustomerID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX ExportFeedSelectedCategories_CategoryID ON Settings.ExportFeedSelectedCategories
	(
	CategoryID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
ALTER TABLE Settings.ExportFeedSelectedProducts
	DROP CONSTRAINT PK__ExportFeedSelect__0EAE1DE1
GO--
ALTER TABLE Settings.ExportFeedSelectedProducts ADD CONSTRAINT
	PK__ExportFeedSelectProduct PRIMARY KEY CLUSTERED 
	(
	ModuleName,
	ProductID
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO--
CREATE NONCLUSTERED INDEX ExportFeedSelectedProducts_ProductID ON Settings.ExportFeedSelectedProducts
	(
	ProductID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--


GO--
CREATE NONCLUSTERED INDEX News_NewsCategoryID ON Settings.News
	(
	NewsCategoryID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX News_UrlPath ON Settings.News
	(
	UrlPath
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
DROP INDEX IX_RecentlyViewsData ON Customers.RecentlyViewsData
GO--
CREATE NONCLUSTERED INDEX RecentlyViewsData_ViewDate ON Customers.RecentlyViewsData
	(
	ViewDate
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX RecentlyViewsData_ProductID ON Customers.RecentlyViewsData
	(
	ProductID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX ShippingCity_CityId ON [Order].ShippingCity
	(
	CityId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX ShippingCityExcluded_CityId ON [Order].ShippingCityExcluded
	(
	CityId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX ShippingCountry_CountryId ON [Order].ShippingCountry
	(
	CountryId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
ALTER TABLE [Order].PaymentCity
	DROP CONSTRAINT PK_PaymentCity_1
GO--
ALTER TABLE [Order].PaymentCity ADD CONSTRAINT
	PK_PaymentCity PRIMARY KEY CLUSTERED 
	(
	MethodId,
	CityId
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO--
CREATE NONCLUSTERED INDEX PaymentCity_CityId ON [Order].PaymentCity
	(
	CityId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX PaymentCountry_CountryId ON [Order].PaymentCountry
	(
	CountryId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
DROP INDEX IX_OrderPaymentInfo ON [Order].OrderPaymentInfo
GO--
IF (EXISTS (SELECT * FROM sys.indexes WHERE name='Idx_OrderPaymentInfo' AND object_id = OBJECT_ID('[Order].OrderPaymentInfo')))
BEGIN
   DROP INDEX Idx_OrderPaymentInfo ON [Order].OrderPaymentInfo
END
GO--
ALTER TABLE [Order].OrderPaymentInfo ADD CONSTRAINT
	PK_OrderPaymentInfo PRIMARY KEY NONCLUSTERED 
	(
	OrderID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO--
CREATE NONCLUSTERED INDEX OrderPaymentInfo_PaymentMethodID ON [Order].OrderPaymentInfo
	(
	PaymentMethodID
	) WITH( PAD_INDEX = OFF, FILLFACTOR = 80, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX ShippingParam_ShippingMethodID ON [Order].ShippingParam
	(
	ShippingMethodID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
DROP INDEX Idx_ShippingPayments ON [Order].ShippingPayments
GO--
ALTER TABLE [Order].ShippingPayments ADD CONSTRAINT
	PK_ShippingPayments PRIMARY KEY CLUSTERED 
	(
	id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO--
CREATE NONCLUSTERED INDEX ShippingPayments_ShippingMethodID ON [Order].ShippingPayments
	(
	ShippingMethodID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX ShippingPayments_PaymentMethodID ON [Order].ShippingPayments
	(
	PaymentMethodID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--
CREATE NONCLUSTERED INDEX OrderCustomOptions_OrderedCartID ON [Order].OrderCustomOptions
	(
	OrderedCartID
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--


CREATE UNIQUE NONCLUSTERED INDEX [IX_Managers] ON [Customers].[Managers]
(
	[ManagerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

CREATE NONCLUSTERED INDEX [SearchStatistic_Date] ON [Statistic].[SearchStatistic]
(
	[Date] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--

update cms.staticblock set content= replace(content, 'feedback.aspx', 'feedback')
update cms.staticblock set content= replace(content, 'Feedback', 'feedback')

GO--

ALTER PROCEDURE [Customers].[sp_GetRecentlyView]  
 @CustomerId uniqueidentifier,  
 @rowsCount int,  
 @Type nvarchar(50)  
AS  
BEGIN
	
	SELECT TOP(@rowsCount) RecentlyViewsData.ProductID,Product.Name,UrlPath, Ratio, PhotoName,[Photo].[Description] as PhotoDescription, [Discount], MinPrice as BasePrice, CurrencyValue
	FROM [Customers].RecentlyViewsData  
	Inner Join [Catalog].Product ON Product.ProductID = RecentlyViewsData.ProductId 
	Left Join [Catalog].[ProductExt] ON [Product].[ProductID] = [ProductExt].[ProductID] 
	Inner Join Catalog.Currency On Currency.CurrencyID = Product.CurrencyID
	Left Join Catalog.Photo ON Photo.[ObjId] = Product.ProductID and [Type]=@Type AND [Photo].[Main]=1	
	WHERE Product.Enabled = 1 And CategoryEnabled = 1 And RecentlyViewsData.CustomerID = @CustomerId  
	ORDER BY ViewDate Desc
END

GO--

ALTER PROCEDURE [Catalog].[sp_GetCustomOptionsByProductId]
	@ProductId int
AS
BEGIN
	SELECT [CustomOptionsID], [Title], [IsRequired], [InputType], [SortOrder], [CustomOptions].[ProductID], CurrencyValue  
	FROM [Catalog].[CustomOptions]
	INNER JOIN [Catalog].[Product] on [Product].ProductId = [CustomOptions].ProductId
	INNER JOIN [Catalog].[Currency] on [Product].CurrencyID = [Currency].CurrencyID 
	WHERE [CustomOptions].ProductID = @ProductId
	order by SortOrder
END

GO--

ALTER PROCEDURE [Catalog].[sp_GetOptionsByCustomOptionId]
	-- Add the parameters for the stored procedure here
	@CustomOptionId int
AS
BEGIN
	SELECT [OptionID], [Options].[CustomOptionsId], [Options].[Title], [PriceBC], [PriceType], [Options].[SortOrder], CurrencyValue
  FROM [Catalog].[Options]
  INNER JOIN [Catalog].[CustomOptions] on [CustomOptions].[CustomOptionsId] = [Options].[CustomOptionsId]
	INNER JOIN [Catalog].[Product] on [Product].ProductId = [CustomOptions].ProductId
	INNER JOIN [Catalog].[Currency] on [Product].CurrencyID = [Currency].CurrencyID 
  WHERE [CustomOptions].CustomOptionsId = @CustomOptionId
  order by [SortOrder]
END

GO--

Insert Into [Settings].[Settings] ([Name],[Value]) Values ('ShowQuickView', 'False')

GO--

IF   EXISTS (SELECT * FROM sys.objects 
WHERE object_id = OBJECT_ID(N'[Module].[BlogCategory]') AND type in (N'U'))
begin
	IF not EXISTS(SELECT * FROM sys.columns 
        WHERE [name] = N'MetaTitle' AND [object_id] = OBJECT_ID(N'Module.BlogCategory'))
	BEGIN
		alter TABLE [Module].[BlogCategory]
		add [MetaTitle] [nvarchar](max) NULL
	END

	IF not EXISTS(SELECT * FROM sys.columns 
        WHERE [name] = N'MetaDescription' AND [object_id] = OBJECT_ID(N'Module.BlogCategory'))
	BEGIN
		alter TABLE [Module].[BlogCategory]
		add [MetaDescription] [nvarchar](max) NULL
	END

	IF not EXISTS(SELECT * FROM sys.columns 
        WHERE [name] = N'MetaKeywords' AND [object_id] = OBJECT_ID(N'Module.BlogCategory'))
	BEGIN
		alter TABLE [Module].[BlogCategory]
		add [MetaKeywords] [nvarchar](max) NULL
	END
end

GO--

Insert Into [Settings].[Settings] ([Name],[Value]) Values ('Mobile_MainPageProductsCount', '3');
Insert Into [Settings].[Settings] ([Name],[Value]) Values ('Mobile_ProductsPerPage', '10');
Insert Into [Settings].[Settings] ([Name],[Value]) Values ('Mobile_DisplayCity', 'True');
Insert Into [Settings].[Settings] ([Name],[Value]) Values ('Mobile_DisplaySlider', 'True');

GO--


ALTER TABLE [Order].PaymentMethod ADD CurrencyId int NULL

GO--

Update [Order].[PaymentMethod] 
   Set [CurrencyId] = (Select CurrencyId From [Catalog].[Currency] 
					   Where [CurrencyIso3] = (SELECT [Value] FROM [Settings].[Settings] Where Name = 'DefaultCurrencyISO3'))

GO--

Alter TAble [Catalog].[Product]
Add YandexMarketCategory nvarchar(500) NULL

GO--


ALTER PROCEDURE [Catalog].[sp_AddProduct]    
   @ArtNo nvarchar(50) = '',  
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
   @ActiveView360 bit
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
		   @ActiveView360
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
  @ArtNo nvarchar(50),  
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
  @ActiveView360 bit
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
 WHERE ProductID = @ProductID    
END  

GO--


ALTER PROCEDURE [Settings].[sp_GetExportFeedProducts] @moduleName NVARCHAR(50)
	,@onlyCount BIT
	,@selectedCurrency NVARCHAR(10)
AS
BEGIN
	DECLARE @res TABLE (productId INT PRIMARY KEY CLUSTERED);
	DECLARE @lproduct TABLE (productId INT PRIMARY KEY CLUSTERED);

	INSERT INTO @lproduct
	SELECT [ProductID]
	FROM [Settings].[ExportFeedSelectedProducts]
	WHERE [ModuleName] = @moduleName;

	DECLARE @lcategory TABLE (CategoryId INT PRIMARY KEY CLUSTERED);
	DECLARE @l TABLE (CategoryId INT PRIMARY KEY CLUSTERED);

	INSERT INTO @l
	SELECT t.CategoryId
	FROM [Settings].[ExportFeedSelectedCategories] AS t
	INNER JOIN CATALOG.Category ON t.CategoryId = Category.CategoryId
	WHERE [ModuleName] = @moduleName
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
					AND Offer.Price > 0
					AND (
						Offer.Amount > 0
						OR Product.AllowPreOrder = 1
						)
					AND CategoryEnabled = 1
					AND Enabled = 1
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
			,[Offer].ArtNo
			,[Offer].Main
			,[Offer].ColorID
			,ColorName
			,[Offer].SizeID
			,SizeName
			,BrandName
			,GoogleProductCategory
			,YandexMarketCategory
			,Gtin
			,Adult
			,CurrencyValue
			,[Settings].PhotoToString(Offer.ColorID, Product.ProductId) AS Photos
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
		INNER JOIN [Catalog].Currency ON Currency.CurrencyID = [Product].CurrencyID
		WHERE (
				SELECT TOP (1) [ProductCategories].[CategoryId]
				FROM [Catalog].[ProductCategories]
				INNER JOIN [Catalog].[Category] ON [Category].[CategoryId] = [ProductCategories].[CategoryId]
				WHERE [ProductID] = [Product].[ProductID]
					AND [Enabled] = 1
					AND [Main] = 1
				) = [ProductCategories].[CategoryId]
			AND Offer.Price > 0
			AND (
				Offer.Amount > 0
				OR Product.AllowPreOrder = 1
				)
			AND CategoryEnabled = 1
			AND Product.Enabled = 1
	END
END

GO--

insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('login.aspx','login',null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('feedback.aspx','feedback',null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('search.aspx','search',null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('registration.aspx','registration',null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('fogotPassword.aspx','forgotpassword',null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('forgotPassword.aspx','forgotpassword',null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('myaccount.aspx','myaccount',null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('productlist.aspx','productlist',null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('shoppingcart.aspx','cart',null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('compareproducts.aspx','compare',null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('wishlist.aspx','wishlist',null)

GO--


CREATE TABLE [Order].[Lead](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Phone] [nvarchar](255) NOT NULL,
	[Email] [nvarchar](255) NOT NULL,
	[LeadStatus] [nvarchar](50) NOT NULL,
	[OrderType] [nvarchar](50) NOT NULL,
	[Comment] [nvarchar](max) NOT NULL,
	[AdminComment] [nvarchar](max) NULL,
	[CustomerId] [uniqueidentifier] NULL,
	[ManagerId] [int] NULL,
	[CreatedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_Leed] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO--

CREATE TABLE [Order].[LeadCurrency](
	[LeadId] [int] NOT NULL,
	[CurrencyCode] [nchar](3) NOT NULL,
	[CurrencyNumCode] [int] NOT NULL,
	[CurrencyValue] [float] NOT NULL,
	[CurrencySymbol] [nvarchar](7) NOT NULL,
	[IsCodeBefore] [bit] NOT NULL,
 CONSTRAINT [PK_LeedCurrency] PRIMARY KEY CLUSTERED 
(
	[LeadId] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO--

ALTER TABLE [Order].[LeadCurrency]  WITH CHECK ADD  CONSTRAINT [FK_LeedCurrency_Leed] FOREIGN KEY([LeadId])
REFERENCES [Order].[Lead] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO--

ALTER TABLE [Order].[LeadCurrency] CHECK CONSTRAINT [FK_LeedCurrency_Leed]
GO--


CREATE TABLE [Order].[LeadItem](
	[LeadItemId] [int] IDENTITY(1,1) NOT NULL,
	[LeadId] [int] NOT NULL,
	[ProductId] [int] NULL,
	[Name] [nvarchar](255) NOT NULL,
	[ArtNo] [nvarchar](50) NOT NULL,
	[Price] [float] NOT NULL,
	[Amount] [float] NOT NULL,
	[Weight] [float] NOT NULL,
	[Color] [nvarchar](50) NULL,
	[Size] [nvarchar](50) NULL,
	[PhotoId] [int] NULL,
 CONSTRAINT [PK_LeedItem] PRIMARY KEY CLUSTERED 
(
	[LeadItemId] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO--

ALTER TABLE [Order].[LeadItem]  WITH CHECK ADD  CONSTRAINT [FK_LeedItem_Leed] FOREIGN KEY([LeadId])
REFERENCES [Order].[Lead] ([Id])
ON DELETE CASCADE
GO--

ALTER TABLE [Order].[LeadItem] CHECK CONSTRAINT [FK_LeedItem_Leed]
GO--

ALTER TABLE [Order].[LeadItem]  WITH CHECK ADD  CONSTRAINT [FK_LeedItem_Photo] FOREIGN KEY([PhotoId])
REFERENCES [Catalog].[Photo] ([PhotoId])
ON DELETE SET NULL
GO--

ALTER TABLE [Order].[LeadItem] CHECK CONSTRAINT [FK_LeedItem_Photo]
GO--

ALTER TABLE [Order].[LeadItem]  WITH CHECK ADD  CONSTRAINT [FK_LeedItem_Product] FOREIGN KEY([ProductId])
REFERENCES [Catalog].[Product] ([ProductId])
ON DELETE SET NULL
GO--

ALTER TABLE [Order].[LeadItem] CHECK CONSTRAINT [FK_LeedItem_Product]
GO--

CREATE TABLE [Customers].[Call](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CallId] [nvarchar](250) NOT NULL,
	[Type] [nvarchar](250) NOT NULL,
	[SrcNum] [nvarchar](250) NOT NULL,
	[DstNum] [nvarchar](250) NOT NULL,
	[Extension] [nvarchar](250) NOT NULL,
	[CallDate] [datetime] NOT NULL,
	[CallAnswerDate] [datetime] NULL,
	[Duration] [int] NOT NULL,
	[RecordLink] [nvarchar](250) NULL,
	[CalledBack] [bit] NOT NULL,
	[HangupStatus] [nvarchar](250) NOT NULL,
	[OperatorType] [nvarchar](250) NOT NULL,
	[ManagerId] [int] NULL,
 CONSTRAINT [PK_Call] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO--

ALTER TABLE [Customers].[Call] ADD  CONSTRAINT [DF_Call_CalledBack]  DEFAULT ((0)) FOR [CalledBack]
GO--

ALTER TABLE [Customers].[Call]  WITH CHECK ADD  CONSTRAINT [FK_Call_Managers] FOREIGN KEY([ManagerId])
REFERENCES [Customers].[Managers] ([ManagerId])
ON DELETE SET NULL
GO--

ALTER TABLE [Customers].[Call] CHECK CONSTRAINT [FK_Call_Managers]
GO--

CREATE NONCLUSTERED INDEX [IX_Customers_Call] ON [Customers].[Call]
(
	[ManagerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--


ALTER TABLE Customers.ManagerTask ADD
	LeadId int NULL,
	ResultShort nvarchar(255) NULL,
	ResultFull nvarchar(MAX) NULL
GO--

ALTER TABLE Customers.ManagerTask ADD CONSTRAINT
	FK_ManagerTask_Lead FOREIGN KEY	(LeadId) REFERENCES [Order].Lead (Id) ON UPDATE  NO ACTION 
	 ON DELETE  SET NULL 
GO--


Insert Into [Settings].[Settings] ([Name],[Value]) Values ('BuyInOneClick_CreateOrder', 'False')
GO--

CREATE TABLE [CMS].[Menu](
	[MenuItemID] [int] IDENTITY(1,1) NOT NULL,
	[MenuItemParentID] [int] NULL,
	[MenuItemName] [nvarchar](100) NOT NULL,
	[MenuItemIcon] [nvarchar](100) NULL,
	[MenuItemUrlPath] [nvarchar](max) NOT NULL,
	[MenuItemUrlType] [int] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[ShowMode] [int] NOT NULL,
	[Enabled] [bit] NOT NULL,
	[Blank] [bit] NOT NULL,
	[NoFollow] [bit] NOT NULL,
	[MenuType] [int] NOT NULL,
 CONSTRAINT [PK_Menu] PRIMARY KEY CLUSTERED 
(
	[MenuItemID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO--

ALTER PROCEDURE [CMS].[sp_GetParentMenuItemsByItemId]
	@MenuItemID int
AS  
BEGIN
	declare @tbl TABLE (MenuItemID  int)
	if (select COUNT(MenuItemID) from [CMS].[Menu] where MenuItemID = @MenuItemID) <> 0
		while(@MenuItemID IS NOT NULL)
		begin
			insert into @tbl (MenuItemID) select MenuItemID from [CMS].[Menu] where MenuItemID = @MenuItemID
			set @MenuItemID = (select MenuItemParentID from [CMS].[Menu] where MenuItemID = @MenuItemID)
		end
	select * from @tbl
END
GO--

ALTER PROCEDURE [CMS].[sp_GetChildMenuItemByParent]
	@ParentId int,
	@MenuType int
AS  
BEGIN
	DECLARE @tbl TABLE (MenuItemID int)

	Insert @tbl (MenuItemID) values (@ParentId)
	while(@@rowcount>0)
	begin
		insert into @tbl (MenuItemID) 
		select c.MenuItemID 
		from [CMS].[Menu] c join @tbl p on p.MenuItemID = c.MenuItemParentID
		where c.MenuItemID not in (select MenuItemID from @tbl) and MenuType = @MenuType
	end
	SELECT MenuItemID FROM @tbl
END

GO--


-- fill [CMS].[Menu]

alter table [CMS].[Menu] add [OldId] int NULL
GO--
alter table [CMS].[Menu] add [OldParentId] int NULL
GO--

-- [MainMenu]
INSERT INTO [CMS].[Menu] 
	([MenuItemParentID]
    ,[MenuItemName]
    ,[MenuItemUrlType]
    ,[MenuItemUrlPath]
    ,[MenuItemIcon]
    ,[ShowMode]
    ,[SortOrder]
    ,[Enabled]
    ,[Blank]
    ,[NoFollow]
	,[MenuType] 
	,[OldId]
	,[OldParentId])
SELECT null
    ,[MenuItemName]
    ,[MenuItemUrlType]
    ,[MenuItemUrlPath]
    ,[MenuItemIcon]
    ,[ShowMode]
    ,[SortOrder]
    ,[Enabled]
    ,[Blank]
    ,[NoFollow]
	,0
	,[MenuItemID]
	,[MenuItemParentID]
FROM [CMS].[MainMenu]
GO--

update [CMS].[Menu] set [MenuItemParentID] = (select [MenuItemID] from [CMS].[Menu] as t2 where t2.[OldId] = Menu.[OldParentId] and [MenuType] = 0)
where [OldParentId] is not null and [MenuType] = 0
GO--

-- [BottomMenu]
INSERT INTO [CMS].[Menu] 
	([MenuItemParentID]
    ,[MenuItemName]
    ,[MenuItemUrlType]
    ,[MenuItemUrlPath]
    ,[MenuItemIcon]
    ,[ShowMode]
    ,[SortOrder]
    ,[Enabled]
    ,[Blank]
    ,[NoFollow]
	,[MenuType] 
	,[OldId]
	,[OldParentId])
SELECT null
    ,[MenuItemName]
    ,[MenuItemUrlType]
    ,[MenuItemUrlPath]
    ,[MenuItemIcon]
    ,[ShowMode]
    ,[SortOrder]
    ,[Enabled]
    ,[Blank]
    ,[NoFollow]
	,1
	,[MenuItemID]
	,[MenuItemParentID]
FROM [CMS].[BottomMenu]
GO--

update [CMS].[Menu] set [MenuItemParentID] = (select [MenuItemID] from [CMS].[Menu] as t2 where t2.[OldId] = Menu.[OldParentId] and [MenuType] = 1)
where [OldParentId] is not null and [MenuType] = 1
GO--

-- Mobile Menu
INSERT INTO [CMS].[Menu] 
	([MenuItemParentID]
    ,[MenuItemName]
    ,[MenuItemUrlType]
    ,[MenuItemUrlPath]
    ,[MenuItemIcon]
    ,[ShowMode]
    ,[SortOrder]
    ,[Enabled]
    ,[Blank]
    ,[NoFollow]
	,[MenuType] 
	,[OldId]
	,[OldParentId])
SELECT null
    ,[MenuItemName]
    ,[MenuItemUrlType]
    ,[MenuItemUrlPath]
    ,[MenuItemIcon]
    ,[ShowMode]
    ,[SortOrder]
    ,[Enabled]
    ,[Blank]
    ,[NoFollow]
	,2
	,[MenuItemID]
	,[MenuItemParentID]
FROM [CMS].[MainMenu] where [ShowInMobile] = 1
GO--

update [CMS].[Menu] set [MenuItemParentID] = (select [MenuItemID] from [CMS].[Menu] as t2 where t2.[OldId] = Menu.[OldParentId] and [MenuType] = 2)
where [OldParentId] is not null and [MenuType] = 2
GO--

alter table [CMS].[Menu] drop column [OldId]
GO--
alter table [CMS].[Menu] drop column [OldParentId]
GO--

DROP TABLE [CMS].[MainMenu]
GO--

DROP TABLE [CMS].[BottomMenu]
GO--

ALTER procedure [Catalog].[sp_GetPriceRange]
(		
	@categoryId int,
	@useDepth bit
)
AS
begin
if (@useDepth = 1)
	begin
	
	if (@categoryId=0)
		begin
		SELECT 
			min((Catalog.Offer.Price * Currency.CurrencyValue)*(1-Product.Discount/100)) as minprice,
            max((Catalog.Offer.Price * Currency.CurrencyValue)*(1-Product.Discount/100)) as maxprice  
            FROM Catalog.Product 
            INNER JOIN Catalog.Offer 
                ON Catalog.Product.ProductID = Catalog.Offer.ProductID
			INNER JOIN Catalog.Currency 
				ON Catalog.Currency.CurrencyID = Catalog.Product.CurrencyID
            WHERE Product.Enabled = 1 and product.CategoryEnabled=1
		end
	else
			begin
			SELECT 
			min((Catalog.Offer.Price* Currency.CurrencyValue)*(1-Product.Discount/100)) as minprice,
            max((Catalog.Offer.Price* Currency.CurrencyValue)*(1-Product.Discount/100)) as maxprice  
            FROM Catalog.Product 
            INNER JOIN Catalog.Offer 
                ON Catalog.Product.ProductID = Catalog.Offer.ProductID 
            INNER JOIN Catalog.ProductCategories 
                ON ProductCategories.ProductID = [Product].[ProductID] 
			INNER JOIN Catalog.Currency 
				ON Catalog.Currency.CurrencyID = Catalog.Product.CurrencyID
            WHERE Product.Enabled = 1 and product.CategoryEnabled=1
                AND Catalog.ProductCategories.CategoryID in(Select id from  [Settings].[GetChildCategoryByParent](@categoryId))
                end
	end
else
	begin
		SELECT 
				min((Catalog.Offer.Price* Currency.CurrencyValue)*(1-Product.Discount/100)) as minprice,
				max((Catalog.Offer.Price* Currency.CurrencyValue)*(1-Product.Discount/100)) as maxprice 
				FROM Catalog.Product 
				INNER JOIN Catalog.Offer 
					ON Catalog.Product.ProductID = Catalog.Offer.ProductID
				INNER JOIN Catalog.ProductCategories 
					ON ProductCategories.ProductID = [Product].[ProductID] 
				INNER JOIN Catalog.Currency 
					ON Catalog.Currency.CurrencyID = Catalog.Product.CurrencyID
				WHERE Product.Enabled = 1 and product.CategoryEnabled=1 AND Catalog.ProductCategories.CategoryID = @categoryId
	end 
end

GO--
alter table catalog.product
add CustomViewName nvarchar(50) null

GO--

ALTER PROCEDURE [Catalog].[sp_AddProduct]    
   @ArtNo nvarchar(50) = '',  
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
   @CustomViewName nvarchar(50)
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
		   ,CustomViewName
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
		   @CustomViewName
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
  @ArtNo nvarchar(50),  
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
  @CustomViewName nvarchar(50)
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
  ,[CustomViewName] = @CustomViewName
  WHERE ProductID = @ProductID    
END  

GO--

IF (EXISTS (SELECT * 
                 FROM INFORMATION_SCHEMA.TABLES 
                 WHERE TABLE_SCHEMA = 'Module' 
                 AND  TABLE_NAME = 'BlogItem'))
BEGIN
    Alter Table Module.BlogItem
	Alter Column ItemCategoryId int NULL
END

GO--

ALTER PROCEDURE [Catalog].[sp_AddPhoto] 
	@ObjId INT, @Description NVARCHAR(255),  
	@OriginName NVARCHAR(255),  
	@Type NVARCHAR(50),  
	@Extension NVARCHAR(10),  
	@ColorID int,  
	@PhotoSortOrder int  
AS  
BEGIN  
	DECLARE @PhotoId int  
	DECLARE @ismain bit  
	SET @ismain = 1  
	
	IF EXISTS(SELECT * FROM [Catalog].[Photo] WHERE ObjId = @ObjId and [Type]=@Type AND main = 1)  
		SET @ismain = 0  

	INSERT INTO [Catalog].[Photo] ([ObjId],[PhotoName],[Description],[ModifiedDate],[PhotoSortOrder],[Main],[OriginName],[Type],[ColorID])  
		VALUES (@ObjId,'none',@Description,Getdate(),@PhotoSortOrder,@ismain,@OriginName,@Type,@ColorID)  

	SET @PhotoId = Scope_identity()  
	DECLARE @newphoto NVARCHAR(255)  
	Set @newphoto=Convert(NVARCHAR(255),@PhotoId)+@Extension  
	
	UPDATE [Catalog].[Photo] SET [PhotoName] = @newphoto WHERE [PhotoId] = @PhotoId

	SELECT * FROM [Catalog].[Photo] WHERE [PhotoId] = @PhotoId
	--select @newphoto  
END  

GO--
if not exists(select * from sys.columns 
            where Name = N'Patronymic' and Object_ID = Object_ID(N'[Order].[OrderCustomer]'))
begin
    Alter table [Order].[OrderCustomer] add Patronymic nvarchar(1000)
end

GO--

alter table Customers.Customer
add StandardPhone bigint null

GO--

ALTER PROCEDURE [Customers].[sp_GetCustomerByID]
	@CustomerID uniqueidentifier
AS
BEGIN
	SELECT     Customers.Customer.CustomerID, 
				      Customers.Customer.Email,
				      Customers.Customer.Password, Customers.Customer.FirstName, 
                      Customers.Customer.LastName, 
                      Customers.Customer.Phone, Customers.Customer.StandardPhone, Customers.Customer.RegistrationDateTime, 
                      Customers.CustomerGroup.GroupName, 
                      Customers.CustomerGroup.GroupDiscount, Customers.CustomerGroup.CustomerGroupID
	FROM         Customers.Customer INNER JOIN
                      Customers.CustomerGroup ON Customers.Customer.CustomerGroupID = Customers.CustomerGroup.CustomerGroupID
	WHERE Customers.Customer.CustomerID = @CustomerID
END


GO--


ALTER PROCEDURE [Customers].[sp_UpdateCustomerInfo]  
   @CustomerID uniqueidentifier,  
   @FirstName nvarchar(70),  
   @LastName nvarchar(70),  
   @Phone nvarchar(max),     
   @StandardPhone bigint,     
   @Email nvarchar(100),  
   @CustomerGroupId int = NULL,  
   @CustomerRole int, 
   @BonusCardNumber bigint,
   @AdminComment nvarchar(MAX),
   @ManagerId int,
   @Rating int
AS  
BEGIN  
 UPDATE [Customers].[Customer]  
    SET [FirstName] = @FirstName,
		[LastName] = @LastName,
		[Phone] = @Phone,		
		[StandardPhone] = @StandardPhone,
		[Email] = @Email,
		[CustomerGroupId] = @CustomerGroupId,
		[CustomerRole] = @CustomerRole,
		[BonusCardNumber] = @BonusCardNumber,
		[AdminComment] = @AdminComment,
		[ManagerId] = @ManagerId,
		[Rating] = @Rating
   WHERE CustomerID = @CustomerID
END 


GO--

ALTER PROCEDURE [Customers].[sp_AddCustomer]  
	   @CustomerGroupID int,  
	   @Password nvarchar(100),  
	   @FirstName nvarchar(70),  
	   @LastName nvarchar(70),  
	   @Phone nvarchar(max),  
	   @StandardPhone bigint,  
       @RegistrationDateTime datetime,             
       @Email nvarchar(100),  
       @CustomerRole int,  
       @Patronymic nvarchar(70),
       @BonusCardNumber bigint,
	   @AdminComment nvarchar(MAX),
	   @ManagerId int,
	   @Rating int
AS  
BEGIN  
 INSERT INTO [Customers].[Customer]  
           ([CustomerGroupID]  
           ,[Password]  
           ,[FirstName]  
           ,[LastName]  
           ,[Phone]  
		   ,[StandardPhone]
           ,[RegistrationDateTime]             
           ,[Email]  
           ,[CustomerRole]  
           ,[Patronymic]
           ,[BonusCardNumber]
		   ,[AdminComment]
		   ,[ManagerId]
		   ,[Rating])  
     VALUES  
           (@CustomerGroupID  
           ,@Password  
           ,@FirstName  
           ,@LastName  
           ,@Phone
		   ,@StandardPhone
           ,@RegistrationDateTime             
           ,@Email  
           ,@CustomerRole  
           ,@Patronymic
           ,@BonusCardNumber
		   ,@AdminComment
		   ,@ManagerId
		   ,@Rating);  
     SELECT CustomerID from [Customer] where Email =@Email  
END  

GO--

EXEC sp_RENAME 'Order.OrderCustomer.MobilePhone' , 'Phone', 'COLUMN'

GO--

alter table [Order].[OrderCustomer]
add StandardPhone bigint null


GO--


CREATE Function Settings.[RemoveNonNumericCharacters](@strText VARCHAR(1000))
RETURNS VARCHAR(1000)
AS
BEGIN
    WHILE PATINDEX('%[^0-9]%', @strText) > 0
    BEGIN
        SET @strText = STUFF(@strText, PATINDEX('%[^0-9]%', @strText), 1, '')
    END
    RETURN @strText
END

GO--
update [order].[ordercustomer] set StandardPhone = Settings.[RemoveNonNumericCharacters](phone) where StandardPhone='' or StandardPhone is null and len(phone) < 20

GO--
update [order].[ordercustomer] set StandardPhone=null where standardphone=0 or standardphone=''

GO--

update Customers.Customer set StandardPhone = Settings.[RemoveNonNumericCharacters](phone) where StandardPhone=''

GO--
update Customers.Customer set StandardPhone=null where standardphone=0 or standardphone=''

GO--


if not exists (Select * From [Settings].[Settings] Where [Name] = 'OrderNumberFormat')
begin
	Insert Into [Settings].[Settings] ([Name],[Value]) Values ('OrderNumberFormat', '#NUMBER#')
end

GO--

ALTER TABLE [Order].[Order] ADD
	Code uniqueidentifier NULL

GO--

Update [Order].[Order] Set Code = NEWID()

GO--

ALTER TABLE [Order].[Order]
ALTER COLUMN Code uniqueidentifier NOT NULL

GO--

if exists(select * from sys.columns Where Object_ID = Object_ID(N'[Module].[StoreReview]')) and not exists(select * from sys.columns Where Name = N'ReviewerImage' and Object_ID = Object_ID(N'[Module].[StoreReview]'))
begin
	Alter Table [Module].[StoreReview] Add ReviewerImage nvarchar(150) NULL
end

GO--

CREATE TABLE Settings.ExportFeed
	(
	Id int NOT NULL IDENTITY (1, 1),
	Name nvarchar(250) NOT NULL,
	Type nvarchar(50) NOT NULL
	)  ON [PRIMARY]

GO--

ALTER TABLE Settings.ExportFeed ADD CONSTRAINT
	PK_ExportFeed PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO--

CREATE TABLE Settings.ExportFeedSettings
	(
	ExportFeedId int NOT NULL,
	Name nvarchar(50) NOT NULL,
	Value nvarchar(MAX) NOT NULL
	)  ON [PRIMARY]
	 TEXTIMAGE_ON [PRIMARY]
	 
GO--

CREATE UNIQUE NONCLUSTERED INDEX IX_ExportFeedSettings ON Settings.ExportFeedSettings
	(
	ExportFeedId,
	Name
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	
GO--

ALTER TABLE Settings.ExportFeedSettings ADD CONSTRAINT
	FK_ExportFeedSettings_ExportFeed FOREIGN KEY
	(
	ExportFeedId
	) REFERENCES Settings.ExportFeed
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  CASCADE 
	
GO--

ALTER TABLE Settings.ExportFeed ADD
	Description nvarchar(250) NULL
	
-----------------------------------------------------------------------------------------------------------------
GO--

ALTER TABLE [Settings].[ExportFeedSelectedProducts] DROP CONSTRAINT [FK_ExportFeedSelectedProducts_Product]
GO--

DROP TABLE [Settings].[ExportFeedSelectedProducts]
GO--

CREATE TABLE [Settings].[ExportFeedSelectedProducts](
	[ExportFeedId] [int] NOT NULL,
	[ProductID] [int] NOT NULL,
 CONSTRAINT [PK__ExportFeedSelectProduct] PRIMARY KEY CLUSTERED 
(
	[ExportFeedId] ASC,
	[ProductID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]
) ON [PRIMARY]

GO--
ALTER TABLE [Settings].[ExportFeedSelectedProducts]  WITH CHECK ADD  CONSTRAINT [FK_ExportFeedSelectedProducts_Product] FOREIGN KEY([ProductID])
REFERENCES [Catalog].[Product] ([ProductId])
ON UPDATE CASCADE
ON DELETE CASCADE
GO--
ALTER TABLE [Settings].[ExportFeedSelectedProducts]  WITH CHECK ADD  CONSTRAINT [FK_ExportFeedSelectedProducts_ExportFeed] FOREIGN KEY([ExportFeedId])
REFERENCES [Settings].[ExportFeed] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO--
ALTER TABLE [Settings].[ExportFeedSelectedProducts] CHECK CONSTRAINT [FK_ExportFeedSelectedProducts_Product]
GO--
ALTER TABLE [Settings].[ExportFeedSelectedProducts] CHECK CONSTRAINT [FK_ExportFeedSelectedProducts_ExportFeed]
GO--

-----------------------------------------------------------------------------------------------------------------

if (SELECT count (*)
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
    WHERE CONSTRAINT_NAME ='FK_ExportFeedSelectedCategories_Category') > 0 
	begin
	ALTER TABLE [Settings].[ExportFeedSelectedCategories] DROP CONSTRAINT [FK_ExportFeedSelectedCategories_Category]
	end
GO--


if (SELECT count (*)
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
    WHERE CONSTRAINT_NAME ='DF_ExportFeedSelectedCategories_status') > 0 
	begin
	ALTER TABLE [Settings].[ExportFeedSelectedCategories] DROP CONSTRAINT [DF_ExportFeedSelectedCategories_status]
	end
GO--

DROP TABLE [Settings].[ExportFeedSelectedCategories]
GO--
CREATE TABLE [Settings].[ExportFeedSelectedCategories](
	[ExportFeedId] [int] NOT NULL,
	[CategoryID] [int] NOT NULL,
	[status] [int] NULL,
 CONSTRAINT [PK__ExportFeedSelect] PRIMARY KEY CLUSTERED 
(
	[ExportFeedId] ASC,
	[CategoryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]
) ON [PRIMARY]
GO--
ALTER TABLE [Settings].[ExportFeedSelectedCategories] ADD  CONSTRAINT [DF_ExportFeedSelectedCategories_status]  DEFAULT ((0)) FOR [status]
GO--
ALTER TABLE [Settings].[ExportFeedSelectedCategories]  WITH CHECK ADD  CONSTRAINT [FK_ExportFeedSelectedCategories_Category] FOREIGN KEY([CategoryID])
REFERENCES [Catalog].[Category] ([CategoryID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO--
ALTER TABLE [Settings].[ExportFeedSelectedCategories]  WITH CHECK ADD  CONSTRAINT [FK_ExportFeedSelectedCategories_ExportFeed] FOREIGN KEY([ExportFeedId])
REFERENCES [Settings].[ExportFeed] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO--
ALTER TABLE [Settings].[ExportFeedSelectedCategories] CHECK CONSTRAINT [FK_ExportFeedSelectedCategories_Category]
GO--
ALTER TABLE [Settings].[ExportFeedSelectedCategories] CHECK CONSTRAINT [FK_ExportFeedSelectedCategories_ExportFeed]
GO--

-----------------------------------------------------------------------------------------------------------------


ALTER PROCEDURE [Settings].[sp_GetExportFeedCategories] @exportFeedId int
	,@onlyCount BIT
AS
BEGIN
	--template for result array
	DECLARE @result TABLE (CategoryId INT PRIMARY KEY CLUSTERED);
	-- templete for array of categories
	DECLARE @lcategory TABLE (CategoryId INT PRIMARY KEY CLUSTERED);

	INSERT INTO @lcategory
	SELECT t.CategoryId
	FROM [Settings].[ExportFeedSelectedCategories] AS t
	INNER JOIN CATALOG.Category ON t.CategoryId = Category.CategoryId
	WHERE HirecalEnabled = 1
		AND Enabled = 1
		AND [ExportFeedId] = @exportFeedId

	DECLARE @l1 INT

	SET @l1 = (
			SELECT MIN(CategoryId)
			FROM @lcategory
			);

	WHILE @l1 IS NOT NULL
	BEGIN
		--add categories by step thats no in array 
		INSERT INTO @result
		SELECT id
		FROM Settings.GetChildCategoryByParent(@l1) AS dt
		INNER JOIN CATALOG.Category ON CategoryId = id
		WHERE dt.id NOT IN (
				SELECT CategoryId
				FROM @result
				)
			AND HirecalEnabled = 1
			AND Enabled = 1
			
		insert into @result
		select id from [Settings].[GetParentsCategoryByChild] (@l1) as dt
		where dt.id not in (SELECT CategoryId FROM @result)
		
		SET @l1 = (
				SELECT MIN(CategoryId)
				FROM @lcategory
				WHERE CategoryId > @l1
				);
	END;

	-- templete for array of categoiries by only selected product
	DECLARE @lproduct TABLE (CategoryId INT PRIMARY KEY CLUSTERED);

	INSERT INTO @lproduct
	SELECT DISTINCT CategoryID
	FROM [Catalog].[ProductCategories]
	INNER JOIN [Settings].[ExportFeedSelectedProducts] ON [ProductCategories].[ProductID] = [ExportFeedSelectedProducts].[ProductID]
		AND [ExportFeedId] = @exportFeedId
	WHERE [ExportFeedSelectedProducts].[ProductID] IN (
			SELECT Product.[ProductID]
			FROM CATALOG.Product
			INNER JOIN [Catalog].[Offer] ON [Offer].[ProductID] = [Product].[ProductID]
			WHERE Offer.Price > 0
				AND (
					Offer.Amount > 0
					OR Product.AllowPreorder = 1
					)
				AND CategoryEnabled = 1
				AND Enabled = 1
			)

	SET @l1 = (
			SELECT MIN(CategoryId)
			FROM @lproduct
			);

	WHILE @l1 IS NOT NULL
	BEGIN
		--add categories by step thats no in array 
		INSERT INTO @result
		SELECT id
		FROM Settings.[GetParentsCategoryByChild](@l1) AS dt
		INNER JOIN CATALOG.Category ON CategoryId = id
		WHERE dt.id NOT IN (
				SELECT CategoryId
				FROM @result
				)
			AND HirecalEnabled = 1
			AND Enabled = 1
			
		
		SET @l1 = (
				SELECT MIN(CategoryId)
				FROM @lproduct
				WHERE CategoryId > @l1
				);
	END;

	IF @onlyCount = 1
	BEGIN
		SELECT Count([CategoryID])
		FROM [Catalog].[Category]
		WHERE CategoryID <> 0
			AND CategoryId IN (
				SELECT CategoryId
				FROM @result
				)
	END
	ELSE
	BEGIN
		SELECT [CategoryID]
			,[ParentCategory]
			,[Name]
		FROM [Catalog].[Category]
		WHERE CategoryID <> 0
			AND CategoryId IN (
				SELECT CategoryId
				FROM @result
				)
	END
END

GO--


ALTER PROCEDURE [Settings].[sp_GetExportFeedProducts] @exportFeedId int
	,@onlyCount BIT
	,@selectedCurrency NVARCHAR(10)
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
					AND Offer.Price > 0
					AND (
						Offer.Amount > 0
						OR Product.AllowPreOrder = 1
						)
					AND CategoryEnabled = 1
					AND Enabled = 1
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
			,[Offer].ArtNo
			,[Offer].Main
			,[Offer].ColorID
			,ColorName
			,[Offer].SizeID
			,SizeName
			,BrandName
			,GoogleProductCategory
			,YandexMarketCategory
			,Gtin
			,Adult
			,CurrencyValue
			,[Settings].PhotoToString(Offer.ColorID, Product.ProductId) AS Photos
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
		INNER JOIN [Catalog].Currency ON Currency.CurrencyID = [Product].CurrencyID
		WHERE (
				SELECT TOP (1) [ProductCategories].[CategoryId]
				FROM [Catalog].[ProductCategories]
				INNER JOIN [Catalog].[Category] ON [Category].[CategoryId] = [ProductCategories].[CategoryId]
				WHERE [ProductID] = [Product].[ProductID]
					AND [Enabled] = 1
					AND [Main] = 1
				) = [ProductCategories].[CategoryId]
			AND Offer.Price > 0
			AND (
				Offer.Amount > 0
				OR Product.AllowPreOrder = 1
				)
			AND CategoryEnabled = 1
			AND Product.Enabled = 1
	END
END

GO--

ALter Table [Settings].[ExportFeed]
Add Active bit NULL
GO--
ALter Table [Settings].[ExportFeed]
Add LastExport datetime NULL
GO--
Update  [Settings].[ExportFeed] Set Active = 1
GO--
ALter Table [Settings].[ExportFeed]
Alter Column Active bit NOT NULL
GO--

ALTER PROCEDURE [Settings].[sp_GetExportFeedProducts] @exportFeedId int
	,@onlyCount BIT
	,@exportNotActive BIT
	,@exportNotAmount BIT
	,@selectedCurrency NVARCHAR(10)
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
						OR Product.AllowPreOrder = 1 OR @exportNotAmount = 1
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
			,[Offer].ArtNo
			,[Offer].Main
			,[Offer].ColorID
			,ColorName
			,[Offer].SizeID
			,SizeName
			,BrandName
			,GoogleProductCategory
			,YandexMarketCategory
			,Gtin
			,Adult
			,CurrencyValue
			,[Settings].PhotoToString(Offer.ColorID, Product.ProductId) AS Photos
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
				OR Product.AllowPreOrder = 1
				OR @exportNotAmount = 1
				)
			AND CategoryEnabled = 1
			AND (Product.Enabled = 1 OR @exportNotActive = 1)
	END
END

GO--

DROP TABLE [Settings].[ExportFeedHistory]

GO--

Delete from Settings.ExportFeedSettings
GO--
DROP INDEX IX_ExportFeedSettings ON Settings.ExportFeedSettings
GO--
ALTER TABLE Settings.ExportFeedSettings
DROP COLUMN Name
GO--

if (select count(*) from [Settings].[Settings] where Name = 'ShowCategoryTree') = 0
	insert into [Settings].[Settings] ([Name],[Value]) values ('ShowCategoryTree', 'True')
GO--

update [Settings].[ModuleSettings] set [Value] = REPLACE([Value], 'grid-column-3-hand', 'col-xs-3') where [ModuleName] = 'BuyInTime' AND [Name] = 'BuyInTimeDefaultActionTextMode2'
GO--

if (SELECT COUNT(COLUMN_NAME) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'Catalog' AND TABLE_NAME = 'Product' AND COLUMN_NAME = 'ManufacturerWarranty') = 0
	ALTER TABLE [Catalog].[Product] ADD [ManufacturerWarranty] bit null
GO--

ALTER PROCEDURE [Catalog].[sp_AddProduct]    
	@ArtNo nvarchar(50) = '',  
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
	@CustomViewName nvarchar(50),
	@ManufacturerWarranty bit
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
		   ,CustomViewName
		   ,ManufacturerWarranty
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
		   @CustomViewName,
		   @ManufacturerWarranty
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
	@ArtNo nvarchar(50),  
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
	@CustomViewName nvarchar(50),
	@ManufacturerWarranty bit
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
	,[CustomViewName] = @CustomViewName
	,[ManufacturerWarranty] = @ManufacturerWarranty
WHERE ProductID = @ProductID    
END  
GO--

ALTER PROCEDURE [Settings].[sp_GetExportFeedProducts] @exportFeedId int
	,@onlyCount BIT
	,@exportNotActive BIT
	,@exportNotAmount BIT
	,@selectedCurrency NVARCHAR(10)
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
						OR Product.AllowPreOrder = 1 OR @exportNotAmount = 1
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
			,[Offer].ArtNo
			,[Offer].Main
			,[Offer].ColorID
			,ColorName
			,[Offer].SizeID
			,SizeName
			,BrandName
			,GoogleProductCategory
			,YandexMarketCategory
			,Gtin
			,Adult
			,CurrencyValue
			,[Settings].PhotoToString(Offer.ColorID, Product.ProductId) AS Photos
			,ManufacturerWarranty
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
				OR Product.AllowPreOrder = 1
				OR @exportNotAmount = 1
				)
			AND CategoryEnabled = 1
			AND (Product.Enabled = 1 OR @exportNotActive = 1)
	END
END
GO--


INSERT INTO [Settings].[Settings] (Name, Value) VALUES ('ReviewImageWidth', '100')
GO--
INSERT INTO [Settings].[Settings] (Name, Value) VALUES ('ReviewImageHeight', '100')
GO--

Insert Into [Settings].[Settings] ([Name],[Value]) Values ('Mobile_DisplayHeaderTitle', 'True')
Insert Into [Settings].[Settings] ([Name],[Value]) Values ('Mobile_HeaderCustomTitle', '')
GO--


CREATE TABLE [Settings].[TemplateSettings](
	[Template] [nvarchar](50) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Value] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_TemplateSettings] PRIMARY KEY CLUSTERED 
(
	[Template] ASC,
	[Name] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO--


Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'MainPageMode', 'TwoColumns')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'SearchBlockLocation', 'TopMenu')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'CarouselVisibility', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'CarouselAnimationDelay', '10000')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'CarouselAnimationSpeed', '700')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'MainPageProductsVisibility', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'CountMainPageProductInLine', '3')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'CountCatalogProductInLine', '3')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'RecentlyViewVisibility', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'NewsVisibility', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'NewsSubscriptionVisibility', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'CheckOrderVisibility', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'VotingVisibility', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'CurrencyVisibility', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'FilterVisibility', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'GiftSertificateVisibility', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'WishListVisibility', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'EnableSocialShareButtons', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'ShowCopyright', 'True')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'BrandLogoWidth', '100')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'BrandLogoHeight', '80')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'BigProductImageWidth', '1000')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'BigProductImageHeight', '1000')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'MiddleProductImageWidth', '250')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'MiddleProductImageHeight', '350')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'SmallProductImageWidth', '295')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'SmallProductImageHeight', '180')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'XSmallProductImageWidth', '60')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'XSmallProductImageHeight', '60')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'BigCategoryImageWidth', '740')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'BigCategoryImageHeight', '200')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'SmallCategoryImageWidth', '80')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'SmallCategoryImageHeight', '80')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'NewsImageWidth', '140')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'NewsImageHeight', '140')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'CarouselBigWidth', '500')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'CarouselBigHeight', '500')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'PaymentIconWidth', '60')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'PaymentIconHeight', '40')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'ShippingIconWidth', '60')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'ShippingIconHeight', '40')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'Theme', '_none')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'ColorScheme', '_none')

Insert Into [Settings].[TemplateSettings] ([Template],[Name],[Value])
Values ('_default', 'Background', '_none')

GO--


ALTER PROCEDURE [Settings].[sp_GetCsvProducts] 
	 @exportFeedId int
	,@onlyCount BIT
	,@exportNoInCategory BIT
AS
BEGIN
	DECLARE @res TABLE (productId INT PRIMARY KEY CLUSTERED);
	DECLARE @lproduct TABLE (productId INT PRIMARY KEY CLUSTERED);
	DECLARE @lproductNoCat TABLE (productId INT PRIMARY KEY CLUSTERED);

	INSERT INTO @lproduct
	SELECT [ProductID]
	FROM [Settings].[ExportFeedSelectedProducts]
	WHERE [ExportFeedId] = @exportFeedId;

	IF (@exportNoInCategory = 1)
	BEGIN
		INSERT INTO @lproductNoCat
		SELECT [ProductID]
		FROM [Catalog].Product
		WHERE [ProductID] NOT IN (
				SELECT [ProductID]
				FROM [Catalog].[ProductCategories]
				);
	END

	DECLARE @lcategory TABLE (CategoryId INT PRIMARY KEY CLUSTERED);
	DECLARE @l TABLE (CategoryId INT PRIMARY KEY CLUSTERED);

	INSERT INTO @l
	SELECT t.CategoryId
	FROM [Settings].[ExportFeedSelectedCategories] AS t
	INNER JOIN CATALOG.Category ON t.CategoryId = Category.CategoryId
	WHERE [ExportFeedId] = @exportFeedId

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
			

		SET @l1 = (
				SELECT MIN(CategoryId)
				FROM @l
				WHERE CategoryId > @l1
				);
	END;

	IF @onlyCount = 1
	BEGIN
		SELECT COUNT(ProductID)
		FROM [Catalog].[Product]
		WHERE EXISTS (
				SELECT 1
				FROM [Catalog].[ProductCategories]
				WHERE [ProductCategories].[ProductID] = [Product].[ProductID]
					AND (
						[ProductCategories].[ProductID] IN (
							SELECT productId
							FROM @lproduct
							)
						OR [ProductCategories].CategoryId IN (
							SELECT CategoryId
							FROM @lcategory
							)
						)
				)
			OR EXISTS (
				SELECT 1
				FROM @lproductNoCat AS TEMP
				WHERE TEMP.productId = [Product].[ProductID]
				)
	END
	ELSE
	BEGIN
		SELECT *
		FROM [Catalog].[Product]
		LEFT JOIN [Catalog].[Photo] ON [Photo].[ObjId] = [Product].[ProductID]
			AND Type = 'Product'
			AND Photo.[Main] = 1
		WHERE EXISTS (
				SELECT 1
				FROM [Catalog].[ProductCategories]
				WHERE [ProductCategories].[ProductID] = [Product].[ProductID]
					AND (
						[ProductCategories].[ProductID] IN (
							SELECT productId
							FROM @lproduct
							)
						OR [ProductCategories].CategoryId IN (
							SELECT CategoryId
							FROM @lcategory
							)
						)
				)
			OR EXISTS (
				SELECT 1
				FROM @lproductNoCat AS TEMP
				WHERE TEMP.productId = [Product].[ProductID]
				)
	END
END

GO--


ALTER PROCEDURE [Settings].[sp_GetCsvProducts] 
	 @exportFeedId int
	,@onlyCount BIT
	,@exportNoInCategory BIT
	,@exportNotActive BIT
AS
BEGIN
	DECLARE @res TABLE (productId INT PRIMARY KEY CLUSTERED);
	DECLARE @lproduct TABLE (productId INT PRIMARY KEY CLUSTERED);
	DECLARE @lproductNoCat TABLE (productId INT PRIMARY KEY CLUSTERED);

	INSERT INTO @lproduct
	SELECT [ProductID]
	FROM [Settings].[ExportFeedSelectedProducts]
	WHERE [ExportFeedId] = @exportFeedId;

	IF (@exportNoInCategory = 1)
	BEGIN
		INSERT INTO @lproductNoCat
		SELECT [ProductID]
		FROM [Catalog].Product
		WHERE [ProductID] NOT IN (
				SELECT [ProductID]
				FROM [Catalog].[ProductCategories]
				);
	END

	DECLARE @lcategory TABLE (CategoryId INT PRIMARY KEY CLUSTERED);
	DECLARE @l TABLE (CategoryId INT PRIMARY KEY CLUSTERED);

	INSERT INTO @l
	SELECT t.CategoryId
	FROM [Settings].[ExportFeedSelectedCategories] AS t
	INNER JOIN CATALOG.Category ON t.CategoryId = Category.CategoryId
	WHERE [ExportFeedId] = @exportFeedId

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
			

		SET @l1 = (
				SELECT MIN(CategoryId)
				FROM @l
				WHERE CategoryId > @l1
				);
	END;

	IF @onlyCount = 1
	BEGIN
		SELECT COUNT(ProductID)
		FROM [Catalog].[Product]
		WHERE EXISTS (
				SELECT 1
				FROM [Catalog].[ProductCategories]
				WHERE [ProductCategories].[ProductID] = [Product].[ProductID]
					AND (
						[ProductCategories].[ProductID] IN (
							SELECT productId
							FROM @lproduct
							)
						OR [ProductCategories].CategoryId IN (
							SELECT CategoryId
							FROM @lcategory
							)
						)
				)
			OR EXISTS (
				SELECT 1
				FROM @lproductNoCat AS TEMP
				WHERE TEMP.productId = [Product].[ProductID]
				)
			AND CategoryEnabled = 1
			AND (Enabled = 1 OR @exportNotActive = 1)
	END
	ELSE
	BEGIN
		SELECT *
		FROM [Catalog].[Product]
		LEFT JOIN [Catalog].[Photo] ON [Photo].[ObjId] = [Product].[ProductID]
			AND Type = 'Product'
			AND Photo.[Main] = 1
		WHERE EXISTS (
				SELECT 1
				FROM [Catalog].[ProductCategories]
				WHERE [ProductCategories].[ProductID] = [Product].[ProductID]
					AND (
						[ProductCategories].[ProductID] IN (
							SELECT productId
							FROM @lproduct
							)
						OR [ProductCategories].CategoryId IN (
							SELECT CategoryId
							FROM @lcategory
							)
						)
				)
			OR EXISTS (
				SELECT 1
				FROM @lproductNoCat AS TEMP
				WHERE TEMP.productId = [Product].[ProductID]
				)
			AND CategoryEnabled = 1
			AND (Enabled = 1 OR @exportNotActive = 1)
	END
END


GO--

ALTER PROCEDURE [Catalog].[sp_DeleteProduct]	
    @ProductID int
AS
BEGIN
	--1) delete all link in many to many table ProductCategory
	Declare @CategoryID int
	Declare mycursor CURSOR  FOR select CategoryID From Catalog.ProductCategories where ProductId = @ProductID
	open mycursor

	FETCH NEXT FROM mycursor INTO @CategoryID
	WHILE @@FETCH_STATUS = 0
	BEGIN

		if (select count(*) from Catalog.ProductCategories where CategoryID=@CategoryID and ProductID=@ProductID) > 0
		begin
			UPDATE [Catalog].[Category] SET Products_Count = Products_Count - 1, Total_Products_Count = Total_Products_Count - 1 WHERE CategoryID = @CategoryID
			delete from Catalog.ProductCategories where CategoryID=@CategoryID and ProductId=@ProductID
		end

		FETCH NEXT FROM mycursor INTO @CategoryID
	END

	CLOSE mycursor
	DEALLOCATE mycursor

	--2) delete product
	DELETE FROM [Catalog].[Product] WHERE ProductId = @ProductID

END
GO--

CREATE TABLE [Customers].[ClientCode](
	[UserId] [uniqueidentifier] NOT NULL,
	[Code] [int] NOT NULL,
	[CreatedDate] [date] NOT NULL,
 CONSTRAINT [PK_BonusClientCode] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[Code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]
) ON [PRIMARY]

GO--

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Module].[BonusClientCode]') AND type in (N'U'))
begin
	DROP TABLE [Module].[BonusClientCode]
end

GO--

ALTER PROCEDURE [Settings].[sp_GetExportFeedProducts] @exportFeedId int
	,@onlyCount BIT
	,@exportNotActive BIT
	,@exportNotAmount BIT
	,@selectedCurrency NVARCHAR(10)
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
						OR Product.AllowPreOrder = 1 OR @exportNotAmount = 1
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
			,[Offer].ArtNo
			,[Offer].Main
			,[Offer].ColorID
			,ColorName
			,[Offer].SizeID
			,SizeName
			,BrandName
			,GoogleProductCategory
			,YandexMarketCategory
			,Gtin
			,Adult
			,CurrencyValue
			,[Settings].PhotoToString(Offer.ColorID, Product.ProductId) AS Photos
			,ManufacturerWarranty
			,[Weight]
			,[Product].[Enabled]
			,[Offer].SupplyPrice

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
				OR Product.AllowPreOrder = 1
				OR @exportNotAmount = 1
				)
			AND CategoryEnabled = 1
			AND (Product.Enabled = 1 OR @exportNotActive = 1)
	END
END

GO--

INSERT INTO Settings.ExportFeed ([Name], [Type], [Description], [Active], [LastExport]) VALUES ('Выгрузка каталога в Csv', 'Csv', '', 0, null);
INSERT INTO Settings.ExportFeedSettings (ExportFeedId, Value) VALUES ((Select Scope_Identity()),'{"CsvEnconing":"Windows-1251","CsvSeparator":";","CsvColumSeparator":";","CsvPropertySeparator":":","CsvExportNoInCategory":false,"CsvCategorySort":false,"FieldMapping":[1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],"ModuleFieldMapping":[],"FileName":"catalog","FileExtention":"csv","PriceMargin":0.0,"ExportNotActiveProducts":false,"ExportNotAmountProducts":false,"AdditionalUrlTags":null}')
GO--
INSERT INTO Settings.ExportFeed ([Name], [Type], [Description], [Active], [LastExport]) VALUES ('Выгрузка в Yandex.Market', 'YandexMarket', '', 0, null);
INSERT INTO Settings.ExportFeedSettings (ExportFeedId, Value) VALUES ((Select Scope_Identity()),'{"Currency":"RUB","RemoveHtml":false,"Delivery":false,"DeliveryCost":1,"GlobalDeliveryCost":"[{\"Cost\":\"101\",\"Days\":\"1-2\",\"OrderBefore\":\"24\"},{\"Cost\":\"201\",\"Days\":\"1-5\",\"OrderBefore\":\"24\"}]","ExportProductProperties":false,"SalesNotes":"","ShopName":"#STORE_NAME#","CompanyName":"#STORE_NAME#","ColorSizeToName":false,"ProductDescriptionType":"short","FileName":"yamarket","FileExtention":"xml","PriceMargin":0.0,"ExportNotActiveProducts":false,"ExportNotAmountProducts":false,"AdditionalUrlTags":""}')
GO--
INSERT INTO Settings.ExportFeed ([Name], [Type], [Description], [Active], [LastExport]) VALUES ('Выгрузка в Google', 'GoogleMerchentCenter', '', 0, null);
INSERT INTO Settings.ExportFeedSettings (ExportFeedId, Value) VALUES ((Select Scope_Identity()),'{"Currency":"RUB","RemoveHtml":false,"DatafeedTitle":"#STORE_NAME#","DatafeedDescription":"#STORE_NAME#","GoogleProductCategory":"","ProductDescriptionType":"short","FileName":"google","FileExtention":"xml","PriceMargin":0.0,"ExportNotActiveProducts":false,"ExportNotAmountProducts":false,"AdditionalUrlTags":""}')
GO--
CREATE NONCLUSTERED INDEX ProductDiscountEnabled
ON [Catalog].[Product] ([Enabled],[CategoryEnabled],[Discount])

GO--

CREATE NONCLUSTERED INDEX Offer_Main
ON [Catalog].[Offer] ([Main])
INCLUDE ([OfferID])

GO--

CREATE NONCLUSTERED INDEX Product_Brand_Enabled
ON [Catalog].[Product] ([Enabled],[BrandID],[CategoryEnabled])
INCLUDE ([ProductId])
GO--

Alter table catalog.productExt 
add  [PriceTemp] float null
GO--

ALTER PROCEDURE [Catalog].[PreCalcProductParamsMass] AS BEGIN
SET NOCOUNT ON;
INSERT INTO [Catalog].[ProductExt] (ProductId,CountPhoto,PhotoId,VideosAvailable,MaxAvailable,NotSamePrices,MinPrice,Colors,AmountSort,OfferId,Comments,CategoryId)
  (SELECT ProductId,
          0,
          NULL,
          0,
          0,
          0,
          0,
          NULL,
          0,
          NULL,
          0,
		  NULL
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
	   WHERE [ProductID] = [ProductExt].ProductId
		 AND main =1),
    
    [PhotoId] =
	  (SELECT Top(1) CASE
						 WHEN Offer.ColorID IS NOT NULL THEN
								(SELECT TOP (1) PhotoId
								 FROM [Catalog].[Photo]
								 WHERE ([Photo].ColorID = Offer.ColorID
										OR [Photo].ColorID IS NULL)
								   AND [Photo].[ObjId] = [ProductExt].ProductId
								   AND TYPE = 'Product'
								 ORDER BY main DESC ,[Photo].[PhotoSortOrder])
						 ELSE
								(SELECT TOP (1) PhotoId
								 FROM [Catalog].[Photo]
								 WHERE [Photo].[ObjId] = [ProductExt].ProductId
								   AND TYPE = 'Product'
								 ORDER BY main DESC ,[Photo].[PhotoSortOrder])
					 END
	   FROM [Catalog].[Offer]
	   WHERE [ProductID] = [ProductExt].ProductId
		 AND main =1),
    
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
	   WHERE offer.productid = [ProductExt].ProductId),
	   
    [MinPrice] =
	  (SELECT min(price) FROM [Catalog].offer WHERE offer.productid = [ProductExt].ProductId),
	  
	[PriceTemp] =
	  ( SELECT ([Offer].Price - [Offer].Price * [Product].Discount / 100) * CurrencyValue   
			FROM CATALOG.offer 
			inner join catalog.product on offer.productId = product.productid
			inner join catalog.Currency on product.currencyid = Currency.currencyid
			WHERE offer.productid = [ProductExt].ProductId AND main = 1),

	  
    [Colors] =
	  (SELECT [Settings].[ProductColorsToString]([ProductExt].ProductId)),
	  
    [AmountSort] =
	  (SELECT Top(1) CASE
						 WHEN MaxAvailable <= 0
							  OR MaxAvailable < IsNull(Product.MinAmount, 0) THEN 0
						 ELSE 1
					 END
	   FROM [Catalog].Offer
	   INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
	   WHERE Offer.ProductId = [ProductExt].ProductId
		 AND main = 1),
		 
    [OfferId] =
	  (SELECT Top(1) OfferID
	   FROM [Catalog].offer
	   WHERE offer.productid = [ProductExt].ProductId
		 AND (offer.Main = 1 OR offer.Main IS NULL)),
	
	[Comments] = 
	  (SELECT Count(ReviewId) From CMS.Review Where EntityId = [ProductExt].ProductId And Checked = 1),
	
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
   WHERE offer.productid = @productId  
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
   WHERE offer.productid = @productId  
   )  
   Set @OfferId = (SELECT OfferID  
   FROM CATALOG.offer  
   WHERE offer.productid = @productId and (offer.Main = 1 OR offer.Main IS NULL)) 
   
   
    --@PriceTemp  
 SET @PriceTemp = (  
   SELECT ([Offer].Price - [Offer].Price * [Product].Discount / 100) * CurrencyValue   
   FROM CATALOG.offer inner join catalog.product on offer.productId = product.productid
   inner join catalog.Currency on product.currencyid = Currency.currencyid
   WHERE offer.productid = @productId  
   )  
   
Set @OfferId = (SELECT OfferID  
   FROM CATALOG.offer  
   WHERE offer.productid = @productId and (offer.Main = 1 OR offer.Main IS NULL)) 
 
 --@Comments
 SET @Comments = (
	SELECT Count(ReviewId) From CMS.Review Where EntityId = @productId And Checked = 1
	)   
 
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
   )  
 END  
END 
 
GO--
CREATE NONCLUSTERED INDEX Product_New_Enabled
ON [Catalog].[Product] ([Enabled],[New],[CategoryEnabled])

GO--

ALTER PROCEDURE [Catalog].[sp_GetColorsByCategory]  
 @CategoryID int,  
 @Indepth bit,
 @Type nvarchar(50)
AS  
BEGIN  
 if(@Indepth = 1)  
 begin  
 
  ;with cte as ( 
	   select distinct ColorID from Catalog.Offer   
	   inner join Catalog.Product on Offer.ProductID = Product.ProductID   
	   inner join Catalog.ProductCategories on ProductCategories.ProductID = Product.ProductID   
	   and ProductCategories.CategoryID in (select id from Settings.GetChildCategoryByParent(@CategoryID)) 
		 and Product.Enabled = 1 and Product.CategoryEnabled=1
    )
  Select Color.ColorID, ColorName, ColorCode, PhotoId, ObjId, PhotoName, SortOrder from Catalog.Color color
  Left Join Catalog.Photo On Photo.ObjId=Color.ColorId and Type=@type 
  INNER join cte on cte.ColorID = color. ColorID
       order by Color.SortOrder
 end  
 else  
 begin  
  ;with cte as ( 
	   select distinct ColorID from Catalog.Offer   
	   inner join Catalog.Product on Offer.ProductID = Product.ProductID   
	   inner join Catalog.ProductCategories on ProductCategories.ProductID = Product.ProductID   
	   and ProductCategories.CategoryID = @CategoryID and Product.Enabled = 1 and Product.CategoryEnabled=1
    )
  Select Color.ColorID, ColorName, ColorCode, PhotoId, ObjId, PhotoName, SortOrder from Catalog.Color color
  Left Join Catalog.Photo On Photo.ObjId=Color.ColorId and Type=@type 
  INNER join cte on cte.ColorID = color. ColorID
       order by Color.SortOrder
 end  
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
  ,[ProductPropertyValue].[SortOrder]  
  ,[Property].UseinFilter  
  ,[Property].UseIndetails  
  ,[Property].UseInBrief  
  ,[Property].[Name] as PropertyName  
  ,[Property].[SortOrder] as PropertySortOrder  
  ,[Property].[Expanded] as Expanded  
  ,[Property].[Type] as [Type]  
  ,[Property].GroupId as GroupId  
  ,GroupName  
  ,GroupSortorder  
 FROM [Catalog].[PropertyValue]  
 INNER JOIN [Catalog].[ProductPropertyValue] ON [ProductPropertyValue].[PropertyValueID] = [PropertyValue].[PropertyValueID]  
 inner join [Catalog].[Property] on [Property].[PropertyID] = [PropertyValue].[PropertyID]  
 left join Catalog.PropertyGroup on propertyGroup.PropertyGroupID = [Property].GroupID  
 WHERE [ProductID] = @ProductID  
 ORDER BY case when PropertyGroup.GroupSortOrder is null then 1 else 0 end, 
 PropertyGroup.GroupSortOrder,PropertyGroup.GroupName, [Property].[SortOrder], [Property].Name, [PropertyValue].[SortOrder], [PropertyValue].Value  
END

GO--


GO--

ALTER TABLE [Order].[Order] ADD
	ManagerConfirmed bit NULL
GO--

Update [Order].[Order] Set ManagerConfirmed = 1
GO--

ALTER TABLE [Order].[Order] 
ALter Column ManagerConfirmed bit NOT NULL
GO--

Update [CMS].[Menu] Set [MenuItemUrlPath] = 'login' Where [MenuItemUrlPath] = 'login.aspx' 
Update [CMS].[Menu] Set [MenuItemUrlPath] = 'registration' Where [MenuItemUrlPath] = 'registration.aspx' 
Update [CMS].[Menu] Set [MenuItemUrlPath] = 'forgotpassword' Where [MenuItemUrlPath] = 'fogotPassword.aspx' 
Update [CMS].[Menu] Set [MenuItemUrlPath] = 'myaccount' Where [MenuItemUrlPath] = 'myaccount.aspx' 
Update [CMS].[Menu] Set [MenuItemUrlPath] = 'myaccount#?tab=addressbook' Where [MenuItemUrlPath] = 'myaccount.aspx?tabid=addressbook' 
Update [CMS].[Menu] Set [MenuItemUrlPath] = 'myaccount#?tab=orderhistory' Where [MenuItemUrlPath] = 'myaccount.aspx?tabid=orderhistory' 
Update [CMS].[Menu] Set [MenuItemUrlPath] = 'myaccount#?tab=changepassword' Where [MenuItemUrlPath] = 'myaccount.aspx?tabid=changepassword' 
Update [CMS].[Menu] Set [MenuItemUrlPath] = 'productlist/sale' Where [MenuItemUrlPath] = 'productlist?type=sale' 

GO--

ALTER TABLE Catalog.ProductExt ADD
	Gifts bit NULL

GO--

Update Catalog.ProductExt Set Gifts = 0

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
	   WHERE [ProductID] = [ProductExt].ProductId
		 AND main =1),
    
    [PhotoId] =
	  (SELECT Top(1) CASE
						 WHEN Offer.ColorID IS NOT NULL THEN
								(SELECT TOP (1) PhotoId
								 FROM [Catalog].[Photo]
								 WHERE ([Photo].ColorID = Offer.ColorID
										OR [Photo].ColorID IS NULL)
								   AND [Photo].[ObjId] = [ProductExt].ProductId
								   AND TYPE = 'Product'
								 ORDER BY main DESC ,[Photo].[PhotoSortOrder])
						 ELSE
								(SELECT TOP (1) PhotoId
								 FROM [Catalog].[Photo]
								 WHERE [Photo].[ObjId] = [ProductExt].ProductId
								   AND TYPE = 'Product'
								 ORDER BY main DESC ,[Photo].[PhotoSortOrder])
					 END
	   FROM [Catalog].[Offer]
	   WHERE [ProductID] = [ProductExt].ProductId
		 AND main =1),
    
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
	   WHERE offer.productid = [ProductExt].ProductId),
	   
    [MinPrice] =
	  (SELECT min(price) FROM [Catalog].offer WHERE offer.productid = [ProductExt].ProductId),
	  
	[PriceTemp] =
	  ( SELECT ([Offer].Price - [Offer].Price * [Product].Discount / 100) * CurrencyValue   
			FROM CATALOG.offer 
			inner join catalog.product on offer.productId = product.productid
			inner join catalog.Currency on product.currencyid = Currency.currencyid
			WHERE offer.productid = [ProductExt].ProductId AND main = 1),

	  
    [Colors] =
	  (SELECT [Settings].[ProductColorsToString]([ProductExt].ProductId)),
	  
    [AmountSort] =
	  (SELECT Top(1) CASE
						 WHEN MaxAvailable <= 0
							  OR MaxAvailable < IsNull(Product.MinAmount, 0) THEN 0
						 ELSE 1
					 END
	   FROM [Catalog].Offer
	   INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
	   WHERE Offer.ProductId = [ProductExt].ProductId
		 AND main = 1),
		 
    [OfferId] =
	  (SELECT Top(1) OfferID
	   FROM [Catalog].offer
	   WHERE offer.productid = [ProductExt].ProductId
		 AND (offer.Main = 1 OR offer.Main IS NULL)),
	
	[Comments] = 
	  (SELECT Count(ReviewId) From CMS.Review Where EntityId = [ProductExt].ProductId And Checked = 1),
	  
	[Gifts] =
	  (SELECT Top(1) CASE
						 WHEN COUNT(ProductID) > 0 THEN 1
						 ELSE 0
					 END
	   FROM [Catalog].[RelatedProducts]
	   WHERE ProductID = [ProductExt].ProductId and [RelatedType] = 2),
	
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
   WHERE offer.productid = @productId  
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
   WHERE offer.productid = @productId  
   )  
   Set @OfferId = (SELECT OfferID  
   FROM CATALOG.offer  
   WHERE offer.productid = @productId and (offer.Main = 1 OR offer.Main IS NULL)) 
   
   
 --@PriceTemp  
 SET @PriceTemp = (  
   SELECT ([Offer].Price - [Offer].Price * [Product].Discount / 100) * CurrencyValue   
   FROM Catalog.Offer 
   inner join Catalog.Product on Offer.ProductId = Product.ProductId
   inner join Catalog.Currency on Product.Currencyid = Currency.Currencyid
   WHERE Offer.Productid = @productId and Main = 1
   )  
   
Set @OfferId = (SELECT OfferID  
   FROM CATALOG.offer  
   WHERE offer.productid = @productId and (offer.Main = 1 OR offer.Main IS NULL)) 
 
 --@Comments
 SET @Comments = (
	SELECT Count(ReviewId) From CMS.Review Where EntityId = @productId And Checked = 1
	) 
	  
--@Gifts
SET @Gifts =
	  (SELECT Top(1) CASE WHEN COUNT(ProductID) > 0 THEN 1 ELSE 0 END
	   FROM [Catalog].[RelatedProducts]
	   WHERE ProductID = @productId and [RelatedType] = 2)
 
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

ALTER TABLE [Order].[Order]
	DROP COLUMN ManagerId

GO--

ALTER TABLE [Order].[Order] ADD
	ManagerId int NULL
	
GO--

ALTER TABLE [Order].[Order] ADD CONSTRAINT
	FK_Order_Managers FOREIGN KEY
	(
	ManagerId
	) REFERENCES Customers.Managers
	(
	ManagerId
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO--

ALTER TABLE [Customers].[ManagerTask]  WITH CHECK ADD  CONSTRAINT [FK_ManagerTask_Customer] FOREIGN KEY([CustomerId])
REFERENCES [Customers].[Customer] ([CustomerID])
ON DELETE SET NULL
GO--
ALTER TABLE [Customers].[ManagerTask] CHECK CONSTRAINT [FK_ManagerTask_Customer]
GO--

ALTER TABLE [Customers].[ManagerTask]  WITH CHECK ADD  CONSTRAINT [FK_ManagerTask_Order] FOREIGN KEY([OrderId])
REFERENCES [Order].[Order] ([OrderID])
ON DELETE SET NULL
GO--
ALTER TABLE [Customers].[ManagerTask] CHECK CONSTRAINT [FK_ManagerTask_Order]
GO--

ALTER TABLE [Customers].[ManagerTask]  WITH CHECK ADD  CONSTRAINT [FK_ManagerTaskAppointedManagerId_Managers] FOREIGN KEY([AppointedManagerId])
REFERENCES [Customers].[Managers] ([ManagerId])
GO--
ALTER TABLE [Customers].[ManagerTask] CHECK CONSTRAINT [FK_ManagerTaskAppointedManagerId_Managers]
GO--

ALTER TABLE [Customers].[ManagerTask]  WITH CHECK ADD  CONSTRAINT [FK_ManagerTaskAssignedManagerId_Managers] FOREIGN KEY([AssignedManagerId])
REFERENCES [Customers].[Managers] ([ManagerId])
GO--
ALTER TABLE [Customers].[ManagerTask] CHECK CONSTRAINT [FK_ManagerTaskAssignedManagerId_Managers]
GO--

ALTER PROCEDURE [Order].[sp_GetCustomerOrderHistory]
	@CustomerID uniqueidentifier
AS
BEGIN
	SELECT 
	[Order].[Order].OrderID, 
    [Order].[Order].Number, 
    [Order].[Order].OrderDiscount, 
    [Order].[OrderStatus].StatusName, 
    [Order].[OrderStatus].OrderStatusID,
    [Order].[Order].Sum, 
    [Order].[Order].OrderDate, 
    [Order].[Order].PaymentDate,
    [Order].[Order].PaymentMethodName,
    [Order].[Order].ShippingMethodName,
    [Order].[ShippingMethod].Name as ShippingMethod, 
    [Order].[PaymentMethodID],    
	[Order].[ManagerID],  
	([Customer].[FirstName] + ' ' + [Customer].[LastName]) as ManagerName,  
    [OrderCurrency].CurrencyCode,
    [OrderCurrency].CurrencyNumCode,
    [OrderCurrency].CurrencyValue,
    [OrderCurrency].CurrencySymbol,
    [OrderCurrency].IsCodeBefore
    FROM [Order].[Order] 
    left JOIN [Order].OrderStatus ON [Order].[Order].OrderStatusID = [Order].OrderStatus.OrderStatusID 
    INNER JOIN [Order].[OrderCurrency] ON [Order].[Order].OrderID = [Order].[OrderCurrency].OrderID 
    left JOIN [Order].[ShippingMethod] ON [Order].[Order].ShippingMethodID = [Order].[ShippingMethod].ShippingMethodID 
    INNER JOIN [Order].[OrderCustomer] ON [Order].[Order].OrderID = [Order].[OrderCustomer].OrderID
	LEFT JOIN [Customers].[Managers] ON [Order].[Order].ManagerId = [Customers].[Managers].Managerid
	LEFT JOIN  [Customers].Customer on [Managers].CustomerID = Customer.Customerid
    WHERE [Order].[OrderCustomer].CustomerID =@CustomerID ORDER BY [Order].[Order].OrderDate DESC
END


GO--


CREATE TABLE [Catalog].[RelatedPropertyValues](
	[CategoryId] [int] NOT NULL,
	[PropertyValueId] [int] NOT NULL,
	[RelatedType] [int] NOT NULL
) ON [PRIMARY]

GO--

ALTER TABLE [Catalog].[RelatedPropertyValues]  WITH CHECK ADD  CONSTRAINT [FK_RelatedPropertyValues_Category] FOREIGN KEY([CategoryId])
REFERENCES [Catalog].[Category] ([CategoryID])
ON DELETE CASCADE
GO--

ALTER TABLE [Catalog].[RelatedPropertyValues] CHECK CONSTRAINT [FK_RelatedPropertyValues_Category]
GO--

ALTER TABLE [Catalog].[RelatedPropertyValues]  WITH CHECK ADD  CONSTRAINT [FK_RelatedPropertyValues_PropertyValue] FOREIGN KEY([PropertyValueId])
REFERENCES [Catalog].[PropertyValue] ([PropertyValueID])
ON DELETE CASCADE
GO--

ALTER TABLE [Catalog].[RelatedPropertyValues] CHECK CONSTRAINT [FK_RelatedPropertyValues_PropertyValue]
GO--

IF NOT EXISTS(SELECT * FROM sys.columns  WHERE [name] = N'[AddedByRequest]' AND [object_id] = OBJECT_ID(N'[Catalog].[ShoppingCart]'))
	alter table [Catalog].[ShoppingCart] add AddedByRequest bit null
GO--

update [Catalog].[ShoppingCart] set AddedByRequest = 0 where AddedByRequest IS NULL
GO--

alter table [Catalog].[ShoppingCart] alter column AddedByRequest bit not null
GO--

IF NOT EXISTS(SELECT * FROM sys.columns  WHERE [name] = N'Options' AND [object_id] = OBJECT_ID(N'Order.OrderByRequest'))
	ALTER TABLE [Order].[OrderByRequest] ADD [Options] [nvarchar](max) NULL
GO--

if (SELECT COUNT(TABLE_NAME) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'Module' AND TABLE_NAME = 'ProductSet') > 0
BEGIN
	EXEC('ALTER TABLE [Module].[ProductSet] ADD LinkedOfferId int NULL')
	EXEC('UPDATE [Module].[ProductSet] SET LinkedOfferId = (SELECT OfferId From Catalog.Offer WHERE ProductId = ProductSet.LinkedProductId AND Offer.Main = 1)')
	EXEC('ALTER TABLE [Module].[ProductSet] ALTER COLUMN LinkedOfferId int NOT NULL')
	EXEC('ALTER TABLE [Module].[ProductSet] DROP CONSTRAINT [PK_ProductSet]')
	EXEC('ALTER TABLE [Module].[ProductSet] DROP COLUMN LinkedProductId')
	EXEC(N'ALTER TABLE [Module].[ProductSet] ADD  CONSTRAINT [PK_ProductSet] PRIMARY KEY CLUSTERED
	(
		[ProductId] ASC,
		[LinkedOfferId] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 80) ON [PRIMARY]')
END
GO--

Insert Into [Settings].[Settings] ([Name],[Value]) Values ('PhonerLiteActive', 'False')
GO--

Insert Into [Settings].[Settings] (Name, Value) VALUES ('BuyInOneClick_ButtonText','Заказать')

GO--

CREATE TABLE [Catalog].[ProductGifts](
	[ProductId] [int] NOT NULL,
	[GiftOfferId] [int] NOT NULL,
 CONSTRAINT [PK_ProductGifts] PRIMARY KEY CLUSTERED 
(
	[ProductId] ASC,
	[GiftOfferId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO--

ALTER TABLE [Catalog].[ProductGifts]  WITH CHECK ADD  CONSTRAINT [FK_ProductGifts_Offer] FOREIGN KEY([GiftOfferId])
REFERENCES [Catalog].[Offer] ([OfferID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO--

INSERT INTO [Catalog].[ProductGifts] ([ProductId], [GiftOfferId])
SELECT [ProductID], (SELECT OfferId FROM Catalog.Offer WHERE ProductId = [RelatedProducts].[LinkedProductID] AND Main = 1) 
FROM [Catalog].[RelatedProducts] where [RelatedType] = 2
GO--

DELETE FROM [Catalog].[RelatedProducts] where [RelatedType] = 2
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
   WHERE offer.productid = @productId  
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
   WHERE offer.productid = @productId  
   )  
   Set @OfferId = (SELECT OfferID  
   FROM CATALOG.offer  
   WHERE offer.productid = @productId and (offer.Main = 1 OR offer.Main IS NULL)) 
   
   
 --@PriceTemp  
 SET @PriceTemp = (  
   SELECT ([Offer].Price - [Offer].Price * [Product].Discount / 100) * CurrencyValue   
   FROM Catalog.Offer 
   inner join Catalog.Product on Offer.ProductId = Product.ProductId
   inner join Catalog.Currency on Product.Currencyid = Currency.Currencyid
   WHERE Offer.Productid = @productId and Main = 1
   )  
   
Set @OfferId = (SELECT OfferID  
   FROM CATALOG.offer  
   WHERE offer.productid = @productId and (offer.Main = 1 OR offer.Main IS NULL)) 
 
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
	   WHERE [ProductID] = [ProductExt].ProductId
		 AND main =1),
    
    [PhotoId] =
	  (SELECT Top(1) CASE
						 WHEN Offer.ColorID IS NOT NULL THEN
								(SELECT TOP (1) PhotoId
								 FROM [Catalog].[Photo]
								 WHERE ([Photo].ColorID = Offer.ColorID
										OR [Photo].ColorID IS NULL)
								   AND [Photo].[ObjId] = [ProductExt].ProductId
								   AND TYPE = 'Product'
								 ORDER BY main DESC ,[Photo].[PhotoSortOrder])
						 ELSE
								(SELECT TOP (1) PhotoId
								 FROM [Catalog].[Photo]
								 WHERE [Photo].[ObjId] = [ProductExt].ProductId
								   AND TYPE = 'Product'
								 ORDER BY main DESC ,[Photo].[PhotoSortOrder])
					 END
	   FROM [Catalog].[Offer]
	   WHERE [ProductID] = [ProductExt].ProductId
		 AND main =1),
    
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
	   WHERE offer.productid = [ProductExt].ProductId),
	   
    [MinPrice] =
	  (SELECT min(price) FROM [Catalog].offer WHERE offer.productid = [ProductExt].ProductId),
	  
	[PriceTemp] =
	  ( SELECT ([Offer].Price - [Offer].Price * [Product].Discount / 100) * CurrencyValue   
			FROM CATALOG.offer 
			inner join catalog.product on offer.productId = product.productid
			inner join catalog.Currency on product.currencyid = Currency.currencyid
			WHERE offer.productid = [ProductExt].ProductId AND main = 1),

	  
    [Colors] =
	  (SELECT [Settings].[ProductColorsToString]([ProductExt].ProductId)),
	  
    [AmountSort] =
	  (SELECT Top(1) CASE
						 WHEN MaxAvailable <= 0
							  OR MaxAvailable < IsNull(Product.MinAmount, 0) THEN 0
						 ELSE 1
					 END
	   FROM [Catalog].Offer
	   INNER JOIN [Catalog].Product ON Product.ProductId = Offer.ProductId
	   WHERE Offer.ProductId = [ProductExt].ProductId
		 AND main = 1),
		 
    [OfferId] =
	  (SELECT Top(1) OfferID
	   FROM [Catalog].offer
	   WHERE offer.productid = [ProductExt].ProductId
		 AND (offer.Main = 1 OR offer.Main IS NULL)),
	
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

CREATE PROCEDURE [Catalog].[sp_GetCategoryOffers]
(		
	@Categoryid int
)
AS
begin
	SELECT 
		0 as [ItemType],
		CategoryID as ID, 
		Name,
		(SELECT Count(CategoryID) FROM [Catalog].[Category] AS c WHERE c.ParentCategory = p.CategoryID) + Total_Products_Count AS [ChildCount], 
		SortOrder, 
		null as ArtNo 
		FROM catalog.Category AS p WHERE ParentCategory=@categoryid and CategoryID <> 0
	union
	SELECT 
		1 as [ItemType], 
		Offer.OfferId AS ID, 
		Name + ISNULL(', ' + Color.ColorName, '') + ISNULL(', ' + Size.SizeName, '') as Name, 
		0 AS [ChildCount],
		ProductCategories.SortOrder AS SortOrder, 
		Offer.ArtNo
		FROM Catalog.Offer
		LEFT JOIN Catalog.Color ON Color.ColorId = Offer.ColorId
		LEFT JOIN Catalog.Size ON Size.SizeId = Offer.SizeId
		INNER JOIN Catalog.Product ON Product.ProductId = Offer.ProductId
		INNER join catalog.ProductCategories on ProductCategories.ProductID = Offer.ProductID WHERE ProductCategories.CategoryID = @categoryid ORDER BY SortOrder
end
GO--

update [Order].ShippingMethod set ShippingType='Edost' where  ShippingType = 'eDost'
update [Order].ShippingMethod set ShippingType='NovaPoshta' where  ShippingType = 'ShippingNovaPoshta'
update [Order].ShippingMethod set ShippingType='Sdek' where  ShippingType = 'Cdek'
update [Order].ShippingMethod set ShippingType='EmsPost' where  ShippingType = 'ShippingByEmsPost'
update [Order].ShippingMethod set ShippingType='CheckoutRu' where  ShippingType = '17'

GO--

EXEC sp_rename '[Shipping].[CdekCities]', 'SdekCities'
GO--


ALTER TABLE [Order].Lead ADD
	Discount float(53) NULL
GO--

Update [Order].Lead Set Discount = 0
GO--


update settings.ModuleSettings set value=replace(value, 'pictures/productLP/images', 'modules/productlandingpage/templates/lp/pictures') where name='ProductLandingPageCommonStatic'

GO--

update seo.metainfo set Title=Replace(Title, '#PAGENAME#', '#PAGE_NAME#'), MetaKeywords= replace(MetaKeywords,  '#PAGENAME#', '#PAGE_NAME#'), MetaDescription= replace(MetaDescription,  '#PAGENAME#', '#PAGE_NAME#')
GO--

delete from seo.metainfo where type='default'

GO--

insert into settings.settings (name, value) values ('Email_NewLead', (select value from settings.settings where name='Email_4_orders'))

GO--

if ((Select Count(*) From [Settings].[Settings] where Name = 'IsMobileTemplateActive') > 0)
	Update [Settings].[Settings] Set Name = 'Mobile_IsMobileTemplateActive' where Name = 'IsMobileTemplateActive'
else
	Insert Into [Settings].[Settings] (Name, Value) Values ('Mobile_IsMobileTemplateActive', 'False')

GO--

if(select count (*) from Settings.GiftCertificatePayments) = 0
begin
	insert into Settings.GiftCertificatePayments  (PaymentID)  select paymentmethodid from [order].PaymentMethod
end

GO--

ALTER TABLE Settings.ExportFeed
DROP COLUMN Active

GO--

alter table catalog.product
add ModifiedBy nvarchar(50) null

GO--

ALTER PROCEDURE [Catalog].[sp_AddProduct]    
	@ArtNo nvarchar(50) = '',  
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
	@ModifiedBy nvarchar(50)
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
		   @ModifiedBy
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
	@ArtNo nvarchar(50),  
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
	@ModifiedBy nvarchar(50)
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
WHERE ProductID = @ProductID    
END  

GO--

Alter table [order].[orderstatus] add Hidden bit
GO--

update [order].[orderstatus] set Hidden = 0

GO--

ALTER PROCEDURE [Order].[sp_AddOrderStatus]
	@OrderStatusID int,
	@StatusName nvarchar(50),
	@CommandID int,
	@IsDefault bit,
	@IsCanceled bit,
	@IsCompleted bit,
	@Color nvarchar(10),
	@SortOrder int,
	@Hidden bit
AS
BEGIN
	declare @hasDefault bit;
	if (select count(orderStatusID) from [Order].[OrderStatus] where isdefault=1) = 1
		set @hasDefault = 1
	else
		set @hasDefault = 0
		
	if (@hasDefault=1 & @IsDefault)
	begin
		update [Order].[OrderStatus] set IsDefault = 0
	end
	
	insert into [Order].[OrderStatus] (StatusName, CommandID, IsDefault, IsCanceled, IsCompleted, Color, SortOrder, Hidden) 
							   VALUES (@StatusName, @CommandID, @IsDefault | ~@hasDefault, @IsCanceled, @IsCompleted, @Color, @SortOrder, @Hidden)
	select SCOPE_IDENTITY()	    
END

GO--
ALTER PROCEDURE [Order].[sp_UpdateOrderStatus]
	@OrderStatusID int,
	@StatusName nvarchar(50),
	@CommandID int,
	@IsDefault bit,
	@IsCanceled bit,	
	@IsCompleted bit,	
	@Color nvarchar(10),
	@SortOrder int,
	@Hidden bit
AS
BEGIN
	declare @hasDefault bit;
	if (select count(orderStatusID) from [Order].[OrderStatus] where isdefault=1 and OrderStatusID<>@OrderStatusID ) = 1
		set @hasDefault = 1
	else
		set @hasDefault = 0

	if (@hasDefault=1 & @IsDefault)
	begin
		update [Order].[OrderStatus] set IsDefault = 0
	end

	update [Order].[OrderStatus]
	SET StatusName = @StatusName, CommandID = @CommandID, IsDefault = @IsDefault | ~@hasDefault,
		IsCanceled = @IsCanceled, IsCompleted=@IsCompleted, Color = @Color, SortOrder = @SortOrder, Hidden=@Hidden
		Where OrderStatusID = @OrderStatusID
END	

GO--


ALTER PROCEDURE [Customers].[sp_AddCustomer]  
	   @CustomerID uniqueidentifier = newID,  
	   @CustomerGroupID int,  
	   @Password nvarchar(100),  
	   @FirstName nvarchar(70),  
	   @LastName nvarchar(70),  
	   @Phone nvarchar(max),  
	   @StandardPhone bigint,  
       @RegistrationDateTime datetime,             
       @Email nvarchar(100),  
       @CustomerRole int,  
       @Patronymic nvarchar(70),
       @BonusCardNumber bigint,
	   @AdminComment nvarchar(MAX),
	   @ManagerId int,
	   @Rating int
AS  
BEGIN  
 INSERT INTO [Customers].[Customer]  
           (
		   [CustomerID],
		   [CustomerGroupID]  
           ,[Password]  
           ,[FirstName]  
           ,[LastName]  
           ,[Phone]  
		   ,[StandardPhone]
           ,[RegistrationDateTime]             
           ,[Email]  
           ,[CustomerRole]  
           ,[Patronymic]
           ,[BonusCardNumber]
		   ,[AdminComment]
		   ,[ManagerId]
		   ,[Rating])  
     VALUES  
           (
		   @CustomerID
		   ,@CustomerGroupID  
           ,@Password  
           ,@FirstName  
           ,@LastName  
           ,@Phone
		   ,@StandardPhone
           ,@RegistrationDateTime             
           ,@Email  
           ,@CustomerRole  
           ,@Patronymic
           ,@BonusCardNumber
		   ,@AdminComment
		   ,@ManagerId
		   ,@Rating);  
     SELECT CustomerID from [Customer] where Email =@Email  
END  

GO--
Update [Order].[order] set Number= convert(nvarchar, Orderid)
GO--

ALTER PROCEDURE [Customers].[sp_AddCustomer]    
    @CustomerID uniqueidentifier,    
    @CustomerGroupID int,    
    @Password nvarchar(100),    
    @FirstName nvarchar(70),    
    @LastName nvarchar(70),    
    @Phone nvarchar(max),    
    @StandardPhone bigint,    
	@RegistrationDateTime datetime,               
	@Email nvarchar(100),    
	@CustomerRole int,    
	@Patronymic nvarchar(70),  
	@BonusCardNumber bigint,  
    @AdminComment nvarchar(MAX),  
    @ManagerId int,  
    @Rating int  
AS    
BEGIN    
 if @CustomerID is null
	Set @CustomerID = newID()

 INSERT INTO [Customers].[Customer]    
    ([CustomerID],  
     [CustomerGroupID]    
	,[Password]    
	,[FirstName]    
	,[LastName]    
	,[Phone]    
	,[StandardPhone]  
	,[RegistrationDateTime]               
	,[Email]    
	,[CustomerRole]    
	,[Patronymic]  
	,[BonusCardNumber]  
	,[AdminComment]  
	,[ManagerId]  
	,[Rating])    
  VALUES    
    (@CustomerID  
	,@CustomerGroupID    
	,@Password    
	,@FirstName    
	,@LastName    
	,@Phone  
	,@StandardPhone  
	,@RegistrationDateTime               
	,@Email    
	,@CustomerRole    
	,@Patronymic  
	,@BonusCardNumber  
	,@AdminComment  
	,@ManagerId  
	,@Rating);    
  SELECT CustomerID From [Customers].[Customer] Where Email = @Email    
END
GO--


ALTER PROCEDURE [Settings].[sp_GetCsvProducts]   
	  @exportFeedId int  
	 ,@onlyCount BIT  
	 ,@exportNoInCategory BIT  
	 ,@exportNotActive BIT  
AS  
BEGIN  
 DECLARE @res TABLE (productId INT PRIMARY KEY CLUSTERED);  
 DECLARE @lproduct TABLE (productId INT PRIMARY KEY CLUSTERED);  
 DECLARE @lproductNoCat TABLE (productId INT PRIMARY KEY CLUSTERED);  
  
 INSERT INTO @lproduct  
	 SELECT [ProductID]  
	 FROM [Settings].[ExportFeedSelectedProducts]  
	 WHERE [ExportFeedId] = @exportFeedId;  
  
 IF (@exportNoInCategory = 1)  
 BEGIN  
  INSERT INTO @lproductNoCat  
	  SELECT [ProductID]  
	  FROM [Catalog].Product  
	  WHERE [ProductID] NOT IN (  
		SELECT [ProductID]  
		FROM [Catalog].[ProductCategories]  
		);  
 END  
  
 DECLARE @lcategory TABLE (CategoryId INT PRIMARY KEY CLUSTERED);  
 DECLARE @l TABLE (CategoryId INT PRIMARY KEY CLUSTERED);  
  
 INSERT INTO @l  
	 SELECT t.CategoryId  
	 FROM [Settings].[ExportFeedSelectedCategories] AS t  
	 INNER JOIN CATALOG.Category ON t.CategoryId = Category.CategoryId  
	 WHERE [ExportFeedId] = @exportFeedId  
  
 DECLARE @l1 INT  
  
 SET @l1 = (SELECT MIN(CategoryId) FROM @l);  
  
 WHILE @l1 IS NOT NULL  
 BEGIN
   
  INSERT INTO @lcategory  
	  SELECT id  
	  FROM Settings.GetChildCategoryByParent(@l1) AS dt  
	  INNER JOIN CATALOG.Category ON CategoryId = id  
	  WHERE dt.id NOT IN (SELECT CategoryId FROM @lcategory)
  
  SET @l1 = (SELECT MIN(CategoryId) FROM @l  WHERE CategoryId > @l1);  
 END;  
  
 IF @onlyCount = 1  
 BEGIN  
  SELECT COUNT(ProductID)  
  FROM [Catalog].[Product]  
  WHERE 
  (
	EXISTS (  
		SELECT 1  
		FROM [Catalog].[ProductCategories]  
		WHERE [ProductCategories].[ProductID] = [Product].[ProductID]  
		 AND ([ProductCategories].[ProductID] IN (SELECT productId FROM @lproduct)  
		  OR [ProductCategories].CategoryId IN (SELECT CategoryId FROM @lcategory))  
	)  
    OR EXISTS (  
		SELECT 1  
		FROM @lproductNoCat AS TEMP  
		WHERE TEMP.productId = [Product].[ProductID]  
	)
   )  
   AND CategoryEnabled = 1  
   AND (Enabled = 1 OR @exportNotActive = 1)  
 END  
 ELSE  
 BEGIN  
  SELECT *  
  FROM [Catalog].[Product]  
  LEFT JOIN [Catalog].[Photo] ON [Photo].[ObjId] = [Product].[ProductID] AND Type = 'Product' AND Photo.[Main] = 1  
  WHERE 
  (
	EXISTS (  
		SELECT 1  
		FROM [Catalog].[ProductCategories]  
		WHERE [ProductCategories].[ProductID] = [Product].[ProductID]  
		 AND ([ProductCategories].[ProductID] IN (SELECT productId FROM @lproduct)  
		  OR [ProductCategories].CategoryId IN (SELECT CategoryId FROM @lcategory))  
    )  
    OR EXISTS (  
		SELECT 1  
		FROM @lproductNoCat AS TEMP  
		WHERE TEMP.productId = [Product].[ProductID]  
    )
   )  
   AND CategoryEnabled = 1  
   AND (Enabled = 1 OR @exportNotActive = 1)  
 END  
END 
GO--


ALTER PROCEDURE [Settings].[sp_GetCsvProducts]   
	  @exportFeedId int  
	 ,@onlyCount BIT  
	 ,@exportNoInCategory BIT  
	 ,@exportNotActive BIT
	 ,@exportNotAmount BIT
AS  
BEGIN  
 DECLARE @res TABLE (productId INT PRIMARY KEY CLUSTERED);  
 DECLARE @lproduct TABLE (productId INT PRIMARY KEY CLUSTERED);  
 DECLARE @lproductNoCat TABLE (productId INT PRIMARY KEY CLUSTERED);  
  
 INSERT INTO @lproduct  
	 SELECT [ProductID]  
	 FROM [Settings].[ExportFeedSelectedProducts]  
	 WHERE [ExportFeedId] = @exportFeedId;  
  
 IF (@exportNoInCategory = 1)  
 BEGIN  
  INSERT INTO @lproductNoCat  
	  SELECT [ProductID]  
	  FROM [Catalog].Product  
	  WHERE [ProductID] NOT IN (  
		SELECT [ProductID]  
		FROM [Catalog].[ProductCategories]  
		);  
 END  
  
 DECLARE @lcategory TABLE (CategoryId INT PRIMARY KEY CLUSTERED);  
 DECLARE @l TABLE (CategoryId INT PRIMARY KEY CLUSTERED);  
  
 INSERT INTO @l  
	 SELECT t.CategoryId  
	 FROM [Settings].[ExportFeedSelectedCategories] AS t  
	 INNER JOIN CATALOG.Category ON t.CategoryId = Category.CategoryId  
	 WHERE [ExportFeedId] = @exportFeedId  
  
 DECLARE @l1 INT  
  
 SET @l1 = (SELECT MIN(CategoryId) FROM @l);  
  
 WHILE @l1 IS NOT NULL  
 BEGIN
   
  INSERT INTO @lcategory  
	  SELECT id  
	  FROM Settings.GetChildCategoryByParent(@l1) AS dt  
	  INNER JOIN CATALOG.Category ON CategoryId = id  
	  WHERE dt.id NOT IN (SELECT CategoryId FROM @lcategory)
  
  SET @l1 = (SELECT MIN(CategoryId) FROM @l  WHERE CategoryId > @l1);  
 END;  
  
 IF @onlyCount = 1  
 BEGIN  
  SELECT COUNT(ProductID)  
  FROM [Catalog].[Product]  
  WHERE 
  (
	EXISTS (  
		SELECT 1  
		FROM [Catalog].[ProductCategories]  
		WHERE [ProductCategories].[ProductID] = [Product].[ProductID]  
		 AND ([ProductCategories].[ProductID] IN (SELECT productId FROM @lproduct)  
		  OR [ProductCategories].CategoryId IN (SELECT CategoryId FROM @lcategory))  
	)  
    OR EXISTS (  
		SELECT 1  
		FROM @lproductNoCat AS TEMP  
		WHERE TEMP.productId = [Product].[ProductID]  
	)
   )  
   AND CategoryEnabled = 1  
   AND (Enabled = 1 OR @exportNotActive = 1) 
   AND ((Select ISNULL(Max(Price), 0) From [Catalog].[Offer] Where [Offer].[ProductId] = [Product].[ProductID]) > 0 OR @exportNotAmount = 1)
   AND ((Select ISNULL(Max(Amount), 0) From [Catalog].[Offer] Where [Offer].[ProductId] = [Product].[ProductID]) > 0 OR Product.AllowPreOrder = 1 OR @exportNotAmount = 1) 
 END  
 ELSE  
 BEGIN  
  SELECT *  
  FROM [Catalog].[Product]  
  LEFT JOIN [Catalog].[Photo] ON [Photo].[ObjId] = [Product].[ProductID] AND Type = 'Product' AND Photo.[Main] = 1  
  WHERE 
  (
	EXISTS (  
		SELECT 1  
		FROM [Catalog].[ProductCategories]  
		WHERE [ProductCategories].[ProductID] = [Product].[ProductID]  
		 AND ([ProductCategories].[ProductID] IN (SELECT productId FROM @lproduct)  
		  OR [ProductCategories].CategoryId IN (SELECT CategoryId FROM @lcategory))  
    )  
    OR EXISTS (  
		SELECT 1  
		FROM @lproductNoCat AS TEMP  
		WHERE TEMP.productId = [Product].[ProductID]  
    )
   )  
   AND CategoryEnabled = 1  
   AND (Enabled = 1 OR @exportNotActive = 1)  
   AND ((Select ISNULL(Max(Price), 0) From [Catalog].[Offer] Where [Offer].[ProductId] = [Product].[ProductID]) > 0 OR @exportNotAmount = 1)
   AND ((Select ISNULL(Max(Amount), 0) From [Catalog].[Offer] Where [Offer].[ProductId] = [Product].[ProductID]) > 0 OR Product.AllowPreOrder = 1 OR @exportNotAmount = 1)
 END  
END 

GO--





alter table [order].[order] add PreviousStatus nvarchar(100)

GO--

ALTER PROCEDURE [Order].[sp_GetCustomerOrderHistory]
	@CustomerID uniqueidentifier
AS
BEGIN
	SELECT 
	[Order].[Order].OrderID, 
    [Order].[Order].Number, 
    [Order].[Order].OrderDiscount, 
    [Order].[OrderStatus].StatusName,
	[Order].PreviousStatus,
    [Order].[OrderStatus].OrderStatusID,
    [Order].[Order].Sum, 
    [Order].[Order].OrderDate, 
    [Order].[Order].PaymentDate,
    [Order].[Order].PaymentMethodName,
    [Order].[Order].ShippingMethodName,
    [Order].[ShippingMethod].Name as ShippingMethod, 
    [Order].[PaymentMethodID],    
	[Order].[ManagerID],  
	([Customer].[FirstName] + ' ' +[Customer].[LastName]) as ManagerName,  
    [OrderCurrency].CurrencyCode,
    [OrderCurrency].CurrencyNumCode,
    [OrderCurrency].CurrencyValue,
    [OrderCurrency].CurrencySymbol,
    [OrderCurrency].IsCodeBefore
    FROM [Order].[Order] 
    left JOIN [Order].OrderStatus ON [Order].[Order].OrderStatusID = [Order].OrderStatus.OrderStatusID 
    INNER JOIN [Order].[OrderCurrency] ON [Order].[Order].OrderID = [Order].[OrderCurrency].OrderID 
    left JOIN [Order].[ShippingMethod] ON [Order].[Order].ShippingMethodID = [Order].[ShippingMethod].ShippingMethodID 
    INNER JOIN [Order].[OrderCustomer] ON [Order].[Order].OrderID = [Order].[OrderCustomer].OrderID
	LEFT JOIN [Customers].[Managers] ON [Order].[Order].ManagerId = [Customers].[Managers].ManagerId
	LEFT JOIN [Customers].[Customer] ON [Customers].[Managers].CustomerId = [Customers].[Customer].CustomerID
    WHERE [Order].[OrderCustomer].CustomerID =@CustomerID ORDER BY [Order].[Order].OrderDate DESC
END

GO--


Update [Settings].[MailFormat] Set FormatText = replace(FormatText, 'line.gif', 'line.png') Where LOWER(RTRIM(LTRIM(FormatName))) = 'подарочный сертификат'
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
			 ORDER BY main DESC ,[Photo].[PhotoSortOrder])  
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
		WHERE offer.productid = [ProductExt].ProductId),  
      
    [MinPrice] = (SELECT min(price) FROM [Catalog].offer WHERE offer.productid = [ProductExt].ProductId),  
     
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
   WHERE offer.productid = @productId    
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
   WHERE offer.productid = @productId    
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

Update [settings].ModuleSettings set value = replace (value, '<a href=''#'' class=''popup-btn''', '<a href=''getbonuscard'' class=''popup-btn''') 

GO--

ALTER TABLE Catalog.ProductPropertyValue
	DROP COLUMN SortOrder

GO--	
DROP PROCEDURE [Catalog].[sp_AddProductPropertyValue]

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
  ,[Property].[SortOrder] as PropertySortOrder  
  ,[Property].[Expanded] as Expanded  
  ,[Property].[Type] as [Type]  
  ,[Property].GroupId as GroupId  
  ,GroupName  
  ,GroupSortorder  
 FROM [Catalog].[PropertyValue]  
 INNER JOIN [Catalog].[ProductPropertyValue] ON [ProductPropertyValue].[PropertyValueID] = [PropertyValue].[PropertyValueID]  
 inner join [Catalog].[Property] on [Property].[PropertyID] = [PropertyValue].[PropertyID]  
 left join Catalog.PropertyGroup on propertyGroup.PropertyGroupID = [Property].GroupID  
 WHERE [ProductID] = @ProductID  
 ORDER BY case when PropertyGroup.GroupSortOrder is null then 1 else 0 end, 
 PropertyGroup.GroupSortOrder,PropertyGroup.GroupName, [Property].[SortOrder], [Property].Name, [PropertyValue].[SortOrder], [PropertyValue].Value  
END

GO--
delete FROM [CMS].[StaticBlock] where [Key]='HomeLeftColumnsOne'
GO--

alter table catalog.product drop column AddManually
GO--


Delete From [Settings].[TemplateSettings] Where Name = 'CurrencyVisibility' or Name = 'EnableSocialShareButtons' or Name = 'ShowCopyright'
GO--

Insert Into [Settings].[Settings] ([Name],[Value]) Values ('SocialShareEnabled', 'True')
GO--

if (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'Module' AND  TABLE_NAME = 'AbandonedCartLetter') 
	And not exists(select * from sys.columns where Name = N'Email' and Object_ID = Object_ID(N'[Module].[AbandonedCartLetter]')))
begin
  ALTER TABLE [Module].[AbandonedCartLetter] ADD [Email] nvarchar(max) NULL
end
GO--

if ((Select Count(*) From [Settings].[MailFormat] Where FormatType = 12) > 0)
begin
	Update [Settings].[MailFormat] Set [FormatName] = 'Товар под заказ', [FormatText] = '<div style=''color: #4c4f56; font-family: Arial, Helvetica, sans-serif; font-size: 14px;''>          <div class=''header'' style=''border-bottom: 1px solid #ededed; display: table; margin-bottom: 25px; padding-bottom: 25px; width: 100%;''>              <div class=''logo'' style=''display: table-cell; text-align: left; vertical-align: middle;''>                  #LOGO#              </div>              <div class=''phone'' style=''display: table-cell; text-align: right; vertical-align: middle;''>                  <div class=''tel'' style=''font-size: 26px; font-weight: bold; line-height: 1; margin-bottom: 5px;''>                    </div>                  <div class=''inform'' style=''font-size: 12px;''>                    </div>              </div>          </div>            <div class=''data'' style=''display: table; width: 100%;''>              <div class=''data-row'' style=''display: table-row;''>                  <div class=''data-cell'' style=''display: table-cell; padding-right: 1%; width: 48%;''>                      <div class=''o-title vi'' style=''font-size: 14px; font-weight: bold; margin: 5px 0;''>Информация о заказе</div>                      <div class=''l-row''>                          <div class=''l-name vi cs-light'' style=''color: #acacac; display: inline-block; margin: 5px 0; padding-right: 15px; width: 120px;''>                              ID заказа:                          </div>                          <div class=''l-value vi'' style=''display: inline-block; margin: 5px 0;''>                              #ORDERID#                          </div>                      </div>                      <div class=''l-row''>                          <div class=''l-name vi cs-light'' style=''color: #acacac; display: inline-block; margin: 5px 0; padding-right: 15px; width: 120px; vertical-align: middle;''>                              Желаемый товар:                          </div>                          <div class=''l-value vi'' style=''display: inline-block; margin: 5px 0;''>                              #ARTNO# - #PRODUCTNAME#, #COLOR# #SIZE# #OPTIONS#                          </div>                      </div>                      <div class=''l-row''>                          <div class=''l-name vi cs-light'' style=''color: #acacac; display: inline-block; margin: 5px 0; padding-right: 15px; width: 120px; vertical-align: middle;''>                              Количество:                          </div>                          <div class=''l-value vi'' style=''display: inline-block; margin: 5px 0;''>                              #QUANTITY#                          </div>                      </div>                      <div class=''l-row''>                          <div class=''l-name vi cs-light'' style=''color: #acacac; display: inline-block; margin: 5px 0; padding-right: 15px; width: 120px; vertical-align: middle;''>                              Фамилия, имя заказчика:                          </div>                          <div class=''l-value vi'' style=''display: inline-block; margin: 5px 0;''>                              #USERNAME#                          </div>                      </div>                      <div class=''l-row''>                          <div class=''l-name vi cs-light'' style=''color: #acacac; display: inline-block; margin: 5px 0; padding-right: 15px; width: 120px; vertical-align: middle;''>                              Email:                          </div>                          <div class=''l-value vi'' style=''display: inline-block; margin: 5px 0;''>                              #EMAIL#                          </div>                      </div>                      <div class=''l-row''>                          <div class=''l-name vi cs-light'' style=''color: #acacac; display: inline-block; margin: 5px 0; padding-right: 15px; width: 120px; vertical-align: middle;''>                              Телефон:                          </div>                          <div class=''l-value vi'' style=''display: inline-block; margin: 5px 0;''>                              #PHONE#                          </div>                      </div>                      <div class=''l-row''>                          <div class=''l-name vi cs-light'' style=''color: #acacac; display: inline-block; margin: 5px 0; padding-right: 15px; width: 120px; vertical-align: middle;''>                              Комментарий:                          </div>                          <div class=''l-value vi'' style=''display: inline-block; margin: 5px 0;''>                              #COMMENT#                          </div>                      </div>                  </div>                            <br />                  </div>          </div>          <div class="comment" style="margin-top: 15px;">              Когда возможность исполнения заказа будет подтверждена менеджером, Вам придет сообщение со ссылкой на оформление заказа.          </div>      </div>', [ModifyDate] = 'Jun 18 2015 12:53PM' Where FormatType = 12 
end
GO--

if ((Select Count(*) From [Settings].[MailFormat] Where FormatType = 11) > 0)
begin
	Update [Settings].[MailFormat] Set [FormatName] = 'Уведомление о новом отзыве', [FormatText] = '<div style=''color: #4c4f56; font-family: Arial, Helvetica, sans-serif; font-size: 14px;''>          <div class=''header'' style=''border-bottom: 1px solid #ededed; display: table; margin-bottom: 25px; padding-bottom: 25px; width: 100%;''>              <div class=''logo'' style=''display: table-cell; text-align: left; vertical-align: middle;''>                  #LOGO#              </div>              <div class=''phone'' style=''display: table-cell; text-align: right; vertical-align: middle;''>                  <div class=''tel'' style=''font-size: 26px; font-weight: bold; line-height: 1; margin-bottom: 5px;''>                    </div>                  <div class=''inform'' style=''font-size: 12px;''>                    </div>              </div>          </div>            <p>              Пользователь #AUTHOR# #DATE# оставил&nbsp;отзыв о продукте &quot;#PRODUCTNAME#&quot; (Артикул: #SKU#)&nbsp;с текстом:<br />          </p>          <p>              #TEXT#          </p>          <p>          Для того чтобы удалить этот отзыв перейдите по ссылке #DELETELINK#.          </p>            <p>Для того чтобы перейти на страницу&nbsp;описания продукта перейдите по <a href="#PRODUCTLINK#" title="#PRODUCTNAME#">ссылке</a>.</p>        </div>', [ModifyDate] = 'Jun 18 2015  3:49PM' Where FormatType = 11
end
GO--

ALTER TABLE [Order].[Order] ADD
	BonusCardNumber bigint NULL
GO--


if (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'Module' AND  TABLE_NAME = 'BuyInTime')) 
begin
	IF NOT EXISTS(SELECT * FROM sys.columns WHERE [name] = N'ShowInMobile' AND [object_id] = OBJECT_ID(N'Module.BuyInTime'))
	BEGIN
		ALTER TABLE Module.BuyInTime ADD ShowInMobile bit NULL,	MobileActionText nvarchar(MAX) NULL
	END
end

GO--

Alter table [Catalog].[Currency] 
	Alter column RoundNumbers float null
GO--

Update Catalog.Currency Set RoundNumbers = 1
GO--

EXEC [Catalog].[PreCalcProductParamsMass]
GO--

ALTER PROCEDURE [Settings].[sp_GetExportFeedProducts] @exportFeedId int
	,@onlyCount BIT
	,@exportNotActive BIT
	,@exportNotAmount BIT
	,@selectedCurrency NVARCHAR(10)
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
						OR Product.AllowPreOrder = 1 OR @exportNotAmount = 1
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
			,[Offer].ArtNo
			,[Offer].Main
			,[Offer].ColorID
			,ColorName
			,[Offer].SizeID
			,SizeName
			,BrandName
			,GoogleProductCategory
			,YandexMarketCategory
			,Gtin
			,Adult
			,CurrencyValue
			,[Settings].PhotoToString(Offer.ColorID, Product.ProductId) AS Photos
			,ManufacturerWarranty
			,[Weight]
			,[Product].[Enabled]
			,[Offer].SupplyPrice
			,[Offer].ArtNo AS OfferArtNo

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
				OR Product.AllowPreOrder = 1
				OR @exportNotAmount = 1
				)
			AND CategoryEnabled = 1
			AND (Product.Enabled = 1 OR @exportNotActive = 1)
	END
END

GO--

Delete From  [Settings].[MailFormat] Where FormatType = 6

GO--

if ((Select Count(*) From [Settings].[Settings] Where [Name] = 'Telephony.CallBack.TimeInterval') = 0)
	INSERT INTO [Settings].[Settings] ([Name], [Value]) VALUES ('Telephony.CallBack.TimeInterval', '30')
GO--

ALTER TABLE Catalog.Product ADD
YandexTypePrefix nvarchar(500) NULL
GO--


ALTER PROCEDURE [Catalog].[sp_AddProduct]    
	@ArtNo nvarchar(50) = '',  
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
	@YandexTypePrefix nvarchar(500)
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
		   @YandexTypePrefix
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
	@ArtNo nvarchar(50),  
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
	@YandexTypePrefix nvarchar(500)
	
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
WHERE ProductID = @ProductID    
END  

GO--


ALTER PROCEDURE [Settings].[sp_GetExportFeedProducts] @exportFeedId int
	,@onlyCount BIT
	,@exportNotActive BIT
	,@exportNotAmount BIT
	,@selectedCurrency NVARCHAR(10)
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
						OR Product.AllowPreOrder = 1 OR @exportNotAmount = 1
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
			,[Offer].ArtNo
			,[Offer].Main
			,[Offer].ColorID
			,ColorName
			,[Offer].SizeID
			,SizeName
			,BrandName
			,GoogleProductCategory
			,YandexMarketCategory
			,YandexTypePrefix
			,Gtin
			,Adult
			,CurrencyValue
			,[Settings].PhotoToString(Offer.ColorID, Product.ProductId) AS Photos
			,ManufacturerWarranty
			,[Weight]
			,[Product].[Enabled]
			,[Offer].SupplyPrice
			,[Offer].ArtNo AS OfferArtNo

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
				OR Product.AllowPreOrder = 1
				OR @exportNotAmount = 1
				)
			AND CategoryEnabled = 1
			AND (Product.Enabled = 1 OR @exportNotActive = 1)
	END
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
   WHERE offer.productid = @productId    
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
   WHERE offer.productid = @productId    
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
		WHERE offer.productid = [ProductExt].ProductId),  
      
    [MinPrice] = (SELECT min(price) FROM [Catalog].offer WHERE offer.productid = [ProductExt].ProductId),  
     
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

Delete from Catalog.ShoppingCart

GO--



Alter TAble [Cms].Carousel
Add MainPageMode nvarchar(50) Null
GO--

Update [Cms].Carousel Set [MainPageMode]='Common'
GO--

Alter TAble [Cms].Carousel
Alter Column MainPageMode nvarchar(50) Not Null
GO--

ALTER PROCEDURE [CMS].[sp_UpdateCarousel]
	  @CarouselID int,	
      @URL nvarchar(max),
	  @SortOrder int,
	  @Enabled bit,
	  @MainPageMode nvarchar(50)
	  
AS
BEGIN
	UPDATE [CMS].[Carousel]
	SET [URL] = @URL, [SortOrder] = @SortOrder, Enabled = @Enabled, MainPageMode = @MainPageMode
	Where CarouselID=@CarouselID
END
GO--


ALTER PROCEDURE [CMS].[sp_InsertCarousel]
      @URL nvarchar(max),
	  @SortOrder int,
      @Enabled bit,
      @MainPageMode nvarchar(50)
AS
BEGIN
	INSERT INTO [CMS].[Carousel]
           ([URL]
           ,[SortOrder]
           ,Enabled
           ,MainPageMode
          )
     VALUES
		(
			@URL
           ,@SortOrder			  
           ,@Enabled
           ,@MainPageMode
		)
	 Select SCOPE_IDENTITY()
END
GO--


Delete From [Order].[ShippingCache]
GO--

Insert Into [Settings].[TemplateSettings] (Template, Name, Value) Values ('_default', 'CountMainPageProductInSection','3')
GO--

ALTER PROCEDURE [Settings].[sp_GetExportFeedProducts] @exportFeedId int
	,@onlyCount BIT
	,@exportNotActive BIT
	,@exportNotAmount BIT
	,@selectedCurrency NVARCHAR(10)
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
						OR Product.AllowPreOrder = 1 OR @exportNotAmount = 1
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
			,GoogleProductCategory
			,YandexMarketCategory
			,YandexTypePrefix
			,Gtin
			,Adult
			,CurrencyValue
			,[Settings].PhotoToString(Offer.ColorID, Product.ProductId) AS Photos
			,ManufacturerWarranty
			,[Weight]
			,[Product].[Enabled]
			,[Offer].SupplyPrice
			,[Offer].ArtNo AS OfferArtNo

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
				OR Product.AllowPreOrder = 1
				OR @exportNotAmount = 1
				)
			AND CategoryEnabled = 1
			AND (Product.Enabled = 1 OR @exportNotActive = 1)
	END
END
GO--



ALTER PROCEDURE [Catalog].[sp_UpdateOrInsertProductProperty]    
  @ProductID int,  
  @Name nvarchar(255),  
  @Value nvarchar(255),
  @RangeValue float,  
  @SortOrder int  
AS  
BEGIN  
 Declare @propertyId int;  
 Set @propertyId = 0;  
 Select @propertyId = PropertyID From Catalog.Property Where Name = @Name;  
 if( @propertyId = 0 )  
  begin  
   Insert into Catalog.Property (Name, UseInFilter, SortOrder, Expanded, [Type], [UseInDetails]) Values (@Name, 0, 0, 0, 0, 1)  
   Select @propertyId = PropertyID From Catalog.Property Where Name = @Name  
  end  
   
 declare @propertyValueId int;  
 Set @propertyValueId = 0;  
 Select @propertyValueId = PropertyValueID From Catalog.PropertyValue Where Value = @Value and RangeValue = @RangeValue and PropertyID = @propertyId;  
 if(@propertyValueId = 0)     
  begin  
   Insert into Catalog.PropertyValue (PropertyID, Value, RangeValue) Values (@propertyId, @Value, @RangeValue)  
   Select @propertyValueId = PropertyValueID From Catalog.PropertyValue Where PropertyID = @propertyId and Value = @Value and RangeValue = @RangeValue
  end  
        
 if((Select COUNT(ProductID) From Catalog.ProductPropertyValue Where ProductID = @ProductID and PropertyValueID = @propertyValueId) = 0 )  
  begin   
   Insert into Catalog.ProductPropertyValue (ProductID, PropertyValueID) Values (@ProductID, @propertyValueId)  
  end  
END  
GO--

DELETE FROM [Settings].[ModuleSettings] WHERE NAME='BuyInTimeDefaultActionTextMode1'
DELETE FROM [Settings].[ModuleSettings] WHERE NAME='BuyInTimeDefaultActionTextMode2'
DELETE FROM [Settings].[ModuleSettings] WHERE NAME='BuyInTimeDefaultMobileActionText'

DECLARE @tpl nvarchar(MAX)
SET @tpl = '<div class="buy-in-time-inner"><h3 class="buy-in-time-header">#ActionTitle#</h3><div class="buy-in-time-content"><div class="buy-in-time-countdown-block"><div class="buy-in-time-text">До конца распродажи:</div>#Countdown#</div><figure class="buy-in-time-picture-block"><img alt="#ProductName#" class="buy-in-time-picture" src="#ProductPictureSrc#" /><div class="buy-in-time-discount sticker-main"><div class="buy-in-time-discount-number">#DiscountPercent#%</div><div class="buy-in-time-discount-text">скидка</div></div></figure><div class="buy-in-time-price-block"><div class="buy-in-time-name"><a class="buy-in-time-name-link" href="#ProductLink#">#ProductName#</a></div><div class="buy-in-time-price-default">Цена: <span class="price"><span class="price-current"><span class="price-number">#OldPrice#</span><span class="price-currency">р.</span></span></span></div><div class="buy-in-time-price-today">Цена: <span class="price"><span class="price-current"><span class="price-number">#NewPrice#</span><span class="price-currency">р.</span></span></span></div><div class="buy-in-time-button-block"><a class="btn btn-small btn-action btn-buy-in-time" href="#ProductLink#">Экономия:#DiscountPrice# р.</a></div></div></div></div>'
IF (SELECT COUNT(*) FROM [Settings].[ModuleSettings] WHERE NAME = 'BuyInTimeDefaultActionText') > 0
	BEGIN
		UPDATE [Settings].[ModuleSettings]
		   SET [Value] = @tpl
		 WHERE NAME='BuyInTimeDefaultActionText'
	END
ELSE
	BEGIN
		INSERT INTO [Settings].[ModuleSettings]
			   ([Name]
			   ,[Value]
			   ,[ModuleName])
		 VALUES
			   ('BuyInTimeDefaultActionText'
			   ,@tpl
			   ,'BuyInTime')
	END

	IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'Module' AND  TABLE_NAME = 'BuyInTime'))
	BEGIN 
		UPDATE [Module].[BuyInTime] SET ActionText=@tpl, MobileActionText=@tpl
	END
GO--


Insert Into [Settings].[Settings] ([Name], [Value]) VALUES ('ShowClientId', 'True')
GO--

if ((Select Count(*) From [Settings].[Settings] Where [Name] = 'SettingsSEO.OpenGraphEnabled') = 0)
	INSERT INTO [Settings].[Settings] ([Name], [Value]) VALUES ('SettingsSEO.OpenGraphEnabled', 'True')
GO--

if ((Select Count(*) From [Settings].[ModuleSettings] Where [Name] = 'TextSmsNewOrder' AND [ModuleName] = 'SmsNotifications') <> 0)
	UPDATE [Settings].[ModuleSettings] SET [Value] = REPLACE([Value], '#ORDERID#', '#ORDERNUMBER#') 
		WHERE [Name] = 'TextSmsNewOrder' AND [ModuleName] = 'SmsNotifications'
GO--

if ((Select Count(*) From [Settings].[ModuleSettings] Where [Name] = 'TextSmsChangeStatus' AND [ModuleName] = 'SmsNotifications') <> 0)
	UPDATE [Settings].[ModuleSettings] SET [Value] = REPLACE([Value], '#ORDERID#', '#ORDERNUMBER#') 
		WHERE [Name] = 'TextSmsChangeStatus' AND [ModuleName] = 'SmsNotifications'
GO--

UPDATE [Settings].[InternalSettings] SET [settingValue] = '5.0.0' WHERE [settingKey] = 'db_version'
GO--