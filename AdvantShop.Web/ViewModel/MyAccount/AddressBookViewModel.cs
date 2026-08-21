using System.Collections.Generic;
using System.Web.Mvc;

namespace AdvantShop.ViewModel.MyAccount
{
    public class AddressBookViewModel
    {
        public List<SelectListItem> Countries { get; set; }
        public bool ShowMapAddress { get; set; }
        public bool IsForbiddenAsChangingAddressBook { get; set; }
    }
}