using Newtonsoft.Json;

namespace AdvantShop.Core.Services.Crm.Vk.VkMarket.Models
{
    public class VkSaveProductPhotoResponse
    {
        [JsonProperty("photo_id")]
        public long PhotoId { get; set; }
    }
}