namespace AdvantShop.Web.Admin.Models.Settings.Users
{
    public class UserRoleActionModel
    {        
        public string Key { get; set; }
        public string Name { get; set; }
        public bool Enabled { get; set; }
        public string Parent { get; set; }
        
        public string AccessSettingsGroup { get; set; }
    }
}
