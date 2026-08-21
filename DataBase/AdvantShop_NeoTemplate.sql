update settings.settings set value = 'True' where name = 'StoreActive';
update settings.settings set value = 'Neo' where name = 'Template';

GO--

if not exists (Select 1
               From [dbo].[DownloadableContent]
               Where [StringId] = 'Neo')
    begin
        INSERT INTO [dbo].[DownloadableContent] ([StringId], [IsInstall], [DateAdded], [DateModified], [Active],
                                                 [Version], [DcType])
        VALUES ('Neo', 1, getdate(), getdate(), 1, 'В режиме отладки', 'template')
    end

GO--

IF EXISTS (SELECT SettingId
           FROM [Settings].[Settings]
           WHERE NAME = 'TemplateToApply')
    UPDATE [Settings].[Settings] SET Value = 'Neo' WHERE NAME = 'TemplateToApply'
ELSE
    INSERT INTO [Settings].[Settings] (NAME, Value) VALUES ('TemplateToApply', 'Neo')

GO--

exec [Settings].[sp_UpdateSettings] @Name=N'Features.EnableExperimentalFeatures',@Value=N'True'
exec [Settings].[sp_UpdateSettings] @Name=N'Features.EnableAdvancedCarouselSettings',@Value=N'True'

GO--
