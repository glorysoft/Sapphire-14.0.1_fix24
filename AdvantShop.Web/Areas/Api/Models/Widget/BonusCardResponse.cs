using AdvantShop.Core.Services.Api;

namespace AdvantShop.Areas.Api.Models.Widget
{
    public class BonusCardResponse: IApiResponse
    {
        public string color;
        public double? elevation;
        public object child;
        public string type;
    }
}