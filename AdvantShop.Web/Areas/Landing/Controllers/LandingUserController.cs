using System.Web.Mvc;
using System.Web.SessionState;
using AdvantShop.App.Landing.Models.Users;
using AdvantShop.Core.Services.Landing;
using AdvantShop.Customers;

namespace AdvantShop.App.Landing.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class LandingUserController : LandingBaseController
    {
        private readonly LpService _lpService = new LpService();

        private Lp GetLp(int id)
        {
            var lp = _lpService.Get(id);
            if (lp != null)
                LpService.CurrentLanding = lp;

            return lp;
        }
        
        public ActionResult Auth(int id)
        {
            if (GetLp(id) == null)
                return Error404();

            SetMetaInformation(T("Авторизация"));

            if (CustomerContext.CurrentCustomer.RegistredUser)
                return View("AuthNotAccess");

            var model = new AuthViewModel
            {
                From = _lpService.GetLpLinkRelative(id),
            };

            return View(model);
        }

        public ActionResult AuthNotAccess(int id)
        {
            var lp = GetLp(id);
            if (lp == null)
                return Error404();
            
            SetMetaInformation(T("Авторизация"));

            return View();
        }

        public ActionResult Redirect(int id)
        {
            var lp = _lpService.Get(id);
            if (lp != null)
            {
                var url = _lpService.GetLpLink(lp.Id);
                return Redirect(url);
            }

            return Error404();
        }
    }
}
