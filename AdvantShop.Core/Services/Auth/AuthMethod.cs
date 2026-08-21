namespace AdvantShop.Core.Services.Auth
{
    public class AuthMethod
    {
        public string Title { get; set; }
        public EAuthMethod Type { get; set; }
        public string ModuleId { get; set; }
        public int SortOrder { get; set; }

        public AuthMethod() { }

        public AuthMethod(EAuthMethod type, int sortOrder) : this()
        {
            Type = type;
            SortOrder = sortOrder;
        }

        public AuthMethod(EAuthMethod type, string moduleId, int sortOrder) : this(type, sortOrder)
        {
            ModuleId = moduleId;
        }
    }
}