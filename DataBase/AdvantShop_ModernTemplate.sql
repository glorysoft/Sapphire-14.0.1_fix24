update settings.settings set value = 'True' where name = 'StoreActive';
update settings.settings set value = 'Modern' where name = 'Template';

GO--

if not exists (Select 1
               From [dbo].[DownloadableContent]
               Where [StringId] = 'Modern')
    begin
        INSERT INTO [dbo].[DownloadableContent] ([StringId], [IsInstall], [DateAdded], [DateModified], [Active],
                                                 [Version], [DcType])
        VALUES ('Modern', 1, getdate(), getdate(), 1, 'В режиме отладки', 'template')
    end

GO--

IF EXISTS (SELECT SettingId
           FROM [Settings].[Settings]
           WHERE NAME = 'TemplateToApply')
    UPDATE [Settings].[Settings] SET Value = 'Modern' WHERE NAME = 'TemplateToApply'
ELSE
    INSERT INTO [Settings].[Settings] (NAME, Value) VALUES ('TemplateToApply', 'Modern')

GO--

IF EXISTS (SELECT *
           FROM [Settings].[TemplateSettings]
           WHERE Template = 'Modern' AND Name = 'FullWidthTemplate')
    UPDATE [Settings].[TemplateSettings] SET Value = 'True' WHERE Template = 'Modern' AND Name = 'FullWidthTemplate'
ELSE
    INSERT INTO [Settings].[TemplateSettings] (Template, Name, "Value") VALUES ('Modern', 'FullWidthTemplate', 'True')

IF EXISTS (SELECT *
           FROM [Settings].[TemplateSettings]
           WHERE Template = 'Modern' AND Name = 'SmallProductImageWidth')
    UPDATE [Settings].[TemplateSettings] SET Value = '335' WHERE Template = 'Modern' AND Name = 'SmallProductImageWidth'
ELSE
    INSERT INTO [Settings].[TemplateSettings] (Template, Name, "Value") VALUES ('Modern', 'SmallProductImageWidth', '335')

IF EXISTS (SELECT *
           FROM [Settings].[TemplateSettings]
           WHERE Template = 'Modern' AND Name = 'SmallProductImageHeight')
    UPDATE [Settings].[TemplateSettings] SET Value = '335' WHERE Template = 'Modern' AND Name = 'SmallProductImageHeight'
ELSE
    INSERT INTO [Settings].[TemplateSettings] (Template, Name, "Value") VALUES ('Modern', 'SmallProductImageHeight', '335')

GO--
