using System;
using System.Linq;
using AdvantShop.Catalog;
using AdvantShop.Core;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Web.Admin.Models.Catalog.SizeChart;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Catalog.SizeChart
{
    public class AddSizeChartHandler : ICommandHandler
    {
        private readonly SizeChartModel _model;

        public AddSizeChartHandler(SizeChartModel model)
        {
            _model = model;
        }

        public void Execute()
        {
            try
            {
                _model.Id = SizeChartService.Add(
                    new AdvantShop.Catalog.SizeChart
                    {
                        Enabled = _model.Enabled,
                        Name = _model.Name,
                        ModalHeader = _model.ModalHeader,
                        LinkText = _model.LinkText,
                        SourceType = _model.SourceType,
                        Text = _model.Text,
                        SortOrder = _model.SortOrder
                    });

                SizeChartService.ReplaceAllMapsInSizeChart(
                    _model.Id, 
                    _model.ProductIds, 
                    ESizeChartEntityType.Product);
                SizeChartService.ReplaceAllMapsInSizeChart(
                    _model.Id, 
                    _model.CategoryIds, 
                    ESizeChartEntityType.Category);
                SizeChartService.ReplaceSizeChartBrands(
                    _model.Id, 
                    _model.BrandIds);
                SizeChartService.ReplaceSizeChartPropertyValues(
                    _model.Id, 
                    _model.PropertyValues?
                        .Select(x => x.PropertyValueId)
                        .ToList());
            }
            catch (Exception)
            {
                throw new BlException(LocalizationService.GetResource("Admin.Catalog.SizeChart.AddError"));
            }
        }
    }
}