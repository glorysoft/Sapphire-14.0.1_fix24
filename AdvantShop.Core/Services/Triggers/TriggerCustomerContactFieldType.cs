using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Core.Services.Triggers
{
    public enum ETriggerCustomerContactFieldType : short
    {
        None = 0,
        
        [Localize("Core.Crm.ETriggerCustomerContactFieldType.Country")]
        Country = 1,
        
        [Localize("Core.Crm.ETriggerCustomerContactFieldType.Region")]
        Region = 2,
        
        [Localize("Core.Crm.ETriggerCustomerContactFieldType.City")]
        City = 3
    }
    
    public sealed class TriggerCustomerContactFieldType
    {
        public ETriggerCustomerContactFieldType Type { get; }
    
        private TriggerCustomerContactFieldType(ETriggerCustomerContactFieldType type)
        {
            Type = type;
        }
        
        public static TriggerCustomerContactFieldType Create<TEnum>(TEnum type)
        {
            switch (type.ToString())
            {
                case "Country": return new TriggerCustomerContactFieldType(ETriggerCustomerContactFieldType.Country);
                case "Region": return new TriggerCustomerContactFieldType(ETriggerCustomerContactFieldType.Region);
                case "City": return new TriggerCustomerContactFieldType(ETriggerCustomerContactFieldType.City);
                default: return new TriggerCustomerContactFieldType(ETriggerCustomerContactFieldType.None);
            }
        }
    }
}