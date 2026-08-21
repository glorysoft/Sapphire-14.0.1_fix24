using System;
using AdvantShop.Configuration;
using AdvantShop.Core;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Diagnostics;
using AdvantShop.Repository.Currencies;
using AdvantShop.Web.Admin.Models.Settings.Currencies;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Settings.Catalog
{
    public sealed class CurrencyInplaceHandler : AbstractCommandHandler
    {
        private readonly CurrencyModel _model;

        private Currency _currency;

        public CurrencyInplaceHandler(CurrencyModel model)
        {
            _model = model;
        }

        protected override void Load()
        {
            _currency = CurrencyService.GetCurrency(_model.CurrencyId);
        }

        protected override void Validate()
        {
            if (_currency == null)
                throw new BlException(
                    LocalizationService.GetResource("Admin.SettingsCatalog.CurrencyInplace.CurrencyNullError")
                );
        }

        protected override void Handle()
        {
            var isDefaultCurrency = false;

            if (SettingsCatalog.DefaultCurrencyIso3 == _currency.Iso3)
                isDefaultCurrency = true;

            _currency.Name = _model.Name;
            _currency.Rate = _model.Rate;
            _currency.EnablePriceRounding = _model.EnablePriceRounding;
            _currency.IsCodeBefore = _model.IsCodeBefore;
            _currency.Iso3 = _model.Iso3;
            _currency.NumIso3 = _model.NumIso3;
            _currency.RoundNumbers = _model.RoundNumbers;
            _currency.Symbol = _model.Symbol;

            try
            {
                CurrencyService.UpdateCurrency(_currency);
            }
            catch (BlException)
            {
                throw;
            }
            catch (Exception exception)
            {
                Debug.Log.Error(exception.Message, exception);
                throw new BlException(
                    LocalizationService.GetResource("Admin.SettingsCatalog.CurrencyInplace.InternalError")
                );
            }

            if (isDefaultCurrency)
                SettingsCatalog.DefaultCurrencyIso3 = _currency.Iso3;
        }
    }
}