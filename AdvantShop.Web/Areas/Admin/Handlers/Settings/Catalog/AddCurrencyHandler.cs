using System;
using AdvantShop.Core;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.Repository.Currencies;
using AdvantShop.Web.Admin.Models.Settings.Currencies;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.Catalog
{
    public sealed class AddCurrencyHandler : AbstractCommandHandler
    {
        private readonly CurrencyModel _model;

        public AddCurrencyHandler(CurrencyModel model)
        {
            _model = model;
        }

        protected override void Handle()
        {
            try
            {
                CurrencyService.InsertCurrency(_model);
            }
            catch (BlException)
            {
                throw;
            }
            catch (Exception exception)
            {
                Debug.Log.Error(exception.Message, exception);
                throw new BlException(
                    LocalizationService.GetResource("Admin.SettingsCatalog.AddCurrency.InternalError")
                );
            }
        }
    }
}