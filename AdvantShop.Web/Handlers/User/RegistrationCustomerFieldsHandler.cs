using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Modules;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Customers;
using AdvantShop.ViewModel.Common;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Handlers.User
{
    public sealed class RegistrationCustomerFieldsHandler : ICommandHandler<CustomerFieldsViewModel>
    {
        private readonly string _ngModelName;
        private readonly string _cssParamName;
        private readonly string _cssParamValue;
        private readonly bool _checkFields;
        private readonly string _ngVariableVisible;

        private List<CustomerFieldWithValue> _customerFields;
        private ISuggestions _suggestions;

        public RegistrationCustomerFieldsHandler(
            string ngModelName,
            string cssParamName,
            string cssParamValue,
            bool checkFields,
            string ngVariableVisible
        )
        {
            _ngModelName = ngModelName;
            _cssParamName = cssParamName;
            _cssParamValue = cssParamValue;
            _checkFields = checkFields;
            _ngVariableVisible = ngVariableVisible;
        }

        public CustomerFieldsViewModel Execute()
        {
            Load();
            return new CustomerFieldsViewModel
            (
                customerFields: _customerFields,
                ngModelName: _ngModelName,
                cssParamName: _cssParamName,
                cssParamValue: _cssParamValue,
                checkFields: _checkFields,
                ngVariableVisible: _ngVariableVisible,
                suggestions: _suggestions
            );
        }

        private void Load()
        {
            _customerFields = 
                CustomerFieldService
                    .GetCustomerFieldsWithValue(Guid.Empty)
                    .Where(x => x.ShowInRegistration)
                    .ToList();

            _suggestions =
                AttachedModules.GetModules<ISuggestions>()
                    .Select(module => (ISuggestions)Activator.CreateInstance(module))
                    .FirstOrDefault();
        }
    }
}