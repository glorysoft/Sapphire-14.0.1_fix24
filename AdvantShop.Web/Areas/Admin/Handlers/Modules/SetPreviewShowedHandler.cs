using System.Web;
using System.Web.Mvc;
using AdvantShop.Core;
using AdvantShop.Core.Modules;
using AdvantShop.Web.Infrastructure.Extensions;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Modules
{
    public class SetPreviewShowedHandler : ICommandHandler<string>
    {
        private readonly string _stringId;
        private readonly UrlHelper _urlHelper;

        public SetPreviewShowedHandler(string stringId)
        {
            _stringId = stringId;
            _urlHelper = new UrlHelper(HttpContext.Current.Request.RequestContext);
        }

        public string Execute()
        {
            if (string.IsNullOrWhiteSpace(_stringId))
                throw new BlException("Params must not be empty");

            ModulesRepository.SetPreviewShowed(_stringId, true);
            return _urlHelper.AbsoluteActionUrl("Details", "Modules", new { id = _stringId });
        }
    }
}