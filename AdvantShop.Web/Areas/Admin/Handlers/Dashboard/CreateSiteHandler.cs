using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Landing.Templates;
using AdvantShop.Core.Services.SalesChannels;
using AdvantShop.Customers;
using AdvantShop.Saas;
using AdvantShop.Web.Admin.Models.Dashboard;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Dashboard
{
    public class CreateSiteHandler : ICommandHandler<CreateSiteModel>
    {
        private readonly string _mode;

        private readonly Customer _currentCustomer = CustomerContext.CurrentCustomer;

        private CreateSiteModel _model;

        public CreateSiteHandler(string mode)
        {
            _mode = mode;
        }

        public CreateSiteModel Execute()
        {
            CreateModel();

            switch (_mode)
            {
                case "store":
                    AddStore();
                    break;
                default:
                    var store = SalesChannelService.GetByType(ESalesChannelType.Store);
                    if (!store.Enabled && (!SaasDataService.IsSaasEnabled
                                           || !SaasDataService.CurrentSaasData.DisableStore))
                        AddStore();
                    AddFunnels();
                    break;
            }

            return _model;
        }

        private void CreateModel() =>
            _model = new CreateSiteModel
            {
                Mode = _mode,
                Categories = new List<CreateSiteCategory>(),
            };

        private void AddStore()
        {
            if (!_currentCustomer.HasRoleAction(RoleAction.Store)) return;
            
            _model.Categories.Add(
                new CreateSiteCategory
                {
                    Name = LpSiteCategory.Store.Localize(),
                    Type = LpSiteCategory.Store
                });
        }

        private void AddFunnels()
        {
            if (!_currentCustomer.HasRoleAction(RoleAction.Landing)) return;

            if (!(new LpTemplateService().GetTemplates().Count > 10))
            {
                _model.Categories.Add(new CreateSiteCategory
                {
                    Name = LpSiteCategory.AllFunnels.Localize(),
                    Type = LpSiteCategory.AllFunnels
                });
                
                return;
            }

            foreach (LpSiteCategory category in Enum.GetValues(typeof(LpSiteCategory)))
            {
                if (category == LpSiteCategory.Store || category == LpSiteCategory.AllFunnels)
                    continue;

                _model.Categories.Add(new CreateSiteCategory
                {
                    Name = category.Localize(),
                    Type = category
                });
            }
        }
    }
}