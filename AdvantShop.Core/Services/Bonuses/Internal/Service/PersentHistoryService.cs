using System;
using AdvantShop.Core.Services.Bonuses.Internal.Model;
using AdvantShop.Core.SQL;

namespace AdvantShop.Core.Services.Bonuses.Internal.Service
{
    public class PersentHistoryService
    {
        public static void Add(PersentHistory model)
        {
            SQLDataAccess2.ExecuteNonQuery("insert into Bonus.PersentHistory ([CardId],[GradeName],[BonusPersent],[CreateOn],[ByAction])" +
                                           " values (@CardId, @GradeName, @BonusPersent, @CreateOn, @ByAction );"
                , model);
        }

        public static void DeleteByCard(Guid cardId)
        {
            SQLDataAccess2.ExecuteNonQuery("Delete from Bonus.PersentHistory where CardId=@cardId", new { cardId = cardId });
        }
    }
}