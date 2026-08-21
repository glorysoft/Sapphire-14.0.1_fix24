using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.DownloadableContent;
using AdvantShop.Core.Services.Landing;
using AdvantShop.Core.Services.SalesChannels;
using AdvantShop.Core.Services.Screenshot;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.ViewModels.Home;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Home
{
    public class GetDashboardHandler : ICommandHandler<DashboardViewModel>
    {
        private readonly DashboardViewModel _model = new DashboardViewModel
        {
            ActionText = ShopActionsService.GetLast()
        };

        private readonly string _mainSiteUrl = SettingsMain.SiteUrl.ToLower();
        private readonly Customer _currentCustomer = CustomerContext.CurrentCustomer;
        
        public DashboardViewModel Execute()
        {
            if (_currentCustomer.HasRoleAction(RoleAction.Store))
                AddStore();
            if (_currentCustomer.HasRoleAction(RoleAction.Landing))
                AddFunnels();

            return _model;
        }
        
        private void AddStore()
        {
            var channel = SalesChannelService.GetByType(ESalesChannelType.Store);
            if (channel == null || !channel.Enabled) return;
            
            var url = UrlService.GetUrl().ToLower().TrimEnd('/');
            var domain = SettingsMain.SiteUrl.TrimEnd('/');
            
            if (SettingsMain.IsTechDomainsReady)
            {
                var mainUrlDomain = domain.Replace("http://", "").Replace("https://", "");
                var isDomainBusyByFunnel = new LpSiteService()
                    .GetList()
                    .Any(lpSite => lpSite.DomainUrl == mainUrlDomain);
                
                if (isDomainBusyByFunnel)
                {
                    domain = SettingsMain.TechDomainStore.TrimEnd('/');
                    url = UrlService.GetUrlForAuthFromAdmin(SettingsMain.TechDomainStore);
                }
                else
                {
                    url = UrlService.GetUrlForAuthFromAdmin(_mainSiteUrl);
                }
            }
            
            _model.Sites.Add(new DashboardSiteItem
            {
                Id = -1,
                Name = SettingsMain.ShopName,
                Type = DashboardSiteItemType.Store,
                Domain = domain, // как определить урл магазина?
                PreviewIframeUrl = domain,

                EditUrl = SettingsDesign.IsMobileTemplate ? "design/index?showCommon=true" : "design",
                ViewUrl = url,
                ScreenShot = SettingsMain.StoreScreenShot,

                Published = true,
                IsMainSite = domain == _mainSiteUrl,

                ChangeDomainUrl = "service/domainsmanage"
            });
        }

        private void AddFunnels()
        {
            var channel = SalesChannelService.GetByType(ESalesChannelType.Funnel);
            if (channel == null || !channel.Enabled) return;
            
            var funnels = new LpSiteService().GetList();

            foreach (var funnel in funnels)
            {
                var url = !string.IsNullOrEmpty(funnel.DomainUrl)
                    ? "http://" + funnel.DomainUrl
                    : LpService.GetTechUrl(funnel.Url, "", true);

                _model.Sites.Add(new DashboardSiteItem()
                {
                    Id = funnel.Id,
                    Name = funnel.Name,
                    Type = DashboardSiteItemType.Funnel,
                    Domain = !string.IsNullOrEmpty(funnel.DomainUrl) ? "http://" + funnel.DomainUrl : null,
                    PreviewIframeUrl = url + "?previewInAdmin=true",

                    EditUrl = "funnels/site/" + funnel.Id,
                    ViewUrl = url,
                    ScreenShot = funnel.ScreenShot,

                    Published = funnel.Enabled,
                    IsMainSite = url == _mainSiteUrl,

                    ChangeDomainUrl = "funnels/site/" + funnel.Id + "?landingAdminTab=settings&landingSettingsTab=domains"
                });
            }
            
            Task.Run(() => UpdateFunnelsScreenshot(funnels));
        }

        private void UpdateFunnelsScreenshot(List<LpSite> funnels)
        {
            var screenShotService = new ScreenshotService();
            
            foreach (var funnel in funnels)
            {
                if (funnel.ScreenShotDate == null || funnel.ModifiedDate == null ||
                    funnel.ScreenShotDate < funnel.ModifiedDate)
                {
                    screenShotService.UpdateFunnelScreenShotInBackground(funnel);
                }
                Thread.Sleep(300);
            }
        }
    }
}
