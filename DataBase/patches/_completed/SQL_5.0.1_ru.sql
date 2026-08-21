if ((Select Count(*) From [Settings].[Settings] Where [Name] = 'CallBack.WorkTimeText') = 0)
	INSERT INTO [Settings].[Settings] ([Name], [Value]) VALUES ('CallBack.WorkTimeText', 'В ближайшие #SECONDS# c Вами свяжется менеджер.')
else if ((Select [Value] From [Settings].[Settings] Where [Name] = 'CallBack.WorkTimeText') = '')
	UPDATE [Settings].[Settings] SET [Value] = 'В ближайшие #SECONDS# c Вами свяжется менеджер.' WHERE [Name] = 'CallBack.WorkTimeText'
GO--

if ((Select Count(*) From [Settings].[Settings] Where [Name] = 'CallBack.NotWorkTimeText') = 0)
	INSERT INTO [Settings].[Settings] ([Name], [Value]) VALUES ('CallBack.NotWorkTimeText', 'Ваша заявка принята. Мы Вам перезвоним в рабочее время.')
else if ((Select [Value] From [Settings].[Settings] Where [Name] = 'CallBack.NotWorkTimeText') = '')
	UPDATE [Settings].[Settings] SET [Value] = 'Ваша заявка принята. Мы Вам перезвоним в рабочее время.' WHERE [Name] = 'CallBack.NotWorkTimeText'
GO--


