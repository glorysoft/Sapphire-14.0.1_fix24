using System.Collections.Generic;

namespace AdvantShop.Models.User
{
    public sealed class InitPhoneConfirmationModel
    {
        public bool ShowCodeConfirmation { get; set; }
        public List<string> ModulesControllerNames { get; set; }   
    }
}