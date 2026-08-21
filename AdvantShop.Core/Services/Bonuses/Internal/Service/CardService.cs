using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Bonuses.Internal.Model;
using AdvantShop.Core.SQL;
using AdvantShop.Customers;
using System.Data.SqlClient;
using AdvantShop.Core.Services.Bonuses.Internal.Model.Enums;
using AdvantShop.Core.Services.Bonuses.Internal.Model.Rules;
using AdvantShop.Core.Modules;

namespace AdvantShop.Core.Services.Bonuses.Internal.Service
{
    public class CardService
    {
        public static List<Model.Card> Gets()
        {
            return SQLDataAccess2.ExecuteReadIEnumerable<Model.Card>("Select * from Bonus.Card").ToList();
        }

        public static Model.Card Get(Guid id)
        {
            Model.Card card;
            var cacheKey = CacheNames.BonusCard + id;

            if (!CacheManager.TryGetValue(cacheKey, out card))
            {
                card = SQLDataAccess2.Query<Model.Card>("Select * from Bonus.Card where CardId=@id", new { id = id });
                CacheManager.Insert(cacheKey, card ?? new Model.Card(), 2);
            }

            return card != null && card.CardNumber != 0 ? card : null;
        }

        public static Model.Card Get(long cardNumber)
        {
            return SQLDataAccess2.Query<Model.Card>("Select * from Bonus.Card where CardNumber=@id", new { id = cardNumber });
        }

        public static long Add(Model.Card model, bool updateModules = true)
        {
            SQLDataAccess2.ExecuteNonQuery("insert into Bonus.Card (CardId,CardNumber,Blocked,GradeId,CreateOn,ManualGrade)" +
                                                         " values (@CardId, @CardNumber, @Blocked, @GradeId,@CreateOn,@ManualGrade)", model);


            CacheManager.RemoveByPattern(CacheNames.BonusCard + model.CardId);
            
            new NewCardRule().Execute(model.CardId);
            
            var newgrade = GradeService.Get(model.GradeId);
            var bonusHistory = new PersentHistory
            {
                GradeName = newgrade.Name,
                BonusPersent = newgrade.BonusPercent,
                CardId = model.CardId,
                CreateOn = DateTime.Now,
                ByAction = EHistoryAction.HandChangeUI
            };
            PersentHistoryService.Add(bonusHistory);
            
            if (updateModules)
                ModulesExecuter.BonusCardAdded(model);
            
            return model.CardNumber;
        }

        public static void Update(Model.Card model, bool updateModules = true)
        {
            SQLDataAccess2.ExecuteNonQuery("Update Bonus.Card set CardNumber=@CardNumber,Blocked=@Blocked,GradeId=@GradeId,ManualGrade=@ManualGrade  where CardId=@CardId", model);

            if (updateModules)
                ModulesExecuter.BonusCardUpdated(model);

            CacheManager.RemoveByPattern(CacheNames.BonusCard + model.CardId);
        }

        public static void AddHistory(PersentHistory model)
        {
            SQLDataAccess2.ExecuteNonQuery("Insert into Bonus.PersentHistory (CardId,GradeName,BonusPersent,CreatOn,ByAction)" +
                                           " values (@CardId,@GradeName,@BonusPersent,@CreatOn,@ByAction);select cast(scope_identity() as int)", model);
        }

        public static List<PersentHistory> GetHistory(Guid cardId)
        {
            return SQLDataAccess2.ExecuteReadIEnumerable<PersentHistory>("Select * from Bonus.Card where CardId=@id", new { id = cardId }).ToList();
        }
        public static Model.Card GetByPhone(string phone)
        {
            var temp = phone.TryParseLong();
            return
                SQLDataAccess2.Query<Model.Card>(
                    "Select card.* From Bonus.Card card Inner Join Customers.Customer cus on card.CardId=cus.CustomerId Where cus.Phone = @phone",
                    new { phone = temp });
        }
        
        public static void Delete(Guid cardId)
        {
            TransactionService.DeleteByCard(cardId);
            BonusService.DeleteByCard(cardId);
            PersentHistoryService.DeleteByCard(cardId);
            PurchaseService.DeleteByCard(cardId);
            ModulesExecuter.BonusCardDeleted(cardId);
            SQLDataAccess2.ExecuteNonQuery("delete from [Bonus].[Card] where CardId=@id", new { id = cardId });

            CacheManager.RemoveByPattern(CacheNames.BonusCard + cardId);
        }

        public static List<CardExportModel> GetExportCards()
        {
            string sql =
                "Select [Card].cardid,[Card].CardNumber,[customer].phone,[customer].email,[customer].FirstName,[customer].LastName,[customer].LastName,[customer].Patronymic,[customer].BirthDay,[grade].name as GradeName," +
                "SUM(CASE WHEN ([Bonuses].EndDate is null or [Bonuses].EndDate>=GETDATE()) and ([Bonuses].StartDate is null or [Bonuses].StartDate<=GETDATE()) and [Bonuses].Amount > 0 and [Bonuses].[Status] <> 1 THEN [Bonuses].Amount ELSE 0 END) as BonusAmount " +
                "from[bonus].[Card] left join [bonus].Bonuses on [Card].CardId = Bonuses.CardId inner join[customers].customer on[card].cardid = customer.customerid inner join[bonus].grade on[card].gradeid = [grade].id " +
                "group by[Card].cardid,[Card].CardNumber,[customer].phone,[customer].email,[customer].FirstName,[customer].LastName,[customer].LastName,[customer].Patronymic,[customer].BirthDay,[grade].name";
            return SQLDataAccess2.ExecuteReadIEnumerable<CardExportModel>(sql).ToList();
        }
    }
}