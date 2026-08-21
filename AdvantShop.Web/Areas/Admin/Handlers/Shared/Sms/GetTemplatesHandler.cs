using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Modules.Interfaces;
using AdvantShop.Core.Services.Smses;
using AdvantShop.Web.Infrastructure.Admin;
using AdvantShop.Web.Infrastructure.Handlers;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Localization;

namespace AdvantShop.Web.Admin.Handlers.Shared.Sms
{
    public class SmsTemplate : ISmsTemplate
    {
        public int Id { get; set; }
        public string Text { get; set; }
    }

    public class GetTemplatesHandler : ICommandHandler<FilterResult<ISmsTemplate>>
    {
        private readonly ISmsAndSocialMediaService _smsModule =
            SmsNotifier.GetActiveSmsModule() as ISmsAndSocialMediaService;

        private readonly SmsAnswerTemplateService _smsTemplateService = new SmsAnswerTemplateService();

        private List<ISmsTemplate> _templates = new List<ISmsTemplate>();

        private readonly BaseFilterModel _filter;

        public GetTemplatesHandler(BaseFilterModel filter)
        {
            _filter = filter;
        }


        public FilterResult<ISmsTemplate> Execute()
        {
            _templates.AddRange(_smsTemplateService
                .Gets(true)
                .Select(template => new SmsTemplate
                {
                    Id = template.TemplateId,
                    Text = template.Text,
                }));

            if (_smsModule != null)
                _templates.AddRange(_smsModule.GetTemplates());
            
            var count = _templates.Count;

            if (!string.IsNullOrEmpty(_filter.Search))
                _templates = _templates
                    .Where(template =>
                        template.Text != null
                        && template.Text.Contains(_filter.Search, StringComparison.OrdinalIgnoreCase))
                    .ToList();

            return new FilterResult<ISmsTemplate>
            {
                DataItems =
                    _templates
                        .Skip((_filter.Page - 1) * _filter.ItemsPerPage)
                        .Take(_filter.ItemsPerPage)
                        .ToList(),
                TotalItemsCount = count,
                TotalPageCount = (int)Math.Ceiling((double)count / _filter.ItemsPerPage),
                TotalString = LocalizationService.GetResourceFormat("Admin.Grid.FieldTotal", count)
            };
        }
    }
}