using System.IO;
using System.Web.Mvc;
using AdvantShop.Areas.Api.Attributes;
using AdvantShop.Areas.Api.Handlers.Metrics;
using AdvantShop.Areas.Api.Models.Metrics;
using AdvantShop.Web.Infrastructure.Filters;
using Newtonsoft.Json;

namespace AdvantShop.Areas.Api.Controllers
{
    [LogRequest, AuthApiKeyByUser, AuthUserApi, AntiInjection]
    public class MetricsController: BaseApiController
    {
        // POST metrics
        [HttpPost]
        public JsonResult Index()
        {
            MetricsDto model;
            
            Request.InputStream.Position = 0;
            using (var reader = new StreamReader(Request.InputStream))
            {
                var json = reader.ReadToEnd();
                model = JsonConvert.DeserializeObject<MetricsDto>(json);
            }
            
            return JsonApi(new MetricsApi(model));
        } 
    }
}