if ((Select Count(*) From [Settings].[Settings] Where [Name] = 'NewsMainTitle') = 0)
	INSERT INTO [Settings].[Settings] ([Name], [Value]) VALUES ('NewsMainTitle', 'Новости - #STORE_NAME#')
GO--

if ((Select Count(*) From [Settings].[Settings] Where [Name] = 'MainMetaDescription') = 0)
	INSERT INTO [Settings].[Settings] ([Name], [Value]) VALUES ('MainMetaDescription', 'Новости - #STORE_NAME#')
GO--

if ((Select Count(*) From [Settings].[Settings] Where [Name] = 'MainMetaKeywords') = 0)
	INSERT INTO [Settings].[Settings] ([Name], [Value]) VALUES ('MainMetaKeywords', 'Новости - #STORE_NAME#')
GO--

if ((Select Count(*) From [Settings].[Settings] Where [Name] = 'NewsMainH1') = 0)
	INSERT INTO [Settings].[Settings] ([Name], [Value]) VALUES ('NewsMainH1', 'Новости')
GO--