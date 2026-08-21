using AdvantShop.Core.Services.Api;
using AdvantShop.Core.Services.Bonuses.Internal.Model;
using System.Collections.Generic;

namespace AdvantShop.Areas.Api.Models.Bonuses
{
    public class GetGradesResponse : List<Grade>, IApiResponse
    {
        public GetGradesResponse(List<Grade> items)
        {
            this.AddRange(items);
        }
    }
}