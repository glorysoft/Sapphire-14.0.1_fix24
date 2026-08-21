using AdvantShop.Core.Services.Crm.Facebook;
using AdvantShop.Core.Services.Crm.Vk;

namespace AdvantShop.Web.Admin.Models.Booking.Journal
{
    public class BookingCustomerSocial
    {
        public BookingCustomerSocial()
        {
            ShowVk = VkApiService.IsVkActive();
            ShowFacebook = new FacebookApiService().IsActive();
        }

        public VkUser VkUser { get; set; }
        public FacebookUser FacebookUser { get; set; }

        public bool ShowVk { get; private set; }
        public bool ShowFacebook { get; private set; }
    }
}
