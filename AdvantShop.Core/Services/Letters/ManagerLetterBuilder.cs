using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Customers;

namespace AdvantShop.Letters
{
    public sealed class ManagerLetterBuilder : BaseLetterTemplateBuilder<Manager, ManagerLetterTemplateKey>
    {
        public ManagerLetterBuilder(Manager manager) : base(manager, null)
        {
        }

        protected override string GetValue(ManagerLetterTemplateKey key)
        {
            var manager = _entity;

            switch (key)
            {
                case ManagerLetterTemplateKey.Email: return manager.Email;
                case ManagerLetterTemplateKey.FirstName: return manager.FirstName;
                case ManagerLetterTemplateKey.LastName: return manager.LastName;
                case ManagerLetterTemplateKey.FullName: return manager.FullName;
                case ManagerLetterTemplateKey.Phone: return manager.StandardPhone.ToString();
                case ManagerLetterTemplateKey.Sign: return manager.Sign;
                default:
                    throw new ArgumentOutOfRangeException(nameof(key), key, null);
            }
        }

        public override List<LetterFormatKey> GetKeyDescriptions()
        {
            return BonusSystem.IsActive
                    ? LetterBuilderHelper.GetLetterFormatKeys<ManagerLetterTemplateKey>()
                    : LetterBuilderHelper.GetLetterFormatKeys(Enum.GetValues(typeof(ManagerLetterTemplateKey))
                    .Cast<ManagerLetterTemplateKey>()
                    .ToList());
        }
    }
}