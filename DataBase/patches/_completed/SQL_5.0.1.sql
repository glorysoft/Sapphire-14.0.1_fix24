
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('productlist.aspx?type=new','productlist/new', null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('productlist.aspx?type=bestseller','productlist/best', null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('productlist.aspx?type=discount','productlist/sale', null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('giftcertificate.aspx','giftcertificate', null)
insert into Settings.Redirect (RedirectFrom,RedirectTo,ProductArtNo) values('orderconfirmation.aspx','checkout', null)

update Settings.Redirect set RedirectFrom ='forgotpassword.aspx' where  RedirectFrom ='forgotPassword.aspx'
update Settings.Redirect set RedirectFrom ='fogotpassword.aspx' where  RedirectFrom ='fogotPassword.aspx'

GO--

CREATE TABLE [Settings].[Error404](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Url] [nvarchar](1000) NOT NULL,
	[UrlReferer] [nvarchar](1000) NOT NULL,
 CONSTRAINT [PK_Error404] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO--

CREATE UNIQUE NONCLUSTERED INDEX [IX_Error404_Url_UrlReferer] ON [Settings].[Error404]
(
	[Url] ASC,
	[UrlReferer] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO--


ALTER TABLE CMS.Carousel ADD
	DisplayInOneColumn bit NULL,
	DisplayInTwoColumns bit NULL,
	DisplayInMobile bit NULL
GO--

update CMS.Carousel set DisplayInOneColumn=0, DisplayInTwoColumns=0, DisplayInMobile = 0

update CMS.Carousel set DisplayInOneColumn=1 where MainPageMode='Common' or MainPageMode='Default'
update CMS.Carousel set DisplayInTwoColumns=1 where MainPageMode='Common' or MainPageMode='TwoColumns'
update CMS.Carousel set DisplayInMobile=1 where MainPageMode='Common' or MainPageMode='DisplayInMobile'

GO--

alter table CMS.Carousel alter column DisplayInOneColumn bit not null
alter table CMS.Carousel alter column DisplayInTwoColumns bit not null
alter table CMS.Carousel alter column DisplayInMobile bit not null

GO--

alter table CMS.Carousel drop column MainPageMode

GO--

ALTER PROCEDURE [CMS].[sp_UpdateCarousel]
	  @CarouselID int,	
      @URL nvarchar(max),
	  @SortOrder int,
	  @Enabled bit,
	  @DisplayInOneColumn bit,
	  @DisplayInTwoColumns bit,
	  @DisplayInMobile bit
	  
AS
BEGIN
	UPDATE [CMS].[Carousel]
	SET [URL] = @URL, [SortOrder] = @SortOrder, Enabled = @Enabled,
	DisplayInOneColumn = @DisplayInOneColumn, DisplayInTwoColumns = @DisplayInTwoColumns, DisplayInMobile = @DisplayInMobile
	Where CarouselID=@CarouselID
END

GO--


ALTER PROCEDURE [CMS].[sp_InsertCarousel]
      @URL nvarchar(max),
	  @SortOrder int,
      @Enabled bit,
      @DisplayInOneColumn bit,
	  @DisplayInTwoColumns bit,
	  @DisplayInMobile bit
AS
BEGIN
	INSERT INTO [CMS].[Carousel]
           ([URL]
           ,[SortOrder]
           ,Enabled
		   ,DisplayInOneColumn
		   ,DisplayInTwoColumns
	       ,DisplayInMobile
          )
     VALUES
		(
			@URL
           ,@SortOrder			  
           ,@Enabled
           ,@DisplayInOneColumn
		   ,@DisplayInTwoColumns
	       ,@DisplayInMobile
		)
	 Select SCOPE_IDENTITY()
END

GO--

update [CMS].[Menu] set MenuItemIcon = null where MenuItemIcon='368974.ico'

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


if ((Select Count(*) From [Settings].[Settings] Where [Name] = 'Telephony.CallBack.TimeInterval') = 0)
	INSERT INTO [Settings].[Settings] ([Name], [Value]) VALUES ('Telephony.CallBack.TimeIntervalt', '30')
else if ((Select [Value] From [Settings].[Settings] Where [Name] = 'Telephony.CallBack.TimeInterval') = '0')
	UPDATE [Settings].[Settings] SET [Value] = '30' WHERE [Name] = 'Telephony.CallBack.TimeInterval'
GO--

if ((Select [Value] From [Settings].[Settings] Where [Name] = 'Telephony.CallBack.WorkSchedule') = '{"Sunday":{"Enabled":false,"From":"00:00:00","To":"00:00:00"},"Monday":{"Enabled":false,"From":"00:00:00","To":"00:00:00"},"Tuesday":{"Enabled":false,"From":"00:00:00","To":"00:00:00"},"Wednesday":{"Enabled":false,"From":"00:00:00","To":"00:00:00"},"Thursday":{"Enabled":false,"From":"00:00:00","To":"00:00:00"},"Friday":{"Enabled":false,"From":"00:00:00","To":"00:00:00"},"Saturday":{"Enabled":false,"From":"00:00:00","To":"00:00:00"}}')
	UPDATE [Settings].[Settings] SET [Value] = '' WHERE [Name] = 'Telephony.CallBack.WorkSchedule'
GO--

CREATE TABLE [CMS].[NewsProduct](
	[NewsId] [int] NOT NULL,
	[ProductId] [int] NOT NULL,
 CONSTRAINT [PK_NewsProduct] PRIMARY KEY CLUSTERED 
(
	[NewsId] ASC,
	[ProductId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO--

ALTER TABLE [CMS].[NewsProduct]  WITH CHECK ADD  CONSTRAINT [FK_NewsProduct_News] FOREIGN KEY([NewsId])
REFERENCES [Settings].[News] ([NewsID])
ON DELETE CASCADE
GO--

ALTER TABLE [CMS].[NewsProduct]  WITH CHECK ADD  CONSTRAINT [FK_NewsProduct_Product] FOREIGN KEY([ProductId])
REFERENCES [Catalog].[Product] ([ProductId])
ON DELETE CASCADE
GO--

ALTER PROCEDURE [Catalog].[sp_GetPropertyValueByID] @PropertyValueId INT
AS
BEGIN
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
		,GroupSortOrder
	FROM [Catalog].[PropertyValue]
	INNER JOIN [Catalog].[Property] ON [Property].[PropertyID] = [PropertyValue].[PropertyID]
	LEFT JOIN [Catalog].PropertyGroup ON PropertyGroup.PropertyGroupID = [Property].GroupID
	WHERE [PropertyValue].[PropertyValueID] = @PropertyValueId
END
GO--

CREATE TABLE [dbo].[DownloadableContent](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[StringId] [nvarchar](150) NOT NULL,
	[IsInstall] [bit] NOT NULL,
	[DateAdded] [datetime] NOT NULL,
	[DateModified] [datetime] NOT NULL,
	[Active] [bit] NOT NULL,
	[Version] [nvarchar](20) NOT NULL,
	[DcType] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_DownloadableContent] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO--


UPDATE [Settings].[InternalSettings] SET [settingValue] = '5.0.1' WHERE [settingKey] = 'db_version'
GO--

