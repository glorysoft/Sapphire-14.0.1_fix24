using System.Data;
using System.Data.SqlClient;
using AdvantShop.Catalog;
using AdvantShop.Configuration;
using AdvantShop.Core.Caching;
using AdvantShop.Core.SQL;
using AdvantShop.SEO;
using AdvantShop.Core.Common.Extensions;

namespace AdvantShop.Handlers.Inplace
{
    public class InplaceMetaHandler
    {
        public bool Execute(int id, string name, bool hasNameField, MetaType metaType, string title, string h1, string metaKeywords,
            string metaDescription, bool useDefaultMeta)
        {
            if (metaType == MetaType.BonusProgram)
                return UpdateMetaBonusCard(title, metaKeywords, metaDescription, h1);
            
            MetaInfo metaInfo;

            if (useDefaultMeta)
            {
                metaInfo = new MetaInfo(0, id, metaType, null, null, null, null);
            }
            else
            {
                if (MetaInfoService.IsMetaExist(id, metaType))
                {
                    metaInfo = MetaInfoService.GetMetaInfo(id, metaType);
                    metaInfo = new MetaInfo(metaInfo.MetaId, metaInfo.ObjId, metaType, title, metaKeywords, metaDescription, h1);
                }
                else
                {
                    metaInfo = new MetaInfo(0, id, metaType, title, metaKeywords, metaDescription, h1);
                }
            }

            if (hasNameField)
            {
                var query = string.Empty;

                switch (metaInfo.Type)
                {
                    case MetaType.Brand:
                        query = "UPDATE Catalog.Brand SET BrandName=@name Where BrandID=@objId";
                        break;
                    case MetaType.Category:
                        query = "UPDATE [Catalog].[Category] SET [Name] = @name WHERE CategoryID = @objId";
                        break;
                    case MetaType.News:
                        query = "UPDATE [Settings].[News] SET [Title] = @name WHERE NewsID = @objId";
                        break;
                    case MetaType.Product:
                        query = "UPDATE [Catalog].[Product] SET [Name] = @name WHERE [ProductID] = @objId";
                        break;
                    case MetaType.Tag:
                        query = "UPDATE [Catalog].[Tag] SET [Name] = @name WHERE [Id] = @objId";
                        break;
                    case MetaType.StaticPage:
                        query = "UPDATE [CMS].[StaticPage] SET [PageName] = @name WHERE [StaticPageID] = @objId";
                        break;
                    case MetaType.MainPageProducts:
                        query = "UPDATE [Catalog].[ProductList] SET [Name] = @name WHERE [Id] = @objId";
                        break;
                }

                SQLDataAccess.ExecuteNonQuery(query, CommandType.Text, new SqlParameter("@name", name),
                    new SqlParameter("@objId", metaInfo.ObjId));
            }

            if (MetaType.Category == metaInfo.Type)
            {
                CategoryService.ClearCategoryCache();
            }

            if (metaInfo.IsNotEmpty())
                MetaInfoService.SetMeta(metaInfo);
            else
            {
                if (MetaInfoService.IsMetaExist(metaInfo.ObjId, metaInfo.Type))
                    MetaInfoService.DeleteMetaInfo(metaInfo.ObjId, metaInfo.Type);
            }

            return true;
        }

        private bool UpdateMetaBonusCard(string title, string metaKeywords, string metaDescription, string h1)
        {
            SettingsSEO.BonusProgramMetaTitle = title.IsNullOrEmpty() ? "Бонусная программа" : title;
            SettingsSEO.BonusProgramMetaKeywords = metaKeywords;
            SettingsSEO.BonusProgramMetaDescription = metaDescription;
            SettingsSEO.BonusProgramMetaH1 = h1.IsNullOrEmpty() ? "Бонусная программа" : h1;
            
            CacheManager.RemoveByPattern(CacheNames.MetaInfo);
            
            return true;
        }
    }
}